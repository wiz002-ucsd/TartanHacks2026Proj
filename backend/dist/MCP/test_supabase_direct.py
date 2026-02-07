import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Get credentials
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SECRET_KEY")

print(f"Connecting to: {url}")
print(f"Using key (first 20 chars): {key[:20]}...")

# Create Supabase client
supabase: Client = create_client(url, key)

try:
    # Test 1: List all tables
    print("\n=== Querying tables ===")
    response = supabase.table('courses').select("*").limit(5).execute()
    print(f"Found {len(response.data)} courses")
    for course in response.data:
        print(f"  - {course['name']} ({course['code']})")

    print("\n✅ Direct Supabase connection works!")

except Exception as e:
    print(f"\n❌ Error: {e}")
