#!/usr/bin/env python3
"""
Mastery Context Builder - Deterministic Learning-Aware Context Assembly
========================================================================
This module contains ZERO LLM logic. It:
1. Fetches raw data from Supabase via MCP
2. Computes learning signals (progress, risk flags, urgency)
3. Produces structured context for LLM reasoning

Design principle: Data → Context → LLM (strictly separated)
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any


class MasteryContextBuilder:
    """
    Assembles learning-aware context from raw database queries.
    Contains NO LLM calls - only deterministic computation.
    """

    def __init__(self, current_date: Optional[datetime] = None):
        """
        Args:
            current_date: Override current date (useful for testing)
        """
        self.current_date = current_date or datetime.now().date()

    def build_learning_context(
        self,
        courses_data: List[Dict],
        topics_data: List[Dict],
        mastery_data: List[Dict],
        assignments_data: List[Dict],
        quizzes_data: List[Dict],
        events_data: List[Dict]  # Original events from your schema
    ) -> Dict[str, Any]:
        """
        Main entry point: transforms raw database rows into learning-aware context.

        Args:
            courses_data: Raw course records (id, name, term, semester_start, semester_end)
            topics_data: Raw topic records (id, course_id, name)
            mastery_data: Raw mastery records (student_id, topic_id, mastery_score, last_updated)
            assignments_data: Raw assignment records (id, course_id, topic_id, due_date, weight, type)
            quizzes_data: Raw quiz records (id, topic_id, scheduled_date)
            events_data: Your existing events table data

        Returns:
            Learning-aware context snapshot (dict)
        """

        # Build lookup maps for efficient access
        topic_by_id = {t['id']: t for t in topics_data}
        mastery_by_topic = {m['topic_id']: m for m in mastery_data}
        topics_by_course = self._group_topics_by_course(topics_data)

        # Compute per-course context
        courses_context = []
        for course in courses_data:
            course_ctx = self._build_course_context(
                course=course,
                topics=topics_by_course.get(course['id'], []),
                mastery_by_topic=mastery_by_topic,
                assignments_data=assignments_data,
                quizzes_data=quizzes_data,
                events_data=events_data
            )
            courses_context.append(course_ctx)

        # Compute semester-wide progress
        semester_progress = self._compute_overall_progress(courses_data)

        # Detect learning risks
        risk_flags = self._detect_risk_flags(courses_context)

        # Assemble final context
        return {
            'metadata': {
                'current_date': str(self.current_date),
                'context_version': '1.0',
                'builder': 'deterministic'
            },
            'semester_progress': semester_progress,
            'courses': courses_context,
            'risk_flags': risk_flags,
            'summary_stats': self._compute_summary_stats(courses_context)
        }

    def _build_course_context(
        self,
        course: Dict,
        topics: List[Dict],
        mastery_by_topic: Dict,
        assignments_data: List[Dict],
        quizzes_data: List[Dict],
        events_data: List[Dict]
    ) -> Dict[str, Any]:
        """
        Build learning context for a single course.
        """
        course_id = course['id']

        # Compute course progress (temporal)
        semester_start = self._parse_date(course.get('semester_start'))
        semester_end = self._parse_date(course.get('semester_end'))
        course_progress = self._compute_course_progress(semester_start, semester_end)

        # Build topic-level context
        topics_context = []
        for topic in topics:
            topic_id = topic['id']
            mastery_record = mastery_by_topic.get(topic_id, {})
            mastery_score = mastery_record.get('mastery_score', 0.0)

            # Find next assessment for this topic
            next_assessment = self._find_next_assessment(
                topic_id=topic_id,
                assignments=assignments_data,
                quizzes=quizzes_data,
                events=events_data
            )

            # Compute topic urgency
            urgency = self._compute_topic_urgency(
                mastery_score=mastery_score,
                next_assessment=next_assessment,
                current_date=self.current_date
            )

            topics_context.append({
                'topic_id': topic_id,
                'topic_name': topic['name'],
                'mastery_score': mastery_score,
                'mastery_level': self._mastery_to_level(mastery_score),
                'last_updated': mastery_record.get('last_updated'),
                'next_assessment': next_assessment,
                'urgency': urgency,
                'recommended_action': self._recommend_topic_action(mastery_score, urgency)
            })

        # Compute course-level risk
        course_risk = self._compute_course_risk(topics_context, course_progress)

        return {
            'course_id': course_id,
            'course_name': course['name'],
            'course_code': course.get('code', 'N/A'),
            'semester_progress': course_progress,
            'topics': topics_context,
            'risk_level': course_risk,
            'average_mastery': self._compute_average_mastery(topics_context)
        }

    def _compute_course_progress(
        self,
        semester_start: Optional[datetime],
        semester_end: Optional[datetime]
    ) -> float:
        """
        Compute how far into the semester we are (0.0 = start, 1.0 = end).
        """
        if not semester_start or not semester_end:
            return 0.5  # Default if dates missing

        total_days = (semester_end - semester_start).days
        if total_days <= 0:
            return 0.5

        elapsed_days = (self.current_date - semester_start.date()).days
        progress = max(0.0, min(1.0, elapsed_days / total_days))
        return round(progress, 2)

    def _compute_overall_progress(self, courses_data: List[Dict]) -> float:
        """
        Compute semester-wide progress (average across courses).
        """
        if not courses_data:
            return 0.0

        progress_values = []
        for course in courses_data:
            start = self._parse_date(course.get('semester_start'))
            end = self._parse_date(course.get('semester_end'))
            if start and end:
                progress = self._compute_course_progress(start, end)
                progress_values.append(progress)

        return round(sum(progress_values) / len(progress_values), 2) if progress_values else 0.0

    def _find_next_assessment(
        self,
        topic_id: int,
        assignments: List[Dict],
        quizzes: List[Dict],
        events: List[Dict]
    ) -> Optional[Dict[str, Any]]:
        """
        Find the next upcoming assessment for a topic.
        Returns dict with type, date, days_until, weight.
        """
        upcoming_assessments = []

        # Check assignments linked to topic
        for assignment in assignments:
            if assignment.get('topic_id') == topic_id:
                due_date = self._parse_date(assignment.get('due_date'))
                if due_date and due_date >= self.current_date:
                    days_until = (due_date - self.current_date).days
                    upcoming_assessments.append({
                        'type': assignment.get('type', 'assignment'),
                        'name': assignment.get('name', 'Assignment'),
                        'date': str(due_date),
                        'days_until': days_until,
                        'weight': assignment.get('weight', 0)
                    })

        # Check quizzes linked to topic
        for quiz in quizzes:
            if quiz.get('topic_id') == topic_id:
                quiz_date = self._parse_date(quiz.get('scheduled_date'))
                if quiz_date and quiz_date >= self.current_date:
                    days_until = (quiz_date - self.current_date).days
                    upcoming_assessments.append({
                        'type': 'quiz',
                        'name': quiz.get('name', 'Quiz'),
                        'date': str(quiz_date),
                        'days_until': days_until,
                        'weight': quiz.get('weight', 10)
                    })

        # Also check events that might be tagged with topics
        for event in events:
            if event.get('topic_id') == topic_id:
                event_date = self._parse_date(event.get('due_date'))
                if event_date and event_date >= self.current_date:
                    days_until = (event_date - self.current_date).days
                    upcoming_assessments.append({
                        'type': event.get('type', 'event'),
                        'name': event.get('name', 'Event'),
                        'date': str(event_date),
                        'days_until': days_until,
                        'weight': event.get('weight', 0)
                    })

        # Return the soonest assessment
        if upcoming_assessments:
            return min(upcoming_assessments, key=lambda x: x['days_until'])
        return None

    def _compute_topic_urgency(
        self,
        mastery_score: float,
        next_assessment: Optional[Dict],
        current_date: datetime
    ) -> str:
        """
        Compute urgency level for a topic based on mastery vs assessment proximity.
        Returns: 'critical', 'high', 'medium', 'low'
        """
        if not next_assessment:
            # No upcoming assessment
            if mastery_score < 0.5:
                return 'medium'  # Low mastery but no pressure
            return 'low'

        days_until = next_assessment['days_until']
        weight = next_assessment.get('weight', 0)

        # Critical: low mastery + imminent high-weight assessment
        if mastery_score < 0.5 and days_until <= 3 and weight >= 15:
            return 'critical'

        # High: low mastery + soon assessment OR high-weight assessment close
        if (mastery_score < 0.5 and days_until <= 7) or (days_until <= 5 and weight >= 20):
            return 'high'

        # Medium: moderate mastery with upcoming assessment
        if mastery_score < 0.7 and days_until <= 10:
            return 'medium'

        return 'low'

    def _recommend_topic_action(self, mastery_score: float, urgency: str) -> str:
        """
        Deterministically recommend an action based on mastery and urgency.
        This is NOT the LLM recommendation - just a signal for the LLM to interpret.
        """
        if urgency == 'critical':
            return 'urgent_reinforcement'
        elif urgency == 'high':
            if mastery_score < 0.4:
                return 'foundational_review'
            else:
                return 'active_recall_practice'
        elif urgency == 'medium':
            if mastery_score < 0.6:
                return 'spaced_practice'
            else:
                return 'refinement'
        else:  # low urgency
            if mastery_score < 0.7:
                return 'gradual_improvement'
            else:
                return 'maintain_and_advance'

    def _compute_course_risk(self, topics_context: List[Dict], course_progress: float) -> str:
        """
        Compute overall risk level for a course.
        """
        critical_count = sum(1 for t in topics_context if t['urgency'] == 'critical')
        high_count = sum(1 for t in topics_context if t['urgency'] == 'high')
        avg_mastery = self._compute_average_mastery(topics_context)

        # Late semester + low mastery + critical topics = high risk
        if course_progress > 0.7 and avg_mastery < 0.5 and critical_count > 0:
            return 'high'

        if critical_count > 0 or (high_count >= 2 and avg_mastery < 0.6):
            return 'elevated'

        if high_count > 0 or avg_mastery < 0.7:
            return 'moderate'

        return 'low'

    def _detect_risk_flags(self, courses_context: List[Dict]) -> Dict[str, bool]:
        """
        Detect specific learning risk patterns across all courses.
        """
        all_topics = [topic for course in courses_context for topic in course['topics']]

        # Flag 1: Low mastery near high-weight deadline
        low_mastery_high_weight = any(
            t['mastery_score'] < 0.5 and
            t.get('next_assessment') and
            t['next_assessment']['days_until'] <= 7 and
            t['next_assessment']['weight'] >= 15
            for t in all_topics
        )

        # Flag 2: Deadline pressure (3+ assessments in next 7 days)
        upcoming_assessments = [
            t for t in all_topics
            if t.get('next_assessment') and t['next_assessment']['days_until'] <= 7
        ]
        deadline_pressure = len(upcoming_assessments) >= 3

        # Flag 3: Stagnant mastery (no updates in 14+ days)
        stagnant_topics = any(
            t.get('last_updated') and
            (self.current_date - self._parse_date(t['last_updated']).date()).days > 14
            for t in all_topics if t.get('last_updated')
        )

        # Flag 4: Late semester with low overall mastery
        overall_progress = sum(c['semester_progress'] for c in courses_context) / len(courses_context) if courses_context else 0
        overall_mastery = sum(c['average_mastery'] for c in courses_context) / len(courses_context) if courses_context else 0
        late_semester_low_mastery = overall_progress > 0.7 and overall_mastery < 0.6

        return {
            'low_mastery_high_weight': low_mastery_high_weight,
            'deadline_pressure': deadline_pressure,
            'stagnant_mastery': stagnant_topics,
            'late_semester_low_mastery': late_semester_low_mastery
        }

    def _compute_summary_stats(self, courses_context: List[Dict]) -> Dict[str, Any]:
        """
        Compute aggregate statistics across all courses.
        """
        all_topics = [topic for course in courses_context for topic in course['topics']]

        if not all_topics:
            return {
                'total_topics': 0,
                'average_mastery': 0.0,
                'topics_needing_attention': 0,
                'critical_topics': 0
            }

        return {
            'total_topics': len(all_topics),
            'average_mastery': round(sum(t['mastery_score'] for t in all_topics) / len(all_topics), 2),
            'topics_needing_attention': sum(1 for t in all_topics if t['mastery_score'] < 0.7),
            'critical_topics': sum(1 for t in all_topics if t['urgency'] == 'critical'),
            'high_urgency_topics': sum(1 for t in all_topics if t['urgency'] in ['critical', 'high'])
        }

    # === Helper Methods ===

    def _group_topics_by_course(self, topics: List[Dict]) -> Dict[int, List[Dict]]:
        """Group topics by course_id."""
        result = {}
        for topic in topics:
            course_id = topic.get('course_id')
            if course_id:
                result.setdefault(course_id, []).append(topic)
        return result

    def _compute_average_mastery(self, topics_context: List[Dict]) -> float:
        """Compute average mastery across topics."""
        if not topics_context:
            return 0.0
        return round(sum(t['mastery_score'] for t in topics_context) / len(topics_context), 2)

    def _mastery_to_level(self, score: float) -> str:
        """Convert numeric mastery to human-readable level."""
        if score >= 0.9:
            return 'expert'
        elif score >= 0.75:
            return 'proficient'
        elif score >= 0.6:
            return 'developing'
        elif score >= 0.4:
            return 'emerging'
        else:
            return 'foundational'

    def _parse_date(self, date_str: Any) -> Optional[datetime]:
        """Parse date string to datetime object."""
        if not date_str:
            return None
        if isinstance(date_str, datetime):
            return date_str
        try:
            return datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
        except:
            return None


# === Future-Proof Mastery Update Hooks (Stubs) ===

def update_mastery_from_quiz(
    student_id: int,
    topic_id: int,
    quiz_result: Dict[str, Any],
    supabase_client: Any
) -> bool:
    """
    Update mastery score based on quiz performance.

    STUB: Design for future implementation when quiz system is ready.

    Args:
        student_id: Student identifier
        topic_id: Topic being assessed
        quiz_result: Dict with keys like:
            - score: float (0.0-1.0 or percentage)
            - difficulty: str ('easy', 'medium', 'hard')
            - time_taken: int (seconds)
            - attempt_number: int
        supabase_client: Supabase client for updates

    Returns:
        bool: Success status

    Future implementation should:
    1. Weight recent performance higher (recency bias)
    2. Adjust based on difficulty
    3. Consider attempt history
    4. Update topic_mastery table
    """
    # TODO: Implement when quiz system exists
    # Example logic:
    # new_mastery = compute_weighted_mastery(current, quiz_result)
    # supabase_client.table('topic_mastery').upsert({
    #     'student_id': student_id,
    #     'topic_id': topic_id,
    #     'mastery_score': new_mastery,
    #     'last_updated': datetime.now()
    # })
    pass


def update_mastery_from_flashcards(
    student_id: int,
    topic_id: int,
    flashcard_session: Dict[str, Any],
    supabase_client: Any
) -> bool:
    """
    Update mastery score based on flashcard practice session.

    STUB: Design for future implementation when flashcard system is ready.

    Args:
        student_id: Student identifier
        topic_id: Topic being practiced
        flashcard_session: Dict with keys like:
            - cards_reviewed: int
            - correct_count: int
            - confidence_ratings: List[int] (1-5 scale)
            - session_duration: int (seconds)
        supabase_client: Supabase client for updates

    Returns:
        bool: Success status

    Future implementation should:
    1. Use spaced repetition intervals
    2. Weight confidence self-reports
    3. Track improvement trajectory
    4. Update topic_mastery table
    """
    # TODO: Implement when flashcard system exists
    # Example logic:
    # confidence_avg = sum(confidence_ratings) / len(confidence_ratings)
    # accuracy = correct_count / cards_reviewed
    # new_mastery = blend_mastery_signals(current, accuracy, confidence_avg)
    # supabase_client.table('topic_mastery').upsert({
    #     'student_id': student_id,
    #     'topic_id': topic_id,
    #     'mastery_score': new_mastery,
    #     'last_updated': datetime.now()
    # })
    pass
