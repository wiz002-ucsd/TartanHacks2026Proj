# server.py
import os
from dedalus_mcp import MCPServer
from dedalus_mcp.server import TransportSecuritySettings
from dedalus_mcp.auth import Connection, SecretKeys

# Define connections (credentials provided by client at runtime)
github = Connection(
    name="github",
    secrets=SecretKeys(token="GITHUB_TOKEN"),
    auth_header_format="token {api_key}"
)

supabase = Connection(
    name="supabase",
    secrets=SecretKeys(token="SUPABASE_SECRET_KEY"),
    auth_header_format="Bearer {api_key}"
)

def create_server() -> MCPServer:
    return MCPServer(
        name="example-dedalus-mcp",
        connections=[github, supabase],
        http_security=TransportSecuritySettings(enable_dns_rebinding_protection=False),
        streamable_http_stateless=True,
        authorization_server=os.getenv("DEDALUS_AS_URL", "https://as.dedaluslabs.ai"),
    )