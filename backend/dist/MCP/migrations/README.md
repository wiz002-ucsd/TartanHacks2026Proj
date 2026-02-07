# Database Migrations - Mastery Tracking System

## Overview

These SQL migrations set up the complete database schema for the mastery tracking system.

## Migration Files

| File | Purpose | Dependencies |
|------|---------|--------------|
| `01_create_core_schema.sql` | Core tables (courses, topics, events, assignments) | None |
| `02_create_mastery_tables.sql` | Mastery-specific tables (topic_mastery, quizzes, etc.) | Requires 01 |
| `03_seed_sample_data.sql` | Sample data for testing | Requires 01 & 02 |

## Quick Setup (All Migrations)

### Option 1: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `ctsggntjxlkzxapoiloy`
3. Navigate to **SQL Editor**
4. Copy and paste each migration file **in order**:
   - First: `01_create_core_schema.sql`
   - Second: `02_create_mastery_tables.sql`
   - Third: `03_seed_sample_data.sql`
5. Click **Run** after each one

### Option 2: Using psql Command Line

```bash
# Set your connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.ctsggntjxlkzxapoiloy.supabase.co:5432/postgres"

# Run migrations in order
psql $DATABASE_URL -f 01_create_core_schema.sql
psql $DATABASE_URL -f 02_create_mastery_tables.sql
psql $DATABASE_URL -f 03_seed_sample_data.sql
```

### Option 3: Using Python Script (Recommended)

```bash
cd /Users/williamzhang/startups/TartanHacks2026Proj/backend/dist/MCP/migrations
python3 run_migrations.py
```

## What Gets Created

### Core Tables (Migration 01)
- ✅ **courses** - Student courses with semester dates
- ✅ **topics** - Course topics for granular tracking
- ✅ **events** - Deadlines and calendar events
- ✅ **assignments** - Assignments with topic linking
- ✅ **grading_policies** - Grading breakdown per course

### Mastery Tables (Migration 02)
- ✅ **topic_mastery** - Core mastery scores (0.0-1.0)
- ✅ **quizzes** - Scheduled assessments
- ✅ **flashcard_sessions** - Study session tracking
- ✅ **mastery_history** - Audit trail of score changes

### Helper Functions (Migration 02)
- ✅ `get_mastery_level()` - Convert score to label
- ✅ `calculate_topic_urgency()` - Compute urgency level

### Views (Migration 02)
- ✅ `topics_with_mastery` - Combined topic + mastery data

### Sample Data (Migration 03)
- ✅ 3 courses (18-665, 12-222, 18-460)
- ✅ 11 topics across courses
- ✅ Realistic mastery scores (0.25 - 0.82 range)
- ✅ 7+ upcoming deadlines
- ✅ 5 quizzes (including CRITICAL urgency test case)
- ✅ 4 flashcard sessions showing study patterns

## Test Scenarios Included

After seeding, you'll have these test cases:

### 🔴 **Critical Urgency**
- **Topic**: Hypothesis Testing (Topic 2)
- **Mastery**: 0.35 (foundational - LOW!)
- **Assessment**: Quiz in 5 days, 15% of grade
- **Expected AI Advice**: "Urgent reinforcement needed - highest priority"

### 🟠 **High Urgency**
- **Topic**: Reaction Kinetics (Topic 7)
- **Mastery**: 0.42 (emerging)
- **Assessment**: Lab report in 7 days, 12% weight
- **Expected AI Advice**: "Active recall practice, focus next 3 days"

### 🟡 **Medium Urgency**
- **Topic**: Regression Analysis (Topic 3)
- **Mastery**: 0.58 (developing)
- **Assessment**: Homework in 12 days
- **Expected AI Advice**: "Spaced practice over next week"

### 🟢 **Low Urgency (but needs attention)**
- **Topic**: Dynamic Programming (Topic 11)
- **Mastery**: 0.25 (foundational - VERY LOW!)
- **Assessment**: No immediate deadline
- **Expected AI Advice**: "Build foundational understanding gradually"

## Verification Queries

After running migrations, verify the setup:

```sql
-- Check table counts
SELECT
    (SELECT COUNT(*) FROM courses) as courses,
    (SELECT COUNT(*) FROM topics) as topics,
    (SELECT COUNT(*) FROM topic_mastery) as mastery_records,
    (SELECT COUNT(*) FROM quizzes) as quizzes,
    (SELECT COUNT(*) FROM assignments) as assignments;

-- Expected: 3 courses, 11 topics, 11 mastery records, 5 quizzes, 7 assignments

-- Check average mastery
SELECT ROUND(AVG(mastery_score)::numeric, 2) as avg_mastery FROM topic_mastery;
-- Expected: ~0.54

-- Find critical urgency topics
SELECT
    t.name,
    tm.mastery_score,
    q.name as quiz_name,
    q.scheduled_date,
    q.scheduled_date - CURRENT_DATE as days_until,
    q.weight
FROM topics t
JOIN topic_mastery tm ON t.id = tm.topic_id
JOIN quizzes q ON t.id = q.topic_id
WHERE tm.mastery_score < 0.5
  AND q.scheduled_date - CURRENT_DATE <= 7
  AND q.weight >= 15
ORDER BY q.scheduled_date;

-- Expected: Should return Hypothesis Testing topic

-- Test mastery view
SELECT * FROM topics_with_mastery
WHERE mastery_score < 0.5
ORDER BY mastery_score ASC;

-- Expected: 5 topics with low mastery
```

## Rollback (If Needed)

To completely remove all tables and start over:

```sql
-- WARNING: This deletes ALL data
DROP TABLE IF EXISTS mastery_history CASCADE;
DROP TABLE IF EXISTS flashcard_sessions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS topic_mastery CASCADE;
DROP TABLE IF EXISTS grading_policies CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

DROP FUNCTION IF EXISTS get_mastery_level CASCADE;
DROP FUNCTION IF EXISTS calculate_topic_urgency CASCADE;
DROP VIEW IF EXISTS topics_with_mastery CASCADE;
```

## Next Steps

After running migrations:

1. ✅ **Test MCP Queries**
   ```bash
   cd /Users/williamzhang/startups/TartanHacks2026Proj/backend/dist/MCP
   python3 test_direct_supabase.py
   ```

2. ✅ **Test Mastery Context Builder**
   ```bash
   python3 example_mastery_integration.py
   ```

3. ✅ **Integrate with AI Advisor**
   - Update `/api/ai-advisor` endpoint
   - Replace old queries with mastery-aware queries

4. ✅ **View in Frontend**
   - Restart backend server
   - Navigate to Dashboard
   - Should see 3 courses with mastery data

## Troubleshooting

### "relation already exists"
- Safe to ignore - tables already created
- Or run rollback script above

### "permission denied"
- Make sure you're using the `service_role` key, not `anon` key
- Check `.env` has correct `SUPABASE_SECRET_KEY`

### "foreign key violation"
- Run migrations in order: 01 → 02 → 03
- Don't skip migration 01 when running 02

### "function does not exist"
- Make sure migration 02 completed successfully
- Check for PostgreSQL version compatibility (requires 12+)

## Schema Diagram

```
courses
  ├── topics
  │     ├── topic_mastery (mastery scores)
  │     ├── quizzes (assessments)
  │     ├── flashcard_sessions (study tracking)
  │     └── assignments (via topic_id FK)
  ├── events (calendar items)
  ├── assignments (work items)
  └── grading_policies (grade structure)
```

## Questions?

- See `MASTERY_SYSTEM_GUIDE.md` for architecture details
- See `QUICK_START.md` for integration steps
- Check sample queries above for verification
