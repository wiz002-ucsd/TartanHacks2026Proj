import asyncio
import os
from dedalus_labs import AsyncDedalus, DedalusRunner
from connection import supabase_mcp_secrets

from dotenv import load_dotenv
load_dotenv()


async def main():

    # Initialize client with API key
    client = AsyncDedalus(api_key=os.getenv("DEDALUS_API_KEY"),
        base_url=os.getenv("DEDALUS_API_URL"),
        as_base_url=os.getenv("DEDALUS_AS_URL"),)
    runner = DedalusRunner(client)

    # Run with Supabase MCP server using DAuth credentials
    print("Calling Supabase MCP server with credentials...")
    response = await runner.run(
        input="Select all rows from the courses table, limit to 5.",
        model="anthropic/claude-sonnet-4-20250514",
        mcp_servers=["williamzhang121/mysupabase-mcp"],
        credentials=[supabase_mcp_secrets],
    )

    print("\n=== Response ===")
    print(response.output)
    print("\n=== Done ===")

if __name__ == "__main__":
    asyncio.run(main())
