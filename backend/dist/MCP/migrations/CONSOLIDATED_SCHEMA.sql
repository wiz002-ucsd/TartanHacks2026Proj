-- CONSOLIDATED SCHEMA: Complete Database Setup (All-in-One)
-- ============================================================================
-- This single file creates the entire schema correctly from scratch
-- Run this after 00_CLEAN_SLATE.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. COURSES TABLE
-- ============================================================================
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    term TEXT,
    units INT,  -- Credit units/hours for the course
    semester_start DATE,
    semester_end DATE,
    instructor TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_courses_student_id ON courses(student_id);
CREATE INDEX idx_courses_term ON courses(term);

-- ============================================================================
-- 2. TOPICS TABLE
-- ============================================================================
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_topics_course_id ON topics(course_id);

-- ============================================================================
-- 3. EVENTS TABLE
-- ============================================================================
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('homework', 'test', 'quiz', 'project', 'exam', 'assignment', 'other')),
    due_date DATE NOT NULL,
    release_date DATE,
    weight FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_course_id ON events(course_id);
CREATE INDEX idx_events_topic_id ON events(topic_id);
CREATE INDEX idx_events_due_date ON events(due_date);
CREATE INDEX idx_events_type ON events(type);

-- ============================================================================
-- 4. ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('homework', 'test', 'quiz', 'project', 'exam', 'assignment', 'other')),
    due_date DATE NOT NULL,
    release_date DATE,
    weight FLOAT DEFAULT 0,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded', 'late')),
    grade FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assignments_course_id ON assignments(course_id);
CREATE INDEX idx_assignments_topic_id ON assignments(topic_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_status ON assignments(status);

-- ============================================================================
-- 5. GRADING POLICIES TABLE
-- ============================================================================
CREATE TABLE grading_policies (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    homework FLOAT,  -- Percentage weight for homework (e.g., 30.0 for 30%)
    tests FLOAT,     -- Percentage weight for tests
    project FLOAT,   -- Percentage weight for projects
    quizzes FLOAT,   -- Percentage weight for quizzes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grading_policies_course_id ON grading_policies(course_id);

-- ============================================================================
-- 6. LECTURES TABLE (Fixed for Frontend)
-- ============================================================================
CREATE TABLE lectures (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(id) ON DELETE SET NULL,
    lecture_number INT NOT NULL,  -- Frontend expects this
    title TEXT NOT NULL,
    date DATE,
    time TIME,
    location TEXT,
    topics TEXT[] DEFAULT '{}',  -- Frontend expects string array
    description TEXT,
    materials_url TEXT,
    recording_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lectures_course_id ON lectures(course_id);
CREATE INDEX idx_lectures_topic_id ON lectures(topic_id);
CREATE INDEX idx_lectures_date ON lectures(date);

-- ============================================================================
-- 7. COURSE POLICIES TABLE
-- ============================================================================
CREATE TABLE course_policies (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    late_days_total INT,        -- Total late days allowed for semester
    late_days_per_hw INT,        -- Max late days per homework
    genai_allowed BOOLEAN,       -- Whether GenAI tools are allowed
    genai_notes TEXT,            -- Additional notes about GenAI usage
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_course_policies_course_id ON course_policies(course_id);

-- ============================================================================
-- 8. TOPIC MASTERY TABLE (Mastery Tracking)
-- ============================================================================
CREATE TABLE topic_mastery (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL DEFAULT 1,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    mastery_score FLOAT NOT NULL CHECK (mastery_score >= 0 AND mastery_score <= 1),
    last_updated TIMESTAMP DEFAULT NOW(),
    previous_score FLOAT,
    update_count INT DEFAULT 1,
    UNIQUE(student_id, topic_id)
);

CREATE INDEX idx_topic_mastery_student_id ON topic_mastery(student_id);
CREATE INDEX idx_topic_mastery_topic_id ON topic_mastery(topic_id);
CREATE INDEX idx_topic_mastery_score ON topic_mastery(mastery_score);
CREATE INDEX idx_topic_mastery_last_updated ON topic_mastery(last_updated);

-- ============================================================================
-- 9. QUIZZES TABLE
-- ============================================================================
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    duration_minutes INT,
    weight FLOAT DEFAULT 10,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_count INT,
    student_score FLOAT CHECK (student_score >= 0 AND student_score <= 1),
    time_taken_minutes INT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX idx_quizzes_scheduled_date ON quizzes(scheduled_date);
CREATE INDEX idx_quizzes_completed_at ON quizzes(completed_at);

-- ============================================================================
-- 10. FLASHCARD SESSIONS TABLE
-- ============================================================================
CREATE TABLE flashcard_sessions (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL DEFAULT 1,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    cards_reviewed INT NOT NULL,
    correct_count INT NOT NULL,
    session_duration_seconds INT NOT NULL,
    confidence_ratings JSONB,
    accuracy FLOAT GENERATED ALWAYS AS (
        CASE WHEN cards_reviewed > 0 THEN correct_count::FLOAT / cards_reviewed ELSE 0 END
    ) STORED,
    avg_confidence FLOAT,
    completed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flashcard_sessions_student_id ON flashcard_sessions(student_id);
CREATE INDEX idx_flashcard_sessions_topic_id ON flashcard_sessions(topic_id);
CREATE INDEX idx_flashcard_sessions_completed_at ON flashcard_sessions(completed_at);

-- ============================================================================
-- 11. MASTERY HISTORY TABLE
-- ============================================================================
CREATE TABLE mastery_history (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    old_score FLOAT NOT NULL,
    new_score FLOAT NOT NULL,
    change_reason TEXT,
    reference_id INT,
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mastery_history_student_topic ON mastery_history(student_id, topic_id);
CREATE INDEX idx_mastery_history_changed_at ON mastery_history(changed_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update topic_mastery timestamp
CREATE OR REPLACE FUNCTION update_topic_mastery_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_topic_mastery_timestamp
    BEFORE UPDATE ON topic_mastery
    FOR EACH ROW
    EXECUTE FUNCTION update_topic_mastery_timestamp();

-- Log mastery changes
CREATE OR REPLACE FUNCTION log_mastery_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.mastery_score IS DISTINCT FROM NEW.mastery_score THEN
        INSERT INTO mastery_history (student_id, topic_id, old_score, new_score)
        VALUES (NEW.student_id, NEW.topic_id, OLD.mastery_score, NEW.mastery_score);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_mastery_change
    AFTER UPDATE ON topic_mastery
    FOR EACH ROW
    WHEN (OLD.mastery_score IS DISTINCT FROM NEW.mastery_score)
    EXECUTE FUNCTION log_mastery_change();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_mastery_level(score FLOAT)
RETURNS TEXT AS $$
BEGIN
    CASE
        WHEN score >= 0.9 THEN RETURN 'expert';
        WHEN score >= 0.75 THEN RETURN 'proficient';
        WHEN score >= 0.6 THEN RETURN 'developing';
        WHEN score >= 0.4 THEN RETURN 'emerging';
        ELSE RETURN 'foundational';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_topic_urgency(
    p_mastery_score FLOAT,
    p_days_until_assessment INT,
    p_assessment_weight FLOAT
)
RETURNS TEXT AS $$
BEGIN
    IF p_mastery_score < 0.5 AND p_days_until_assessment <= 3 AND p_assessment_weight >= 15 THEN
        RETURN 'critical';
    END IF;
    IF (p_mastery_score < 0.5 AND p_days_until_assessment <= 7) OR
       (p_days_until_assessment <= 5 AND p_assessment_weight >= 20) THEN
        RETURN 'high';
    END IF;
    IF p_mastery_score < 0.7 AND p_days_until_assessment <= 10 THEN
        RETURN 'medium';
    END IF;
    RETURN 'low';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW topics_with_mastery AS
SELECT
    t.id AS topic_id,
    t.name AS topic_name,
    t.course_id,
    c.code AS course_code,
    c.name AS course_name,
    tm.mastery_score,
    get_mastery_level(tm.mastery_score) AS mastery_level,
    tm.last_updated AS mastery_last_updated
FROM topics t
LEFT JOIN courses c ON t.course_id = c.id
LEFT JOIN topic_mastery tm ON t.id = tm.topic_id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE courses IS 'Student courses with semester dates and units';
COMMENT ON TABLE topics IS 'Course topics for mastery tracking';
COMMENT ON TABLE events IS 'Course events and deadlines';
COMMENT ON TABLE assignments IS 'Assignments with topic linking';
COMMENT ON TABLE grading_policies IS 'Grading breakdown (homework, tests, project, quizzes weights)';
COMMENT ON TABLE lectures IS 'Course lectures with schedule (lecture_number and topics[] for frontend)';
COMMENT ON TABLE course_policies IS 'Course policies (late days, GenAI usage rules)';
COMMENT ON TABLE topic_mastery IS 'Core mastery tracking (0-1 score per topic)';
COMMENT ON TABLE quizzes IS 'Scheduled quizzes linked to topics';
COMMENT ON TABLE flashcard_sessions IS 'Study session tracking';
COMMENT ON TABLE mastery_history IS 'Audit trail of mastery changes';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCHEMA CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All tables, indexes, functions, and views created';
    RAISE NOTICE 'Ready for data - use syllabus upload or seed data';
    RAISE NOTICE '========================================';
END $$;
