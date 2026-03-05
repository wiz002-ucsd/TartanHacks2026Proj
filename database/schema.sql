-- Sunzi — Intelligent Semester System
-- New schema: topic mastery tracking, quiz-based learning, risk scoring
-- Run this in your Supabase SQL Editor (pgvector must be enabled first)

-- Drop old tables (clean slate)
DROP TABLE IF EXISTS lectures CASCADE;
DROP TABLE IF EXISTS course_policies CASCADE;
DROP TABLE IF EXISTS grading_policies CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS topic_aggregate_stats CASCADE;
DROP TABLE IF EXISTS user_global_topic_mastery CASCADE;
DROP TABLE IF EXISTS course_deadlines CASCADE;
DROP TABLE IF EXISTS topic_prerequisites CASCADE;
DROP TABLE IF EXISTS course_topics CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS global_topics CASCADE;

-- ─────────────────────────────────────────────────────────────────
-- GLOBAL TOPICS — canonical cross-course concepts
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE global_topics (
  id             BIGSERIAL PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  embedding      vector(1536),          -- text-embedding-3-small output
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE courses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL,            -- Supabase Auth user (hardcoded for MVP)
  course_name TEXT NOT NULL,
  course_code TEXT,
  semester    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- COURSE TOPICS — maps courses to global topics
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE course_topics (
  id              BIGSERIAL PRIMARY KEY,
  course_id       BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  global_topic_id BIGINT NOT NULL REFERENCES global_topics(id),
  display_name    TEXT NOT NULL,        -- course-specific label (e.g. "Eigenvector decomposition")
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, global_topic_id)
);

-- ─────────────────────────────────────────────────────────────────
-- TOPIC PREREQUISITES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE topic_prerequisites (
  topic_id        BIGINT NOT NULL REFERENCES global_topics(id) ON DELETE CASCADE,
  prerequisite_id BIGINT NOT NULL REFERENCES global_topics(id) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, prerequisite_id)
);

-- ─────────────────────────────────────────────────────────────────
-- COURSE DEADLINES — replaces events table
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE course_deadlines (
  id         BIGSERIAL PRIMARY KEY,
  course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('exam', 'hw', 'project', 'quiz')),
  due_date   DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- USER MASTERY — per user per global topic
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE user_global_topic_mastery (
  user_id                UUID NOT NULL,
  global_topic_id        BIGINT NOT NULL REFERENCES global_topics(id) ON DELETE CASCADE,
  mastery_score          NUMERIC(5,4) NOT NULL DEFAULT 0,   -- 0.0000 to 1.0000
  last_practiced_at      TIMESTAMPTZ,
  total_attempts         INTEGER NOT NULL DEFAULT 0,
  threshold_reached_date TIMESTAMPTZ,
  PRIMARY KEY (user_id, global_topic_id)
);

-- ─────────────────────────────────────────────────────────────────
-- QUIZZES — AI-generated per topic
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE quizzes (
  id              BIGSERIAL PRIMARY KEY,
  topic_id        BIGINT NOT NULL REFERENCES global_topics(id) ON DELETE CASCADE,
  generated_by_ai BOOLEAN NOT NULL DEFAULT TRUE,
  questions       JSONB NOT NULL,  -- [{ question, options[], correct_index, explanation }]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- QUIZ ATTEMPTS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE quiz_attempts (
  id         BIGSERIAL PRIMARY KEY,
  quiz_id    BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL,
  score      NUMERIC(5,4) NOT NULL,   -- 0.0 to 1.0
  answers    JSONB,                   -- user's selected option indices
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- TOPIC AGGREGATE STATS — difficulty derived from all users
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE topic_aggregate_stats (
  global_topic_id     BIGINT PRIMARY KEY REFERENCES global_topics(id) ON DELETE CASCADE,
  avg_time_to_mastery NUMERIC(10,2),   -- seconds (NULL until enough samples)
  avg_attempts        NUMERIC(8,2),
  difficulty_score    NUMERIC(5,4) NOT NULL DEFAULT 0.5,  -- 0=easy, 1=hard
  sample_size         INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_courses_user_id             ON courses(user_id);
CREATE INDEX idx_course_topics_course_id     ON course_topics(course_id);
CREATE INDEX idx_course_topics_topic_id      ON course_topics(global_topic_id);
CREATE INDEX idx_course_deadlines_course_id  ON course_deadlines(course_id);
CREATE INDEX idx_course_deadlines_due_date   ON course_deadlines(due_date);
CREATE INDEX idx_mastery_user_id             ON user_global_topic_mastery(user_id);
CREATE INDEX idx_mastery_topic_id            ON user_global_topic_mastery(global_topic_id);
CREATE INDEX idx_quiz_attempts_user_id       ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id       ON quiz_attempts(quiz_id);
CREATE INDEX idx_quizzes_topic_id            ON quizzes(topic_id);

-- ─────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (development: allow all)
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE global_topics              ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_topics              ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_prerequisites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_deadlines           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_global_topic_mastery  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_aggregate_stats      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow all" ON global_topics             FOR ALL USING (true);
CREATE POLICY "allow all" ON courses                   FOR ALL USING (true);
CREATE POLICY "allow all" ON course_topics             FOR ALL USING (true);
CREATE POLICY "allow all" ON topic_prerequisites       FOR ALL USING (true);
CREATE POLICY "allow all" ON course_deadlines          FOR ALL USING (true);
CREATE POLICY "allow all" ON user_global_topic_mastery FOR ALL USING (true);
CREATE POLICY "allow all" ON quizzes                   FOR ALL USING (true);
CREATE POLICY "allow all" ON quiz_attempts             FOR ALL USING (true);
CREATE POLICY "allow all" ON topic_aggregate_stats     FOR ALL USING (true);
