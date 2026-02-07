-- Migration 05: Fix Lectures Schema to Match Frontend Expectations
-- ============================================================================

-- Add lecture_number column
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS lecture_number INT;

-- Add topics array column (JSONB for flexibility)
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';

-- Update existing lectures with lecture numbers (in chronological order per course)
WITH numbered_lectures AS (
    SELECT
        id,
        ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY date NULLS LAST, id) as lec_num
    FROM lectures
)
UPDATE lectures
SET lecture_number = numbered_lectures.lec_num
FROM numbered_lectures
WHERE lectures.id = numbered_lectures.id
AND lectures.lecture_number IS NULL;

-- Update topics array based on linked topic_id
UPDATE lectures l
SET topics = ARRAY[t.name]
FROM topics t
WHERE l.topic_id = t.id
AND l.topics = '{}';

-- For lectures without a topic_id, set empty array
UPDATE lectures
SET topics = '{}'
WHERE topic_id IS NULL AND topics IS NULL;

-- Make lecture_number NOT NULL for future inserts
ALTER TABLE lectures ALTER COLUMN lecture_number SET NOT NULL;

-- Verify the update
DO $$
DECLARE
    lecture_count INT;
    lectures_with_topics INT;
BEGIN
    SELECT COUNT(*) INTO lecture_count FROM lectures;
    SELECT COUNT(*) INTO lectures_with_topics FROM lectures WHERE array_length(topics, 1) > 0;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'LECTURES SCHEMA FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Lectures: %', lecture_count;
    RAISE NOTICE 'Lectures with Topics: %', lectures_with_topics;
    RAISE NOTICE '========================================';
END $$;
