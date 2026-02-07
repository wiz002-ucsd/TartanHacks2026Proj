#!/usr/bin/env python3
"""
Get AI Advisor Data - Returns JSON for Node.js backend
=======================================================
This script queries the actual Supabase database via MCP,
builds a semantic snapshot, and generates AI recommendations.
Output is JSON that can be consumed by the Node.js API.
"""

import asyncio
import os
import json
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

from dedalus_labs import AsyncDedalus, DedalusRunner
from connection import supabase_mcp_secrets
from ai_advisor import AcademicAIAdvisor

load_dotenv()


async def query_supabase_table(runner, table_name, filters=None, limit=None, columns="*"):
    """
    Query a Supabase table via MCP.

    Args:
        runner: DedalusRunner instance
        table_name: Name of table to query
        filters: Optional filter string
        limit: Optional limit on results
        columns: Columns to select (default "*")

    Returns:
        MCP response object
    """
    query = f"Select {columns} from the {table_name} table"

    if filters:
        query += f" where {filters}"
    if limit:
        query += f", limit to {limit}"

    query += ". Return the data in a structured format."

    response = await runner.run(
        input=query,
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )

    return response


def parse_mcp_output(mcp_response):
    """
    Parse MCP response to extract actual data.
    MCP returns data via tool results, typically as JSON.
    """
    results = []

    # Check mcp_results for actual database query results
    if hasattr(mcp_response, 'mcp_results') and mcp_response.mcp_results:
        for mcp_result in mcp_response.mcp_results:
            # Check if this is a successful db_select result
            if hasattr(mcp_result, 'result') and isinstance(mcp_result.result, dict):
                result_data = mcp_result.result

                # Supabase MCP returns data in a specific format
                if 'success' in result_data and result_data.get('success'):
                    # Data is in the 'data' field
                    if 'data' in result_data and isinstance(result_data['data'], list):
                        results.extend(result_data['data'])
                elif 'text' in result_data:
                    # Try to parse text as JSON
                    try:
                        import re
                        # Look for JSON objects or arrays
                        json_match = re.search(r'(\{.*\}|\[.*\])', result_data['text'], re.DOTALL)
                        if json_match:
                            parsed = json.loads(json_match.group())
                            if isinstance(parsed, list):
                                results.extend(parsed)
                            elif isinstance(parsed, dict) and 'data' in parsed:
                                if isinstance(parsed['data'], list):
                                    results.extend(parsed['data'])
                                else:
                                    results.append(parsed['data'])
                            else:
                                results.append(parsed)
                    except Exception as e:
                        print(f"Failed to parse MCP text as JSON: {e}", file=sys.stderr)
                        pass

    return results


async def get_real_dashboard_data():
    """
    Query actual Supabase database and build real dashboard data.
    """
    # Initialize MCP client
    client = AsyncDedalus(
        api_key=os.getenv("DEDALUS_API_KEY"),
        base_url=os.getenv("DEDALUS_API_URL"),
        as_base_url=os.getenv("DEDALUS_AS_URL"),
    )
    runner = DedalusRunner(client)

    today = datetime.now().date()
    future_date = today + timedelta(days=14)

    # Query all courses
    print("📚 Querying courses...", file=sys.stderr)
    courses_response = await query_supabase_table(runner, "courses")
    courses_data = parse_mcp_output(courses_response)

    # Query upcoming events (next 14 days and future events)
    print("📅 Querying events...", file=sys.stderr)
    events_response = await query_supabase_table(
        runner,
        "events",
        filters=f"due_date >= '{today}'"  # Get all future events
    )
    events_data = parse_mcp_output(events_response)

    # Filter to only include events in the next 14 days for the snapshot
    events_data = [
        event for event in events_data
        if event.get('due_date') and
        datetime.fromisoformat(event['due_date'].replace('Z', '+00:00')).date() >= today and
        datetime.fromisoformat(event['due_date'].replace('Z', '+00:00')).date() <= future_date
    ]

    # Query grading policies
    print("📊 Querying grading policies...", file=sys.stderr)
    grading_response = await query_supabase_table(runner, "grading_policies")
    grading_data = parse_mcp_output(grading_response)

    # If parsing failed, use a simpler approach - just get counts
    if not courses_data:
        # Fallback: extract from text output
        output_text = courses_response.final_output
        # Count courses mentioned or use default
        courses_data = []  # Will use mock data as fallback

    # Build snapshot from real data
    snapshot = build_snapshot_from_db(courses_data, events_data, grading_data, today)

    # Generate AI analysis
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        print("🧠 Generating AI analysis...", file=sys.stderr)
        advisor = AcademicAIAdvisor(api_key=openai_key)
        analysis = advisor.generate_summary(snapshot)
    else:
        print("⚠️  No OpenAI key, using mock analysis", file=sys.stderr)
        analysis = generate_mock_analysis()

    return {
        "snapshot": snapshot,
        "analysis": analysis
    }


def build_snapshot_from_db(courses_data, events_data, grading_data, today):
    """
    Build semantic snapshot from database query results.
    """
    # For now, if we don't have parsed data, use a hybrid approach
    # combining what we can get from MCP with reasonable defaults

    courses = []
    all_events = []

    # Try to structure the data we have
    # In a production system, you'd parse the MCP responses more carefully
    # For now, create a reasonable snapshot

    # Group events by course if we have them
    events_by_course = {}
    for event in events_data:
        if isinstance(event, dict):
            course_id = event.get('course_id')
            if course_id not in events_by_course:
                events_by_course[course_id] = []

            # Calculate days until
            due_date = event.get('due_date')
            if due_date:
                if isinstance(due_date, str):
                    due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00')).date()
                days_until = (due_date - today).days
            else:
                days_until = None

            events_by_course[course_id].append({
                'name': event.get('name', 'Unknown'),
                'type': event.get('type', 'assignment'),
                'due_date': str(due_date) if due_date else None,
                'days_until': days_until,
                'weight': event.get('weight', 0)
            })

    # Build course summaries
    for course in courses_data:
        if isinstance(course, dict):
            course_id = course.get('id')
            course_events = events_by_course.get(course_id, [])

            # Sort by due date
            course_events.sort(key=lambda e: e['days_until'] if e['days_until'] is not None else 999)

            # Estimate load
            if len(course_events) >= 3:
                load = 'high'
            elif len(course_events) >= 1:
                load = 'medium'
            else:
                load = 'low'

            courses.append({
                'name': course.get('name', 'Unknown Course'),
                'code': course.get('code', 'UNKNOWN'),
                'instructor': course.get('instructor', 'Unknown'),
                'upcoming_count': len(course_events),
                'upcoming': course_events[:5],  # Top 5
                'load_estimate': load
            })

            all_events.extend(course_events)

    # Analyze deadline clustering
    events_next_week = [e for e in all_events if e['days_until'] is not None and e['days_until'] <= 7]
    high_risk = len(events_next_week) >= 3

    # Find highest priority (earliest with highest weight)
    all_events.sort(key=lambda e: (
        e['days_until'] if e['days_until'] is not None else 999,
        -(e['weight'] or 0)
    ))

    snapshot = {
        'student_overview': {
            'active_courses': len(courses),
            'upcoming_deadlines': len(all_events),
            'high_risk_window': high_risk,
            'high_risk_weeks': ['Week 1'] if high_risk else [],
            'snapshot_date': str(today)
        },
        'courses': courses
    }

    return snapshot


def generate_mock_analysis():
    """Fallback mock analysis when OpenAI is not available."""
    return {
        'summary': 'Unable to generate AI analysis - OpenAI API key not configured.',
        'risks': ['No AI analysis available'],
        'recommendations': ['Configure OpenAI API key to enable AI recommendations'],
        'priority_order': [],
        'study_tips': ['Enable AI analysis by adding OPENAI_API_KEY to your .env file']
    }


async def main():
    """Main entry point - outputs JSON to stdout for Node.js consumption."""
    try:
        data = await get_real_dashboard_data()
        # Output JSON to stdout (Node.js will capture this)
        print(json.dumps(data, indent=2))
    except Exception as e:
        # Output error as JSON
        error_data = {
            'error': str(e),
            'snapshot': {
                'student_overview': {
                    'active_courses': 0,
                    'upcoming_deadlines': 0,
                    'high_risk_window': False,
                    'high_risk_weeks': [],
                    'snapshot_date': str(datetime.now().date())
                },
                'courses': []
            },
            'analysis': {
                'summary': f'Error: {str(e)}',
                'risks': ['Failed to fetch data from database'],
                'recommendations': ['Check MCP server configuration'],
                'priority_order': [],
                'study_tips': []
            }
        }
        print(json.dumps(error_data, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
