#!/usr/bin/env python3
"""
Complete End-to-End Example: Mastery-Aware AI Advisor
=====================================================
This demonstrates the full integration of the mastery tracking system
with your existing MCP + AI advisor architecture.
"""

import asyncio
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Import the new mastery modules
from mastery_context_builder import MasteryContextBuilder
from mastery_prompt_template import build_mastery_aware_prompt

# Import existing infrastructure
from dedalus_labs import AsyncDedalus, DedalusRunner
from connection import supabase_mcp_secrets
from ai_advisor import AcademicAIAdvisor  # Your existing AI advisor

load_dotenv()


async def fetch_data_via_mcp(runner: 'DedalusRunner') -> dict:
    """
    Step 1: Fetch ALL required data from Supabase via MCP.
    This includes original tables + new mastery-related tables.

    Returns:
        dict with keys: courses, topics, mastery, assignments, quizzes, events
    """

    today = datetime.now().date()
    future_date = today + timedelta(days=30)  # Look ahead 30 days

    print("📊 Fetching data from Supabase via MCP...")

    # Query 1: Courses
    print("  → Querying courses...")
    courses_response = await runner.run(
        input="Select all columns from the courses table",
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )
    courses_data = parse_mcp_output(courses_response)

    # Query 2: Topics
    print("  → Querying topics...")
    topics_response = await runner.run(
        input="Select all columns from the topics table",
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )
    topics_data = parse_mcp_output(topics_response)

    # Query 3: Topic Mastery (NEW)
    print("  → Querying topic_mastery...")
    mastery_response = await runner.run(
        input="Select all columns from the topic_mastery table",
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )
    mastery_data = parse_mcp_output(mastery_response)

    # Query 4: Assignments
    print("  → Querying assignments...")
    assignments_response = await runner.run(
        input=f"Select all columns from the assignments table where due_date >= '{today}'",
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )
    assignments_data = parse_mcp_output(assignments_response)

    # Query 5: Quizzes (NEW)
    print("  → Querying quizzes...")
    quizzes_response = await runner.run(
        input=f"Select all columns from the quizzes table where scheduled_date >= '{today}'",
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )
    quizzes_data = parse_mcp_output(quizzes_response)

    # Query 6: Events (existing)
    print("  → Querying events...")
    events_response = await runner.run(
        input=f"Select all columns from the events table where due_date >= '{today}'",
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )
    events_data = parse_mcp_output(events_response)

    print(f"✅ Data fetched: {len(courses_data)} courses, {len(topics_data)} topics, "
          f"{len(mastery_data)} mastery records\n")

    return {
        'courses': courses_data,
        'topics': topics_data,
        'mastery': mastery_data,
        'assignments': assignments_data,
        'quizzes': quizzes_data,
        'events': events_data
    }


def parse_mcp_output(mcp_response) -> list:
    """
    Parse MCP response to extract data.
    (Reuse your existing parse_mcp_output from get_ai_advisor.py)
    """
    results = []

    if hasattr(mcp_response, 'mcp_results') and mcp_response.mcp_results:
        for mcp_result in mcp_response.mcp_results:
            if hasattr(mcp_result, 'result') and isinstance(mcp_result.result, dict):
                result_data = mcp_result.result

                if 'success' in result_data and result_data.get('success'):
                    if 'data' in result_data and isinstance(result_data['data'], list):
                        results.extend(result_data['data'])

    return results


async def generate_mastery_aware_advice():
    """
    Complete end-to-end flow:
    1. Fetch data via MCP (PostgREST)
    2. Build learning context (deterministic)
    3. Generate LLM prompt
    4. Get AI reasoning
    5. Return student-facing advice
    """

    print("=" * 70)
    print("Mastery-Aware AI Academic Advisor - End-to-End Flow")
    print("=" * 70)
    print()

    # Initialize MCP client
    client = AsyncDedalus(
        api_key=os.getenv("DEDALUS_API_KEY"),
        base_url=os.getenv("DEDALUS_API_URL"),
        as_base_url=os.getenv("DEDALUS_AS_URL"),
    )
    runner = DedalusRunner(client)

    # === STEP 1: Data Fetching (MCP Layer) ===
    print("STEP 1: DATA FETCHING via MCP")
    print("-" * 70)
    data = await fetch_data_via_mcp(runner)

    # === STEP 2: Context Assembly (Deterministic Intelligence) ===
    print("STEP 2: CONTEXT ASSEMBLY (Deterministic)")
    print("-" * 70)
    print("🧠 Building learning-aware context...")

    builder = MasteryContextBuilder()
    learning_context = builder.build_learning_context(
        courses_data=data['courses'],
        topics_data=data['topics'],
        mastery_data=data['mastery'],
        assignments_data=data['assignments'],
        quizzes_data=data['quizzes'],
        events_data=data['events']
    )

    print(f"✅ Context built:")
    print(f"   - Semester progress: {learning_context['semester_progress'] * 100:.0f}%")
    print(f"   - Total topics: {learning_context['summary_stats']['total_topics']}")
    print(f"   - Average mastery: {learning_context['summary_stats']['average_mastery']:.2f}")
    print(f"   - Critical topics: {learning_context['summary_stats']['critical_topics']}")
    print(f"   - Risk flags: {sum(learning_context['risk_flags'].values())} active")
    print()

    # === STEP 3: Prompt Engineering ===
    print("STEP 3: PROMPT ENGINEERING")
    print("-" * 70)
    print("📝 Building mastery-aware LLM prompt...")

    prompt = build_mastery_aware_prompt(learning_context)

    print(f"✅ Prompt built ({len(prompt)} characters)")
    print(f"   Preview: {prompt[:200]}...")
    print()

    # === STEP 4: LLM Reasoning ===
    print("STEP 4: LLM REASONING")
    print("-" * 70)
    print("🤖 Sending to OpenAI GPT-4...")

    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        print("⚠️  No OpenAI key - using mock response")
        advice = generate_mock_advice(learning_context)
    else:
        advisor = AcademicAIAdvisor(api_key=openai_key)
        # Note: You'll need to update AcademicAIAdvisor to accept custom prompts
        # For now, we'll use a simplified call
        advice = advisor.generate_from_prompt(prompt)

    print("✅ AI response generated")
    print()

    # === STEP 5: Student-Facing Output ===
    print("STEP 5: STUDENT-FACING OUTPUT")
    print("-" * 70)
    print(advice)
    print()

    # === Final Package ===
    return {
        'context': learning_context,
        'advice': advice,
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'system_version': '1.0-mastery-aware'
        }
    }


def generate_mock_advice(learning_context: dict) -> str:
    """
    Generate mock advice when OpenAI is not available.
    Shows the expected output format.
    """
    progress_pct = learning_context['semester_progress'] * 100
    stats = learning_context['summary_stats']

    return f"""### Summary

You're {progress_pct:.0f}% through the semester, and your overall mastery is developing well at {stats['average_mastery']:.2f}. However, {stats['topics_needing_attention']} topics need focused attention this week to stay on track with upcoming assessments.

### Priority Topics

1. **[Topic Name]** - HIGH URGENCY
   Why: Mastery at 35% (foundational level) with quiz in 5 days
   Impact: 15% of final grade - needs immediate reinforcement

2. **[Another Topic]** - MEDIUM URGENCY
   Why: Mastery at 52% with homework due in 9 days
   Impact: Builds on previous concepts

### Recommended Study Plan (Next 3-7 Days)

**Days 1-3: Priority Topic Intensive**
- 45 mins daily: Active recall practice (not passive review)
- Work through 5-7 practice problems each session
- Goal: Reach 60% mastery before assessment

**Days 4-7: Distributed Practice**
- 30 mins every other day on secondary topics
- Create concept maps to link ideas
- Goal: Maintain progress across all topics

### Study Tips

1. **Active Recall**: Close your notes and work problems from memory
2. **Spaced Practice**: Distribute study over multiple days vs cramming
3. **Check Understanding**: After each session, teach the concept out loud

Keep building understanding - you're making real progress! 🚀
"""


def print_sample_context(learning_context: dict):
    """
    Pretty-print a sample learning context for debugging/demo.
    """
    print("\n" + "=" * 70)
    print("SAMPLE LEARNING CONTEXT")
    print("=" * 70)
    print(json.dumps(learning_context, indent=2))
    print()


# === Main Execution ===

async def main():
    """
    Run the complete end-to-end example.
    """
    try:
        result = await generate_mastery_aware_advice()

        # Optionally save to file for review
        with open('/tmp/mastery_advisor_output.json', 'w') as f:
            json.dump(result, f, indent=2, default=str)

        print("=" * 70)
        print("✅ COMPLETE - Output saved to /tmp/mastery_advisor_output.json")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║  Mastery-Aware AI Academic Advisor - Integration Example            ║
║                                                                      ║
║  This demonstrates the complete flow:                                ║
║    MCP → Context Builder → Prompt Template → LLM → Student Output   ║
╚══════════════════════════════════════════════════════════════════════╝
    """)

    asyncio.run(main())
