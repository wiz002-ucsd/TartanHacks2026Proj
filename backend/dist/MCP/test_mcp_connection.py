#!/usr/bin/env python3
"""
Test MCP Server Connection
Tests direct connection to the Supabase MCP server
"""
import asyncio
import os
import json
from dotenv import load_dotenv
from dedalus_labs import AsyncDedalus, DedalusRunner
from connection import supabase_mcp_secrets

load_dotenv()

async def test_mcp_connection():
    """Test basic MCP server connectivity and data retrieval"""

    print("=" * 60)
    print("Testing Supabase MCP Server Connection")
    print("=" * 60)

    # Check environment variables
    print("\n1. Checking environment variables...")
    api_key = os.getenv("DEDALUS_API_KEY")
    api_url = os.getenv("DEDALUS_API_URL")
    as_url = os.getenv("DEDALUS_AS_URL")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SECRET_KEY")

    print(f"   ✓ DEDALUS_API_KEY: {'Set' if api_key else 'MISSING'}")
    print(f"   ✓ DEDALUS_API_URL: {api_url if api_url else 'MISSING'}")
    print(f"   ✓ DEDALUS_AS_URL: {as_url if as_url else 'MISSING'}")
    print(f"   ✓ SUPABASE_URL: {supabase_url if supabase_url else 'MISSING'}")
    print(f"   ✓ SUPABASE_SECRET_KEY: {'Set' if supabase_key else 'MISSING'}")

    if not all([api_key, api_url, as_url, supabase_url, supabase_key]):
        print("\n❌ Missing required environment variables!")
        return

    # Initialize client
    print("\n2. Initializing Dedalus client...")
    try:
        client = AsyncDedalus(
            api_key=api_key,
            base_url=api_url,
            as_base_url=as_url,
        )
        runner = DedalusRunner(client)
        print("   ✓ Client initialized successfully")
    except Exception as e:
        print(f"   ❌ Failed to initialize client: {e}")
        return

    # Test 1: Simple query to courses table
    print("\n3. Testing query to courses table...")
    try:
        response = await runner.run(
            input="Query the courses table and return all records. Show me the data.",
            model="anthropic/claude-sonnet-4-20250514",
            mcp_servers=["williamzhang121/mysupabase-mcp"],
            credentials=[supabase_mcp_secrets],
        )

        print(f"   Response type: {type(response)}")
        print(f"   Has mcp_results: {hasattr(response, 'mcp_results')}")

        if hasattr(response, 'mcp_results') and response.mcp_results:
            print(f"   ✓ MCP results count: {len(response.mcp_results)}")

            for i, result in enumerate(response.mcp_results):
                print(f"\n   --- MCP Result {i + 1} ---")
                if hasattr(result, 'result'):
                    result_data = result.result
                    print(f"   Result type: {type(result_data)}")
                    if isinstance(result_data, dict):
                        print(f"   Result keys: {list(result_data.keys())}")
                        if 'success' in result_data:
                            print(f"   Success: {result_data.get('success')}")
                        if 'data' in result_data:
                            data = result_data['data']
                            print(f"   Data type: {type(data)}")
                            if isinstance(data, list):
                                print(f"   Data count: {len(data)}")
                                if data:
                                    print(f"   First record: {json.dumps(data[0], indent=2)}")
                        print(f"   Full result: {json.dumps(result_data, indent=2)}")
        else:
            print(f"   ⚠️  No MCP results returned")

        if hasattr(response, 'final_output'):
            print(f"\n   Final output (first 500 chars):")
            print(f"   {response.final_output[:500]}")

    except Exception as e:
        print(f"   ❌ Query failed: {e}")
        import traceback
        traceback.print_exc()
        return

    # Test 2: Count query
    print("\n4. Testing count query...")
    try:
        response = await runner.run(
            input="How many records are in the courses table? Give me the exact count.",
            model="anthropic/claude-sonnet-4-20250514",
            mcp_servers=["williamzhang121/mysupabase-mcp"],
            credentials=[supabase_mcp_secrets],
        )

        if hasattr(response, 'final_output'):
            print(f"   Response: {response.final_output}")

    except Exception as e:
        print(f"   ❌ Count query failed: {e}")

    print("\n" + "=" * 60)
    print("Test complete!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_mcp_connection())
