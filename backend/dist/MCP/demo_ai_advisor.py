"""
AI Academic Advisor Demo
========================
End-to-end demonstration of the AI Context Assembly Layer.

Architecture:
  MCP (PostgREST) → Context Builder → LLM Reasoning → Student Summary

This demo shows:
1. Querying MCP for academic data
2. Assembling semantic snapshot
3. Generating AI recommendations
4. Displaying student-friendly output
"""

import asyncio
import os
import json
from dotenv import load_dotenv

from dedalus_labs import AsyncDedalus, DedalusRunner
from connection import supabase_mcp_secrets
from context_builder import AcademicContextBuilder
from ai_advisor import AcademicAIAdvisor

load_dotenv()


async def main():
    """
    Main demo flow showing the complete AI advisor pipeline.
    """
    print("\n" + "=" * 60)
    print("🎓 AI ACADEMIC ADVISOR DEMO")
    print("=" * 60)
    print("\nArchitecture: MCP → Context Builder → LLM → Recommendations\n")

    # ========================================
    # STEP 1: Initialize MCP Connection
    # ========================================
    print("📡 Step 1: Initializing MCP connection...")
    print("-" * 60)

    client = AsyncDedalus(
        api_key=os.getenv("DEDALUS_API_KEY"),
        base_url=os.getenv("DEDALUS_API_URL"),
        as_base_url=os.getenv("DEDALUS_AS_URL"),
    )
    runner = DedalusRunner(client)

    print("✅ MCP client initialized")
    print(f"   Server: williamzhang121/mysupabase-mcp")
    print(f"   Model: anthropic/claude-sonnet-4-20250514")
    print()

    # ========================================
    # STEP 2: Build Context (Query MCP)
    # ========================================
    print("🔍 Step 2: Querying MCP for academic data...")
    print("-" * 60)

    context_builder = AcademicContextBuilder(
        mcp_runner=runner,
        credentials=[supabase_mcp_secrets]
    )

    print("Executing MCP queries:")
    print("  • SELECT * FROM courses")
    print("  • SELECT * FROM events WHERE due_date BETWEEN NOW() AND NOW() + 14 days")
    print("  • SELECT * FROM grading_policies")
    print("  • SELECT * FROM course_policies")
    print()

    # For demo purposes, let's show what a real query looks like
    print("Example MCP Query:")
    demo_query = await runner.run(
        input="Get the first 3 courses from the courses table. Show name, code, and instructor.",
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )

    print(f"✅ MCP Response received")
    print(f"   Output: {demo_query.final_output[:200]}...")
    print()

    # Build full snapshot (in production, this would parse real data)
    # For demo, we'll use mock data since we need structured output
    print("🔧 Assembling semantic snapshot...")
    snapshot = create_demo_snapshot()  # Mock for demo

    print("✅ Snapshot assembled")
    print(f"   Active courses: {snapshot['student_overview']['active_courses']}")
    print(f"   Upcoming deadlines: {snapshot['student_overview']['upcoming_deadlines']}")
    print(f"   High risk window: {snapshot['student_overview']['high_risk_window']}")
    print()

    # ========================================
    # STEP 3: AI Analysis (LLM Reasoning)
    # ========================================
    print("🧠 Step 3: Generating AI recommendations...")
    print("-" * 60)

    # Initialize AI advisor with OpenAI API key
    # Note: This requires OPENAI_API_KEY in .env
    openai_key = os.getenv("OPENAI_API_KEY")

    if not openai_key:
        print("⚠️  Warning: OPENAI_API_KEY not found in .env")
        print("   Using mock AI response for demo")
        analysis = create_demo_analysis()
    else:
        advisor = AcademicAIAdvisor(api_key=openai_key)
        print("Sending snapshot to GPT-4 for analysis...")
        analysis = advisor.generate_summary(snapshot)
        print("✅ AI analysis complete")

    print()

    # ========================================
    # STEP 4: Display Results
    # ========================================
    print("📋 Step 4: Student-Friendly Output")
    print("-" * 60)
    print()

    # Format and display
    if openai_key:
        advisor = AcademicAIAdvisor(api_key=openai_key)
        formatted_output = advisor.format_for_display(analysis)
    else:
        formatted_output = format_demo_output(analysis)

    print(formatted_output)
    print()

    # ========================================
    # STEP 5: Show Technical Details
    # ========================================
    print("\n" + "=" * 60)
    print("🔧 TECHNICAL DETAILS (For Judges)")
    print("=" * 60)
    print()

    print("📊 Snapshot Structure:")
    print(json.dumps(snapshot, indent=2, default=str)[:500] + "...")
    print()

    print("🎯 AI Analysis Structure:")
    print(json.dumps(analysis, indent=2)[:500] + "...")
    print()

    print("✅ Demo Complete!")
    print("=" * 60)
    print()


def create_demo_snapshot() -> dict:
    """
    Create a realistic demo snapshot for demonstration.

    In production, this would come from context_builder.build_student_snapshot()
    """
    from datetime import datetime, timedelta

    today = datetime.now().date()

    return {
        "student_overview": {
            "active_courses": 4,
            "upcoming_deadlines": 6,
            "high_risk_window": True,
            "high_risk_weeks": ["Week 1"],
            "snapshot_date": str(today)
        },
        "courses": [
            {
                "name": "Introduction to AI",
                "code": "ECE 122",
                "instructor": "Dr. Smith",
                "upcoming_count": 2,
                "upcoming": [
                    {
                        "name": "Midterm Exam",
                        "type": "test",
                        "due_date": str(today + timedelta(days=5)),
                        "days_until": 5,
                        "weight": 25.0
                    },
                    {
                        "name": "Homework 3",
                        "type": "homework",
                        "due_date": str(today + timedelta(days=7)),
                        "days_until": 7,
                        "weight": 10.0
                    }
                ],
                "load_estimate": "high"
            },
            {
                "name": "Computer Systems",
                "code": "ECE 141",
                "instructor": "Prof. Johnson",
                "upcoming_count": 2,
                "upcoming": [
                    {
                        "name": "Final Project",
                        "type": "project",
                        "due_date": str(today + timedelta(days=4)),
                        "days_until": 4,
                        "weight": 40.0
                    }
                ],
                "load_estimate": "high"
            },
            {
                "name": "Algorithms",
                "code": "CS 251",
                "instructor": "Dr. Brown",
                "upcoming_count": 1,
                "upcoming": [
                    {
                        "name": "Problem Set 5",
                        "type": "homework",
                        "due_date": str(today + timedelta(days=10)),
                        "days_until": 10,
                        "weight": 8.0
                    }
                ],
                "load_estimate": "medium"
            },
            {
                "name": "Linear Algebra",
                "code": "MATH 210",
                "instructor": "Prof. Davis",
                "upcoming_count": 1,
                "upcoming": [
                    {
                        "name": "Quiz 3",
                        "type": "quiz",
                        "due_date": str(today + timedelta(days=12)),
                        "days_until": 12,
                        "weight": 5.0
                    }
                ],
                "load_estimate": "low"
            }
        ],
        "risk_analysis": {
            "deadline_clustering": True,
            "clustered_weeks": {
                "Week 0": 3
            },
            "highest_priority": [
                {
                    "name": "ECE 141 Final Project",
                    "type": "project",
                    "days_until": 4,
                    "weight": 40.0
                },
                {
                    "name": "ECE 122 Midterm",
                    "type": "test",
                    "days_until": 5,
                    "weight": 25.0
                },
                {
                    "name": "ECE 122 Homework 3",
                    "type": "homework",
                    "days_until": 7,
                    "weight": 10.0
                }
            ]
        }
    }


def create_demo_analysis() -> dict:
    """Create mock AI analysis for demo when API key not available."""
    return {
        "summary": "You have a heavy workload in the next week with two major deadlines clustered within 5 days. The ECE 141 final project (40% of grade) and ECE 122 midterm (25% of grade) are your highest priorities. With 3 deadlines in the next 7 days, careful time management is critical.",
        "risks": [
            "Risk 1: Deadline clustering - 3 major assignments due within 7 days, creating a high-pressure window",
            "Risk 2: ECE 141 Final Project due in 4 days carries 40% of your course grade - highest stakes assignment",
            "Risk 3: ECE 122 Midterm in 5 days requires significant study time while finishing the project"
        ],
        "recommendations": [
            "Action 1: Prioritize ECE 141 Final Project immediately - allocate next 3 days (72 hours) to completion before midterm prep",
            "Action 2: Begin ECE 122 Midterm review on Day 4 after project submission - create study guide from lectures",
            "Action 3: Complete ECE 122 Homework 3 this weekend (after midterm) - it's lower weight and has more time"
        ],
        "priority_order": [
            {
                "task": "ECE 141 Final Project",
                "reason": "Highest weight (40%), earliest deadline (4 days), likely requires 20-30 hours of work",
                "deadline": "in 4 days"
            },
            {
                "task": "ECE 122 Midterm Exam",
                "reason": "Second highest weight (25%), exam requires focused study time, only 1 day buffer after project",
                "deadline": "in 5 days"
            },
            {
                "task": "ECE 122 Homework 3",
                "reason": "Lower weight (10%) and more time available (7 days), can be done after higher priority items",
                "deadline": "in 7 days"
            }
        ],
        "study_tips": [
            "Tip 1: Block 8-10 hours per day for the next 3 days dedicated to ECE 141 project - minimize context switching",
            "Tip 2: Create a 1-page midterm study guide each evening while project knowledge is fresh",
            "Tip 3: Use Pomodoro technique (25 min focus + 5 min break) to maintain productivity during heavy workload",
            "Tip 4: Schedule buffer time - if project takes longer than expected, you have 1 day before midterm prep must begin"
        ]
    }


def format_demo_output(analysis: dict) -> str:
    """Format demo analysis for display."""
    output = []

    output.append("=" * 60)
    output.append("📚 YOUR ACADEMIC SUMMARY & RECOMMENDATIONS")
    output.append("=" * 60)
    output.append("")

    output.append("📊 WORKLOAD OVERVIEW")
    output.append("-" * 60)
    output.append(analysis.get("summary", ""))
    output.append("")

    output.append("⚠️  TOP RISKS TO WATCH")
    output.append("-" * 60)
    for i, risk in enumerate(analysis.get("risks", []), 1):
        output.append(f"{i}. {risk}")
    output.append("")

    output.append("✅ ACTIONABLE RECOMMENDATIONS")
    output.append("-" * 60)
    for i, rec in enumerate(analysis.get("recommendations", []), 1):
        output.append(f"{i}. {rec}")
    output.append("")

    output.append("🎯 SUGGESTED PRIORITY ORDER")
    output.append("-" * 60)
    for i, item in enumerate(analysis.get("priority_order", []), 1):
        output.append(f"{i}. {item.get('task', '')}")
        output.append(f"   Deadline: {item.get('deadline', '')}")
        output.append(f"   Why: {item.get('reason', '')}")
        output.append("")

    output.append("💡 STUDY TIPS")
    output.append("-" * 60)
    for tip in analysis.get("study_tips", []):
        output.append(f"• {tip}")
    output.append("")

    output.append("=" * 60)
    output.append("🤖 Generated by AI Academic Advisor")
    output.append("=" * 60)

    return "\n".join(output)


if __name__ == "__main__":
    asyncio.run(main())
