#!/usr/bin/env python3
"""
Mastery-Aware AI Prompt Template
=================================
Instructs the LLM how to interpret mastery context and generate
student-facing learning recommendations.

This file contains ONLY prompt engineering - no data fetching or context building.
"""

from typing import Dict, Any


def build_mastery_aware_prompt(learning_context: Dict[str, Any]) -> str:
    """
    Constructs the full prompt for the LLM, including:
    1. System instructions (how to interpret mastery)
    2. Learning context (structured data from context builder)
    3. Output format requirements

    Args:
        learning_context: Output from MasteryContextBuilder.build_learning_context()

    Returns:
        str: Complete prompt for LLM
    """

    system_instructions = _get_system_instructions()
    context_section = _format_context_section(learning_context)
    output_guidelines = _get_output_guidelines()

    prompt = f"""{system_instructions}

{context_section}

{output_guidelines}
"""

    return prompt


def _get_system_instructions() -> str:
    """
    Core instructions for how the LLM should reason about mastery and learning.
    """
    return """You are an AI academic advisor specialized in learning science and personalized study planning.

## Your Core Principles:

1. **Mastery Interpretation**:
   - Mastery score 0.0-1.0 represents true understanding, NOT just exposure
   - Score < 0.4: Foundational gaps, needs ground-up review
   - Score 0.4-0.6: Emerging understanding, needs reinforcement
   - Score 0.6-0.75: Developing competence, needs practice
   - Score 0.75-0.9: Proficient, needs refinement
   - Score > 0.9: Expert-level mastery

2. **Time-Aware Planning**:
   - NEVER recommend cramming when time allows spaced practice
   - If assessment is 7+ days away and mastery < 0.6, recommend distributed practice
   - If assessment is 3-7 days away and mastery < 0.5, prioritize active recall
   - If assessment is < 3 days away and mastery < 0.5, recommend urgent triage (focus on highest-yield topics)

3. **Weight-Aware Prioritization**:
   - High-weight assessments (>20%) with low mastery (<0.5) are CRITICAL
   - Prioritize mastery-building for high-stakes assessments over busywork
   - If multiple topics compete, rank by: (1 - mastery) × weight × urgency

4. **Learning Science**:
   - Active recall > passive review
   - Spaced repetition > massed practice
   - Interleaving > blocking (when appropriate)
   - Testing effect: practice problems > re-reading
   - Elaboration: explain concepts in own words

5. **Supportive Tone**:
   - Be honest about challenges without being discouraging
   - Frame low mastery as "opportunity for growth," not failure
   - Acknowledge progress explicitly
   - Provide concrete, actionable next steps
   - Use "you're building understanding" language, not "you're behind"

## What to AVOID:

❌ Recommending passive review (re-reading notes) for low mastery
❌ Suggesting "just study more" without specific strategies
❌ Ignoring low mastery topics that have upcoming high-weight assessments
❌ Recommending cramming when distributed practice is possible
❌ Being judgmental or creating anxiety
❌ Giving vague advice like "focus on weak areas" (be specific)
"""


def _format_context_section(learning_context: Dict[str, Any]) -> str:
    """
    Format the learning context into a structured section for the LLM.
    """
    metadata = learning_context.get('metadata', {})
    semester_progress = learning_context.get('semester_progress', 0.0)
    courses = learning_context.get('courses', [])
    risk_flags = learning_context.get('risk_flags', {})
    summary_stats = learning_context.get('summary_stats', {})

    # Build context string
    context = f"""## Student Learning Context

**Current Date**: {metadata.get('current_date', 'Unknown')}
**Semester Progress**: {semester_progress * 100:.0f}% complete

### Overall Statistics:
- Total Topics Tracked: {summary_stats.get('total_topics', 0)}
- Average Mastery: {summary_stats.get('average_mastery', 0.0):.2f}
- Topics Needing Attention: {summary_stats.get('topics_needing_attention', 0)}
- Critical Urgency Topics: {summary_stats.get('critical_topics', 0)}

### Active Risk Flags:
"""

    # Add risk flags if any are active
    active_risks = [k for k, v in risk_flags.items() if v]
    if active_risks:
        for risk in active_risks:
            risk_label = risk.replace('_', ' ').title()
            context += f"- ⚠️ **{risk_label}**\n"
    else:
        context += "- ✅ No critical risk flags detected\n"

    # Add per-course details
    context += "\n### Course-by-Course Breakdown:\n\n"

    for course in courses:
        context += f"""#### {course['course_code']}: {course['course_name']}
- **Semester Progress**: {course['semester_progress'] * 100:.0f}%
- **Average Mastery**: {course['average_mastery']:.2f}
- **Risk Level**: {course['risk_level']}

**Topics**:
"""
        for topic in course['topics']:
            mastery_bar = _create_mastery_bar(topic['mastery_score'])
            assessment_info = ""
            if topic.get('next_assessment'):
                assess = topic['next_assessment']
                assessment_info = f" → Next: {assess['name']} in {assess['days_until']} days ({assess['weight']}%)"

            context += f"""  • **{topic['topic_name']}**
    - Mastery: {mastery_bar} {topic['mastery_score']:.2f} ({topic['mastery_level']}){assessment_info}
    - Urgency: {topic['urgency']}
    - Signal: {topic['recommended_action']}
"""

        context += "\n"

    return context


def _get_output_guidelines() -> str:
    """
    Instructions for how the LLM should structure its response.
    """
    return """## Your Task:

Generate a comprehensive, supportive study plan for the next 3-7 days that:

1. **Acknowledges Current State**:
   - Reference semester progress explicitly
   - Acknowledge mastery levels honestly but supportively
   - Highlight any progress since last update (if applicable)

2. **Identifies Priorities**:
   - List 2-4 topics that need immediate attention
   - Explain WHY each is prioritized (low mastery + upcoming assessment, high weight, etc.)
   - Rank by urgency-weighted value

3. **Provides Specific Actions**:
   - For each priority topic, suggest:
     * Specific learning strategy (active recall, practice problems, concept mapping, etc.)
     * Time allocation (e.g., "30 mins daily for 5 days")
     * Concrete milestones to check understanding
   - Example: "For Convolution, spend 20 minutes daily doing practice problems (not re-reading notes). After each session, explain the process out loud without looking at notes."

4. **Balances Workload**:
   - Don't overwhelm with too many topics
   - If deadline pressure is high, acknowledge it and suggest triage
   - If time allows, recommend spaced practice over cramming

5. **Closes Supportively**:
   - Reinforce that mastery builds over time
   - Provide 1-2 study tips aligned with learning science
   - Encourage checking in after completing recommended actions

## Output Format:

### Summary
[2-3 sentences about overall academic state, referencing semester progress and mastery trends]

### Priority Topics
[Ranked list of 2-4 topics with explanations]

### Recommended Study Plan (Next 3-7 Days)
[Detailed, day-by-day or topic-by-topic breakdown with specific strategies]

### Study Tips
[2-3 evidence-based study tips relevant to this student's situation]

Remember: Your goal is to be helpful, specific, and encouraging. The student trusts you to guide their learning efficiently.
"""


def _create_mastery_bar(score: float) -> str:
    """
    Create a visual mastery bar for display.
    Example: [████░░░░░░] for 40% mastery
    """
    filled = int(score * 10)
    empty = 10 - filled
    return f"[{'█' * filled}{'░' * empty}]"


# === Example Usage ===

def example_usage():
    """
    Demonstrates how to use this module in the AI advisor pipeline.
    """
    from mastery_context_builder import MasteryContextBuilder

    # Step 1: Build context (deterministic, no LLM)
    builder = MasteryContextBuilder()

    # Assume we've fetched data from Supabase via MCP
    courses_data = [...]  # from MCP query
    topics_data = [...]  # from MCP query
    mastery_data = [...]  # from MCP query
    # ... etc

    learning_context = builder.build_learning_context(
        courses_data=courses_data,
        topics_data=topics_data,
        mastery_data=mastery_data,
        assignments_data=[...],
        quizzes_data=[...],
        events_data=[...]
    )

    # Step 2: Build prompt (template)
    prompt = build_mastery_aware_prompt(learning_context)

    # Step 3: Send to LLM (reasoning layer)
    # llm_response = openai.chat.completions.create(
    #     model="gpt-4",
    #     messages=[{"role": "user", "content": prompt}]
    # )

    # Step 4: Return student-facing output
    # return llm_response.choices[0].message.content


if __name__ == "__main__":
    print("Mastery-Aware Prompt Template Module")
    print("This module generates prompts for LLM reasoning.")
    print("See example_usage() for integration pattern.")
