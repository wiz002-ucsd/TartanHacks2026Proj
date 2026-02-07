-- Migration 01: Create Core Schema for Academic Advisor with Mastery Tracking
-- ============================================================================
-- This creates the foundational tables for courses, topics, and assignments

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- COURSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL DEFAULT 1,  -- For single-student MVP, default to 1
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    term TEXT,
    semester_start DATE,
    semester_end DATE,
    instructor TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_student_id ON courses(student_id);
CREATE INDEX IF NOT EXISTS idx_courses_term ON courses(term);

-- ============================================================================
-- TOPICS TABLE (NEW for Mastery Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics(course_id);

-- ============================================================================
-- EVENTS TABLE (Your existing events structure)
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(id) ON DELETE SET NULL,  -- Optional link to topic
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('homework', 'test', 'quiz', 'project', 'exam', 'assignment', 'other')),
    due_date DATE NOT NULL,
    release_date DATE,
    weight FLOAT DEFAULT 0,  -- Percentage of final grade
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_course_id ON events(course_id);
CREATE INDEX IF NOT EXISTS idx_events_topic_id ON events(topic_id);
CREATE INDEX IF NOT EXISTS idx_events_due_date ON events(due_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

-- ============================================================================
-- ASSIGNMENTS TABLE (Enhanced with topic linking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(id) ON DELETE SET NULL,  -- Link to topic for mastery tracking
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('homework', 'test', 'quiz', 'project', 'exam', 'assignment', 'other')),
    due_date DATE NOT NULL,
    release_date DATE,
    weight FLOAT DEFAULT 0,  -- Percentage of final grade (e.g., 15 for 15%)
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded', 'late')),
    grade FLOAT,  -- Student's grade on this assignment
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_topic_id ON assignments(topic_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- ============================================================================
-- GRADING POLICIES TABLE (Your existing structure)
-- ============================================================================
CREATE TABLE IF NOT EXISTS grading_policies (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    category TEXT NOT NULL,  -- e.g., "Homework", "Exams", "Projects"
    weight FLOAT NOT NULL,   -- Percentage of final grade
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grading_policies_course_id ON grading_policies(course_id);

-- ============================================================================
-- COMMENTS / NOTES
-- ============================================================================

COMMENT ON TABLE courses IS 'Student courses with semester dates for progress tracking';
COMMENT ON TABLE topics IS 'Course topics for granular mastery tracking';
COMMENT ON TABLE events IS 'Course events and deadlines (original structure preserved)';
COMMENT ON TABLE assignments IS 'Assignments with topic linking for mastery correlation';
COMMENT ON TABLE grading_policies IS 'Grading breakdown per course';

COMMENT ON COLUMN assignments.topic_id IS 'Links assignment to topic for mastery tracking';
COMMENT ON COLUMN events.topic_id IS 'Optional topic link for calendar integration';
COMMENT ON COLUMN assignments.weight IS 'Assignment weight as percentage (e.g., 15 = 15%)';
