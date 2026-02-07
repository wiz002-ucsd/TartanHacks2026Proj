#!/usr/bin/env python3
"""Debug script to see what MCP returns"""
import asyncio
import os
import json
from dotenv import load_dotenv
from dedalus_labs import AsyncDedalus, DedalusRunner
from connection import supabase_mcp_secrets

load_dotenv()

async def debug_query():
    client = AsyncDedalus(
        api_key=os.getenv("DEDALUS_API_KEY"),
        base_url=os.getenv("DEDALUS_API_URL"),
        as_base_url=os.getenv("DEDALUS_AS_URL"),
    )
    runner = DedalusRunner(client)

    print("=== Querying courses table ===")
    response = await runner.run(
        input="Select * from the courses table. Return the data in a structured format.",
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )

    print("\n=== Response attributes ===")
    print(f"Type: {type(response)}")
    print(f"Attributes: {dir(response)}")

    if hasattr(response, 'final_output'):
        print(f"\n=== Final output ===")
        print(response.final_output)

    if hasattr(response, 'mcp_results'):
        print(f"\n=== MCP Results ===")
        print(f"MCP results count: {len(response.mcp_results) if response.mcp_results else 0}")
        if response.mcp_results:
            for i, mcp_result in enumerate(response.mcp_results):
                print(f"\n--- MCP Result {i} ---")
                print(f"Type: {type(mcp_result)}")
                print(f"Attributes: {dir(mcp_result)}")
                if hasattr(mcp_result, 'result'):
                    print(f"Result type: {type(mcp_result.result)}")
                    print(f"Result: {json.dumps(mcp_result.result, indent=2) if isinstance(mcp_result.result, dict) else mcp_result.result}")

if __name__ == "__main__":
    asyncio.run(debug_query())
