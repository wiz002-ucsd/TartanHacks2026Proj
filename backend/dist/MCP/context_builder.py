"""
Context Builder Module
======================
Queries MCP for raw data and assembles semantic student snapshots.
NO LLM calls here - this is purely data aggregation.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio


class AcademicContextBuilder:
    """Builds semantic snapshots from MCP queries (PostgREST only)."""

    def __init__(self, mcp_runner, credentials):
        """
        Initialize with MCP runner and credentials.

        Args:
            mcp_runner: DedalusRunner instance
            credentials: List of SecretValues for MCP authentication
        """
        self.runner = mcp_runner
        self.credentials = credentials
        self.model = "anthropic/claude-sonnet-4-20250514"
        self.mcp_server = "williamzhang121/mysupabase-mcp"

    async def _query_mcp(self, query: str) -> Any:
        """
        Execute a query through MCP and return the result.

        Args:
            query: Natural language query for MCP

        Returns:
            MCP response with data
        """
        response = await self.runner.run(
            input=query,
            model=self.model,
            mcp_servers=[self.mcp_server],
            credentials=self.credentials,
        )
        return response

    async def get_all_courses(self) -> List[Dict[str, Any]]:
        """
        Query MCP for all courses.

        MCP Query: SELECT * FROM courses

        Returns:
            List of course records
        """
        response = await self._query_mcp(
            "Get all courses from the courses table. Return all columns."
        )

        # Parse response to extract course data
        # The actual parsing depends on MCP response format
        return self._parse_courses_response(response)

    async def get_upcoming_events(self, days_ahead: int = 14) -> List[Dict[str, Any]]:
        """
        Query MCP for upcoming events (assignments, exams, etc.).

        MCP Query: SELECT * FROM events WHERE due_date >= today AND due_date <= today + N days

        Args:
            days_ahead: Number of days to look ahead

        Returns:
            List of event records
        """
        today = datetime.now().date()
        future_date = today + timedelta(days=days_ahead)

        response = await self._query_mcp(
            f"Get all events from the events table where due_date is between "
            f"'{today}' and '{future_date}'. Order by due_date ascending."
        )

        return self._parse_events_response(response)

    async def get_grading_breakdown(self) -> List[Dict[str, Any]]:
        """
        Query MCP for grading policies across all courses.

        MCP Query: SELECT * FROM grading_policies

        Returns:
            List of grading policy records
        """
        response = await self._query_mcp(
            "Get all grading policies from the grading_policies table. Include course_id, category, and weight."
        )

        return self._parse_grading_response(response)

    async def get_course_policies(self) -> List[Dict[str, Any]]:
        """
        Query MCP for course policies (late days, AI usage, etc.).

        MCP Query: SELECT * FROM course_policies

        Returns:
            List of course policy records
        """
        response = await self._query_mcp(
            "Get all course policies from the course_policies table."
        )

        return self._parse_policies_response(response)

    def _parse_courses_response(self, response) -> List[Dict[str, Any]]:
        """Extract course data from MCP response."""
        # This is a placeholder - actual parsing depends on MCP response format
        # For now, return mock structure based on schema
        try:
            output = response.final_output if hasattr(response, 'final_output') else str(response)
            # Extract structured data from response
            # This would parse the actual MCP tool results
            return []
        except Exception as e:
            print(f"Error parsing courses: {e}")
            return []

    def _parse_events_response(self, response) -> List[Dict[str, Any]]:
        """Extract event data from MCP response."""
        try:
            # Parse MCP response to extract events
            return []
        except Exception as e:
            print(f"Error parsing events: {e}")
            return []

    def _parse_grading_response(self, response) -> List[Dict[str, Any]]:
        """Extract grading policy data from MCP response."""
        try:
            return []
        except Exception as e:
            print(f"Error parsing grading policies: {e}")
            return []

    def _parse_policies_response(self, response) -> List[Dict[str, Any]]:
        """Extract course policy data from MCP response."""
        try:
            return []
        except Exception as e:
            print(f"Error parsing policies: {e}")
            return []

    async def build_student_snapshot(self) -> Dict[str, Any]:
        """
        Assemble a complete semantic snapshot of student's academic state.

        This is the main entry point. It:
        1. Queries MCP for all relevant data
        2. Aggregates and structures it semantically
        3. Performs basic analysis (no LLM)

        Returns:
            Semantic snapshot dictionary ready for LLM consumption
        """
        # Fetch all data in parallel
        courses, events, grading, policies = await asyncio.gather(
            self.get_all_courses(),
            self.get_upcoming_events(days_ahead=14),
            self.get_grading_breakdown(),
            self.get_course_policies()
        )

        # Build semantic snapshot
        snapshot = self._assemble_snapshot(courses, events, grading, policies)

        return snapshot

    def _assemble_snapshot(
        self,
        courses: List[Dict],
        events: List[Dict],
        grading: List[Dict],
        policies: List[Dict]
    ) -> Dict[str, Any]:
        """
        Assemble raw data into semantic snapshot.

        This is deterministic - no LLM calls, just data transformation.
        """
        today = datetime.now().date()

        # Analyze deadline clustering
        deadlines_by_week = {}
        for event in events:
            if event.get('due_date'):
                due_date = event['due_date']
                week_key = f"Week {(due_date - today).days // 7}"
                if week_key not in deadlines_by_week:
                    deadlines_by_week[week_key] = []
                deadlines_by_week[week_key].append(event)

        # Identify high-risk windows (3+ deadlines in same week)
        high_risk_weeks = {
            week: len(items)
            for week, items in deadlines_by_week.items()
            if len(items) >= 3
        }

        # Build course-level summaries
        course_summaries = []
        for course in courses:
            course_events = [
                e for e in events
                if e.get('course_id') == course.get('id')
            ]

            course_grading = [
                g for g in grading
                if g.get('course_id') == course.get('id')
            ]

            course_policy = next(
                (p for p in policies if p.get('course_id') == course.get('id')),
                None
            )

            summary = {
                "name": course.get('name', 'Unknown'),
                "code": course.get('code', 'Unknown'),
                "instructor": course.get('instructor'),
                "upcoming_count": len(course_events),
                "upcoming": [
                    {
                        "name": e.get('name'),
                        "type": e.get('type'),
                        "due_date": str(e.get('due_date')),
                        "days_until": (e.get('due_date') - today).days if e.get('due_date') else None,
                        "weight": e.get('weight')
                    }
                    for e in course_events[:5]  # Top 5 upcoming
                ],
                "grading_breakdown": [
                    {
                        "category": g.get('category'),
                        "weight": g.get('weight')
                    }
                    for g in course_grading
                ],
                "policies": {
                    "late_days_total": course_policy.get('late_days_total') if course_policy else None,
                    "genai_allowed": course_policy.get('genai_allowed') if course_policy else None,
                } if course_policy else None,
                "load_estimate": self._estimate_load(course_events)
            }
            course_summaries.append(summary)

        # Find highest priority items (nearest deadline with highest weight)
        priority_events = sorted(
            events,
            key=lambda e: (
                e.get('due_date', datetime.max.date()),
                -(e.get('weight', 0) or 0)
            )
        )[:3]

        # Assemble final snapshot
        snapshot = {
            "student_overview": {
                "active_courses": len(courses),
                "upcoming_deadlines": len(events),
                "high_risk_window": len(high_risk_weeks) > 0,
                "high_risk_weeks": list(high_risk_weeks.keys()),
                "snapshot_date": str(today)
            },
            "courses": course_summaries,
            "risk_analysis": {
                "deadline_clustering": len(high_risk_weeks) > 0,
                "clustered_weeks": {
                    week: count
                    for week, count in high_risk_weeks.items()
                },
                "highest_priority": [
                    {
                        "name": e.get('name'),
                        "type": e.get('type'),
                        "days_until": (e.get('due_date') - today).days if e.get('due_date') else None,
                        "weight": e.get('weight')
                    }
                    for e in priority_events
                ]
            },
            "timeline": {
                "next_7_days": [
                    e for e in events
                    if e.get('due_date') and (e['due_date'] - today).days <= 7
                ],
                "next_14_days": [
                    e for e in events
                    if e.get('due_date') and 7 < (e['due_date'] - today).days <= 14
                ]
            }
        }

        return snapshot

    def _estimate_load(self, events: List[Dict]) -> str:
        """
        Estimate course load based on upcoming events.

        Deterministic classification:
        - high: 3+ events in next 14 days
        - medium: 1-2 events in next 14 days
        - low: 0 events in next 14 days
        """
        if len(events) >= 3:
            return "high"
        elif len(events) >= 1:
            return "medium"
        else:
            return "low"
