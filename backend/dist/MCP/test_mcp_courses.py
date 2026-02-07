#!/usr/bin/env python3
"""
Test MCP Courses Query - Debug what the MCP is returning
"""

import asyncio
import os
import json
import sys
from dotenv import load_dotenv

from dedalus_labs import AsyncDedalus, DedalusRunner
from connection import supabase_mcp_secrets

load_dotenv()


async def test_mcp_query():
    """Test querying courses from Supabase via MCP."""

    print("=" * 70, file=sys.stderr)
    print("Testing MCP Courses Query", file=sys.stderr)
    print("=" * 70, file=sys.stderr)

    # Initialize MCP client
    client = AsyncDedalus(
        api_key=os.getenv("DEDALUS_API_KEY"),
        base_url=os.getenv("DEDALUS_API_URL"),
        as_base_url=os.getenv("DEDALUS_AS_URL"),
    )
    runner = DedalusRunner(client)

    # Query courses
    query = "Select * from the courses table. Return the data in a structured format."

    print(f"\nQuery: {query}", file=sys.stderr)
    print("\nExecuting...", file=sys.stderr)

    response = await runner.run(
        input=query,
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )

    print("\n" + "=" * 70, file=sys.stderr)
    print("RAW MCP RESPONSE ANALYSIS", file=sys.stderr)
    print("=" * 70, file=sys.stderr)

    # Analyze the response structure
    print(f"\nResponse type: {type(response)}", file=sys.stderr)
    print(f"Response attributes: {dir(response)}", file=sys.stderr)

    if hasattr(response, 'final_output'):
        print(f"\nfinal_output type: {type(response.final_output)}", file=sys.stderr)
        print(f"final_output length: {len(response.final_output)}", file=sys.stderr)
        print(f"\nfinal_output (first 500 chars):", file=sys.stderr)
        print(response.final_output[:500], file=sys.stderr)

    if hasattr(response, 'mcp_results'):
        print(f"\nmcp_results type: {type(response.mcp_results)}", file=sys.stderr)
        print(f"mcp_results length: {len(response.mcp_results)}", file=sys.stderr)

        for i, mcp_result in enumerate(response.mcp_results):
            print(f"\n--- MCP Result {i} ---", file=sys.stderr)
            print(f"Type: {type(mcp_result)}", file=sys.stderr)
            print(f"Attributes: {dir(mcp_result)}", file=sys.stderr)

            if hasattr(mcp_result, 'result'):
                print(f"result type: {type(mcp_result.result)}", file=sys.stderr)
                print(f"result: {json.dumps(mcp_result.result, indent=2)}", file=sys.stderr)

            if hasattr(mcp_result, 'text'):
                print(f"text: {mcp_result.text[:200]}", file=sys.stderr)

    print("\n" + "=" * 70, file=sys.stderr)
    print("PARSING ATTEMPT", file=sys.stderr)
    print("=" * 70, file=sys.stderr)

    # Try to parse using the existing function
    courses = []
    if hasattr(response, 'mcp_results') and response.mcp_results:
        for mcp_result in response.mcp_results:
            if hasattr(mcp_result, 'result') and isinstance(mcp_result.result, dict):
                result_data = mcp_result.result

                print(f"\nResult data keys: {result_data.keys()}", file=sys.stderr)

                # Check success field
                if 'success' in result_data:
                    print(f"success: {result_data['success']}", file=sys.stderr)

                # Check data field
                if 'data' in result_data:
                    print(f"data type: {type(result_data['data'])}", file=sys.stderr)
                    if isinstance(result_data['data'], list):
                        print(f"data length: {len(result_data['data'])}", file=sys.stderr)
                        courses.extend(result_data['data'])

    print(f"\n✓ Parsed courses count: {len(courses)}", file=sys.stderr)

    if courses:
        print(f"\nFirst course:", file=sys.stderr)
        print(json.dumps(courses[0], indent=2), file=sys.stderr)
    else:
        print("\n⚠️  No courses parsed!", file=sys.stderr)

    print("\n" + "=" * 70, file=sys.stderr)

    # Output for Node.js
    output = {
        "success": len(courses) > 0,
        "courses_count": len(courses),
        "courses": courses
    }
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    asyncio.run(test_mcp_query())
