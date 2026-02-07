import os
from dedalus_mcp.auth import Connection, SecretKeys, SecretValues
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Define the connection for Supabase MCP server
# Note: Only recognized credential types (key, token, secret, etc.) are encrypted
supabase_mcp_connection = Connection(
    name="supabase-mcp",
    secrets=SecretKeys(supabase_url="SUPABASE_URL", api_key="SUPABASE_SECRET_KEY"),
    base_url=f"{SUPABASE_URL}/rest/v1",  # From your API provider
    auth_header_name="apikey",
    auth_header_format="{api_key}",
)


supabase_mcp_secrets = SecretValues(
    supabase_mcp_connection, 
    supabase_url=os.getenv("SUPABASE_URL"),
    api_key=os.getenv("SUPABASE_SECRET_KEY")
)