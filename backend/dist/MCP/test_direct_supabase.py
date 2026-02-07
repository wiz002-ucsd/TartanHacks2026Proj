#!/usr/bin/env python3
"""
Test Direct Supabase Connection (No MCP/Dedalus)
Tests querying Supabase directly via REST API
"""
import os
import json
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def test_supabase_direct():
    """Test direct connection to Supabase REST API"""

    print("=" * 60)
    print("Testing Direct Supabase Connection (No MCP)")
    print("=" * 60)

    # Get credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SECRET_KEY")

    print("\n1. Checking credentials...")
    print(f"   ✓ SUPABASE_URL: {supabase_url if supabase_url else 'MISSING'}")
    print(f"   ✓ SUPABASE_SECRET_KEY: {'Set' if supabase_key else 'MISSING'}")

    if not supabase_url or not supabase_key:
        print("\n❌ Missing Supabase credentials!")
        return

    # Set up headers
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }

    # Test 1: Query courses
    print("\n2. Querying courses table...")
    try:
        response = requests.get(
            f"{supabase_url}/rest/v1/courses",
            headers=headers,
            params={'select': '*'}
        )
        response.raise_for_status()
        courses = response.json()

        print(f"   ✓ Success! Found {len(courses)} courses")
        for course in courses:
            print(f"     - {course.get('code')}: {course.get('name')}")

    except Exception as e:
        print(f"   ❌ Failed to query courses: {e}")
        return

    # Test 2: Query events
    print("\n3. Querying events table...")
    try:
        today = datetime.now().date()
        future_date = today + timedelta(days=14)

        response = requests.get(
            f"{supabase_url}/rest/v1/events",
            headers=headers,
            params={
                'select': '*',
                'due_date': f'gte.{today}',
                'order': 'due_date.asc'
            }
        )
        response.raise_for_status()
        events = response.json()

        print(f"   ✓ Success! Found {len(events)} upcoming events")
        for event in events[:5]:  # Show first 5
            print(f"     - {event.get('name')} (due: {event.get('due_date')})")

    except Exception as e:
        print(f"   ❌ Failed to query events: {e}")
        return

    # Test 3: Query grading policies
    print("\n4. Querying grading_policies table...")
    try:
        response = requests.get(
            f"{supabase_url}/rest/v1/grading_policies",
            headers=headers,
            params={'select': '*'}
        )
        response.raise_for_status()
        grading = response.json()

        print(f"   ✓ Success! Found {len(grading)} grading policies")

    except Exception as e:
        print(f"   ❌ Failed to query grading policies: {e}")
        return

    # Summary
    print("\n" + "=" * 60)
    print("✅ Direct Supabase connection works!")
    print(f"   - {len(courses)} courses")
    print(f"   - {len(events)} upcoming events")
    print(f"   - {len(grading)} grading policies")
    print("=" * 60)

    # Show sample data structure
    print("\nSample course data:")
    if courses:
        print(json.dumps(courses[0], indent=2))

    print("\nSample event data:")
    if events:
        print(json.dumps(events[0], indent=2))

if __name__ == "__main__":
    test_supabase_direct()
