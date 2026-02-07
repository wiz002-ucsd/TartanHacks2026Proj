-- Clean Slate: Drop Everything and Start Fresh
-- ============================================================================
-- Run this FIRST to completely reset the database

-- WARNING: This deletes ALL data in these tables!

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS mastery_history CASCADE;
DROP TABLE IF EXISTS flashcard_sessions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS topic_mastery CASCADE;
DROP TABLE IF EXISTS course_policies CASCADE;
DROP TABLE IF EXISTS lectures CASCADE;
DROP TABLE IF EXISTS grading_policies CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_mastery_level(FLOAT) CASCADE;
DROP FUNCTION IF EXISTS calculate_topic_urgency(FLOAT, INT, FLOAT) CASCADE;
DROP FUNCTION IF EXISTS update_topic_mastery_timestamp() CASCADE;
DROP FUNCTION IF EXISTS log_mastery_change() CASCADE;

-- Drop views
DROP VIEW IF EXISTS topics_with_mastery CASCADE;

-- Drop extension if no longer needed
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE CLEANED - ALL TABLES DROPPED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'You can now run the consolidated migration';
    RAISE NOTICE '========================================';
END $$;
