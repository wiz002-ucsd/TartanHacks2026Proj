-- Supabase Database Schema for Syllabus Ingestion
-- Run this in your Supabase SQL Editor

-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS lectures CASCADE;
DROP TABLE IF EXISTS course_policies CASCADE;
DROP TABLE IF EXISTS grading_policies CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Courses table
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  term TEXT NOT NULL,
  units INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grading policies table (1-to-1 with courses)
CREATE TABLE grading_policies (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  homework NUMERIC(5,2), -- percentage as decimal (e.g., 30.50 for 30.5%)
  tests NUMERIC(5,2),
  project NUMERIC(5,2),
  quizzes NUMERIC(5,2),
  UNIQUE(course_id)
);

-- Events table (1-to-many with courses)
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('homework', 'test', 'project', 'quiz')),
  name TEXT NOT NULL,
  release_date DATE,
  due_date DATE,
  weight NUMERIC(5,2), -- percentage as decimal
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lectures table (1-to-many with courses)
CREATE TABLE lectures (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lecture_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  date DATE,
  topics TEXT[], -- Array of topics covered
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course policies table (1-to-1 with courses)
CREATE TABLE course_policies (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  late_days_total INTEGER,
  late_days_per_hw INTEGER,
  genai_allowed BOOLEAN,
  genai_notes TEXT,
  UNIQUE(course_id)
);

-- Indexes for performance
CREATE INDEX idx_events_course_id ON events(course_id);
CREATE INDEX idx_events_due_date ON events(due_date);
CREATE INDEX idx_lectures_course_id ON lectures(course_id);
CREATE INDEX idx_lectures_date ON lectures(date);
CREATE INDEX idx_grading_policies_course_id ON grading_policies(course_id);
CREATE INDEX idx_course_policies_course_id ON course_policies(course_id);

-- Enable Row Level Security (optional, but recommended for Supabase)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_policies ENABLE ROW LEVEL SECURITY;

-- For development: allow all operations (replace with proper auth later)
CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all operations on grading_policies" ON grading_policies FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations on lectures" ON lectures FOR ALL USING (true);
CREATE POLICY "Allow all operations on course_policies" ON course_policies FOR ALL USING (true);
