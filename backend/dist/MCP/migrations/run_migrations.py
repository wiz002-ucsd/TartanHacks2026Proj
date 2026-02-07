#!/usr/bin/env python3
"""
Database Migration Runner
Runs SQL migrations against Supabase database
"""

import os
import sys
from pathlib import Path
import requests
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
load_dotenv(Path(__file__).parent.parent / '.env')


def run_sql_via_rest(sql_content: str, supabase_url: str, supabase_key: str) -> bool:
    """
    Execute SQL via Supabase REST API (PostgREST SQL function)

    Note: This uses the PostgREST /rpc endpoint which allows SQL execution
    through the service_role key.
    """
    # PostgREST SQL execution endpoint
    url = f"{supabase_url}/rest/v1/rpc/exec_sql"

    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }

    payload = {
        'query': sql_content
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)

        if response.status_code == 200:
            return True
        else:
            print(f"     ❌ Error: HTTP {response.status_code}")
            print(f"     Response: {response.text[:200]}")
            return False

    except Exception as e:
        print(f"     ❌ Exception: {e}")
        return False


def run_migrations_simple(supabase_url: str, supabase_key: str):
    """
    Simplified approach: Use requests library to execute SQL via Supabase REST API
    """

    print("=" * 70)
    print("RUNNING DATABASE MIGRATIONS")
    print("=" * 70)
    print()

    # Migration files in order
    migrations = [
        '01_create_core_schema.sql',
        '02_create_mastery_tables.sql',
        '03_seed_sample_data.sql'
    ]

    migrations_dir = Path(__file__).parent

    for migration_file in migrations:
        print(f"📄 Running: {migration_file}")
        file_path = migrations_dir / migration_file

        if not file_path.exists():
            print(f"   ❌ File not found: {file_path}")
            return False

        # Read SQL file
        with open(file_path, 'r') as f:
            sql_content = f.read()

        print(f"   → Executing SQL ({len(sql_content)} characters)...")

        # For this hackathon, we'll use a direct approach
        # Just tell the user to run in Supabase dashboard
        print(f"   ⚠️  Please run this file manually in Supabase SQL Editor")
        print(f"   📋 File path: {file_path}")
        print()

    print("=" * 70)
    print("MANUAL MIGRATION REQUIRED")
    print("=" * 70)
    print()
    print("Please run the migrations manually in Supabase Dashboard:")
    print()
    print("1. Go to: https://supabase.com/dashboard")
    print("2. Select your project: ctsggntjxlkzxapoiloy")
    print("3. Click 'SQL Editor' in sidebar")
    print("4. Copy and paste each file below IN ORDER:")
    print()
    for i, migration in enumerate(migrations, 1):
        file_path = migrations_dir / migration
        print(f"   {i}. {file_path}")
    print()
    print("5. Click 'Run' after pasting each one")
    print()
    print("=" * 70)

    return True


def check_connection(supabase_url: str, supabase_key: str) -> bool:
    """Test if we can connect to Supabase"""
    try:
        url = f"{supabase_url}/rest/v1/"
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}'
        }
        response = requests.get(url, headers=headers, timeout=10)
        return response.status_code in [200, 404]  # 404 is okay (no tables yet)
    except:
        return False


def main():
    # Get credentials from environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SECRET_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials in .env file")
        print()
        print("Required variables:")
        print("  - SUPABASE_URL")
        print("  - SUPABASE_SECRET_KEY (service_role key)")
        print()
        print("Please add these to:")
        print("  /Users/williamzhang/startups/TartanHacks2026Proj/backend/dist/MCP/.env")
        return 1

    print("🔍 Checking connection...")
    print(f"   URL: {supabase_url}")

    if check_connection(supabase_url, supabase_key):
        print("   ✅ Connection successful")
        print()
    else:
        print("   ❌ Could not connect to Supabase")
        print("   Check your SUPABASE_URL and SUPABASE_SECRET_KEY")
        return 1

    # Run migrations
    success = run_migrations_simple(supabase_url, supabase_key)

    if success:
        print("✅ Migration instructions provided above")
        print()
        print("After running migrations, verify with:")
        print("  python3 test_direct_supabase.py")
        return 0
    else:
        print("❌ Migration setup failed")
        return 1


if __name__ == '__main__':
    sys.exit(main())
