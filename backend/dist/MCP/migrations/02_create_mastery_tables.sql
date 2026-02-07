-- Migration 02: Create Mastery Tracking Tables
-- ============================================================================
-- This adds the mastery tracking system on top of the core schema

-- ============================================================================
-- TOPIC MASTERY TABLE (Core of mastery tracking system)
-- ============================================================================
CREATE TABLE IF NOT EXISTS topic_mastery (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL DEFAULT 1,  -- For single-student MVP
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    mastery_score FLOAT NOT NULL CHECK (mastery_score >= 0 AND mastery_score <= 1),
    last_updated TIMESTAMP DEFAULT NOW(),

    -- Metadata for tracking improvement
    previous_score FLOAT,  -- Score before last update
    update_count INT DEFAULT 1,  -- Number of times updated

    -- Ensure one mastery record per student-topic pair
    UNIQUE(student_id, topic_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_topic_mastery_student_id ON topic_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_topic_id ON topic_mastery(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_score ON topic_mastery(mastery_score);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_last_updated ON topic_mastery(last_updated);

-- ============================================================================
-- QUIZZES TABLE (For scheduled assessments linked to topics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    duration_minutes INT,  -- Expected duration
    weight FLOAT DEFAULT 10,  -- Percentage of final grade

    -- Quiz metadata
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_count INT,

    -- Student performance (nullable until taken)
    student_score FLOAT CHECK (student_score >= 0 AND student_score <= 1),  -- 0.0-1.0
    time_taken_minutes INT,
    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_scheduled_date ON quizzes(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_quizzes_completed_at ON quizzes(completed_at);

-- ============================================================================
-- FLASHCARD SESSIONS TABLE (For tracking study sessions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS flashcard_sessions (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL DEFAULT 1,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,

    -- Session metrics
    cards_reviewed INT NOT NULL,
    correct_count INT NOT NULL,
    session_duration_seconds INT NOT NULL,

    -- Confidence ratings (JSON array of 1-5 ratings)
    confidence_ratings JSONB,  -- e.g., [4, 5, 3, 4, 5]

    -- Calculated metrics
    accuracy FLOAT GENERATED ALWAYS AS (
        CASE
            WHEN cards_reviewed > 0 THEN correct_count::FLOAT / cards_reviewed
            ELSE 0
        END
    ) STORED,

    avg_confidence FLOAT,  -- Average of confidence_ratings

    completed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_student_id ON flashcard_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_topic_id ON flashcard_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_completed_at ON flashcard_sessions(completed_at);

-- ============================================================================
-- MASTERY HISTORY TABLE (Audit trail of mastery changes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mastery_history (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    old_score FLOAT NOT NULL,
    new_score FLOAT NOT NULL,
    change_reason TEXT,  -- e.g., "quiz_completed", "flashcard_session"
    reference_id INT,    -- ID of quiz or session that triggered change
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mastery_history_student_topic ON mastery_history(student_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_mastery_history_changed_at ON mastery_history(changed_at);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger: Update topic_mastery.last_updated on changes
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

-- Trigger: Log mastery changes to history
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

-- Function: Get current mastery level label
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

-- Function: Calculate topic urgency
CREATE OR REPLACE FUNCTION calculate_topic_urgency(
    p_mastery_score FLOAT,
    p_days_until_assessment INT,
    p_assessment_weight FLOAT
)
RETURNS TEXT AS $$
BEGIN
    -- Critical: low mastery + imminent high-weight assessment
    IF p_mastery_score < 0.5 AND p_days_until_assessment <= 3 AND p_assessment_weight >= 15 THEN
        RETURN 'critical';
    END IF;

    -- High: low mastery + soon OR high-weight assessment close
    IF (p_mastery_score < 0.5 AND p_days_until_assessment <= 7) OR
       (p_days_until_assessment <= 5 AND p_assessment_weight >= 20) THEN
        RETURN 'high';
    END IF;

    -- Medium: moderate mastery with upcoming assessment
    IF p_mastery_score < 0.7 AND p_days_until_assessment <= 10 THEN
        RETURN 'medium';
    END IF;

    RETURN 'low';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Topics with mastery and next assessment
CREATE OR REPLACE VIEW topics_with_mastery AS
SELECT
    t.id AS topic_id,
    t.name AS topic_name,
    t.course_id,
    c.code AS course_code,
    c.name AS course_name,
    tm.mastery_score,
    get_mastery_level(tm.mastery_score) AS mastery_level,
    tm.last_updated AS mastery_last_updated,

    -- Next assessment info (from both quizzes and assignments)
    (
        SELECT json_build_object(
            'type', COALESCE(q.name, a.name),
            'date', COALESCE(q.scheduled_date, a.due_date),
            'weight', COALESCE(q.weight, a.weight),
            'source', CASE WHEN q.id IS NOT NULL THEN 'quiz' ELSE 'assignment' END
        )
        FROM (
            SELECT id, name, scheduled_date, weight, topic_id
            FROM quizzes
            WHERE topic_id = t.id AND scheduled_date >= CURRENT_DATE
            ORDER BY scheduled_date ASC
            LIMIT 1
        ) q
        FULL OUTER JOIN (
            SELECT id, name, due_date, weight, topic_id
            FROM assignments
            WHERE topic_id = t.id AND due_date >= CURRENT_DATE
            ORDER BY due_date ASC
            LIMIT 1
        ) a ON q.topic_id = a.topic_id
        ORDER BY COALESCE(q.scheduled_date, a.due_date) ASC
        LIMIT 1
    ) AS next_assessment

FROM topics t
LEFT JOIN courses c ON t.course_id = c.id
LEFT JOIN topic_mastery tm ON t.id = tm.topic_id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE topic_mastery IS 'Core mastery tracking: one record per student-topic with 0-1 score';
COMMENT ON TABLE quizzes IS 'Scheduled quizzes linked to topics for assessment tracking';
COMMENT ON TABLE flashcard_sessions IS 'Flashcard practice sessions for mastery updates';
COMMENT ON TABLE mastery_history IS 'Audit trail of all mastery score changes';

COMMENT ON COLUMN topic_mastery.mastery_score IS 'Student understanding level: 0.0 (none) to 1.0 (expert)';
COMMENT ON COLUMN quizzes.student_score IS 'Score as decimal (0.85 = 85%), NULL until completed';
COMMENT ON COLUMN flashcard_sessions.confidence_ratings IS 'JSON array of 1-5 self-reported confidence per card';

COMMENT ON FUNCTION get_mastery_level IS 'Convert numeric mastery (0-1) to label (foundational/emerging/developing/proficient/expert)';
COMMENT ON FUNCTION calculate_topic_urgency IS 'Compute urgency level based on mastery, deadline proximity, and weight';
