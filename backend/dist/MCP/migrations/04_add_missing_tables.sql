-- Migration 04: Add Missing Tables (lectures, course_policies)
-- ============================================================================
-- This adds tables that the frontend expects but were missing from core schema

-- ============================================================================
-- LECTURES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS lectures (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    date DATE,
    time TIME,
    location TEXT,
    description TEXT,
    materials_url TEXT,
    recording_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lectures_course_id ON lectures(course_id);
CREATE INDEX IF NOT EXISTS idx_lectures_topic_id ON lectures(topic_id);
CREATE INDEX IF NOT EXISTS idx_lectures_date ON lectures(date);

-- ============================================================================
-- COURSE POLICIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS course_policies (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    policy_type TEXT NOT NULL,  -- e.g., 'attendance', 'late_work', 'collaboration'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_policies_course_id ON course_policies(course_id);
CREATE INDEX IF NOT EXISTS idx_course_policies_policy_type ON course_policies(policy_type);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE lectures IS 'Course lectures/classes with schedule and materials';
COMMENT ON TABLE course_policies IS 'Course policies (attendance, late work, etc.)';

-- ============================================================================
-- SEED SAMPLE LECTURES (Optional)
-- ============================================================================

INSERT INTO lectures (course_id, topic_id, title, date, time, location, description) VALUES
-- 18-665 Lectures
(1, 1, 'Introduction to Probability Distributions', CURRENT_DATE - 14, '10:00', 'Wean Hall 5409', 'Overview of discrete and continuous distributions'),
(1, 2, 'Hypothesis Testing Fundamentals', CURRENT_DATE - 7, '10:00', 'Wean Hall 5409', 'Introduction to statistical hypothesis testing'),
(1, 3, 'Linear Regression Theory', CURRENT_DATE, '10:00', 'Wean Hall 5409', 'Theory and practice of linear regression'),

-- 12-222 Lectures
(2, 5, 'Thermodynamics First Law', CURRENT_DATE - 10, '14:00', 'Doherty Hall 1212', 'Energy conservation and enthalpy'),
(2, 6, 'Chemical Equilibrium Principles', CURRENT_DATE - 3, '14:00', 'Doherty Hall 1212', 'Equilibrium constants and Le Chatelier'),
(2, 7, 'Reaction Kinetics', CURRENT_DATE + 2, '14:00', 'Doherty Hall 1212', 'Rate laws and reaction mechanisms'),

-- 18-460 Lectures
(3, 8, 'Linear Programming Introduction', CURRENT_DATE - 12, '13:00', 'Gates 4401', 'LP formulation and graphical method'),
(3, 9, 'Convex Sets and Functions', CURRENT_DATE - 5, '13:00', 'Gates 4401', 'Properties of convex optimization problems'),
(3, 10, 'Integer Programming Basics', CURRENT_DATE + 1, '13:00', 'Gates 4401', 'IP formulation and branch-and-bound')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED SAMPLE COURSE POLICIES
-- ============================================================================

INSERT INTO course_policies (course_id, policy_type, title, description) VALUES
-- 18-665 Policies
(1, 'attendance', 'Attendance Policy', 'Attendance is not mandatory but strongly recommended. Lecture materials will be posted online.'),
(1, 'late_work', 'Late Submission Policy', 'Homework submitted within 24 hours of deadline: 10% penalty. After 24 hours: 50% penalty. No submissions accepted after 48 hours.'),
(1, 'collaboration', 'Collaboration Policy', 'You may discuss homework problems with classmates, but you must write up solutions independently. Exams are strictly individual.'),
(1, 'grading', 'Regrade Policy', 'Regrade requests must be submitted within 7 days of receiving graded work via Gradescope.'),

-- 12-222 Policies
(2, 'attendance', 'Lab Attendance', 'Lab attendance is MANDATORY. Missing a lab without prior approval will result in a zero for that lab.'),
(2, 'late_work', 'Late Lab Reports', 'Lab reports submitted late will receive a 20% deduction per day. No reports accepted after 3 days.'),
(2, 'safety', 'Safety Policy', 'You must complete safety training before the first lab. Safety violations may result in removal from lab and a failing grade.'),
(2, 'collaboration', 'Lab Partners', 'Labs are done in pairs. Both partners must contribute equally and submit individual reports.'),

-- 18-460 Policies
(3, 'attendance', 'Class Participation', 'Attendance is expected but not graded. Active participation in discussions is encouraged.'),
(3, 'late_work', 'Problem Set Policy', 'Each student has 3 late days to use throughout the semester (max 2 per assignment). After that: no late work accepted.'),
(3, 'collaboration', 'Collaboration Guidelines', 'Collaboration is encouraged on problem sets. You must cite all collaborators. Exams and project work must be individual.'),
(3, 'technology', 'Software Tools', 'You may use any programming language or optimization solver. Python with CVXPY is recommended and supported.')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
    lecture_count INT;
    policy_count INT;
BEGIN
    SELECT COUNT(*) INTO lecture_count FROM lectures;
    SELECT COUNT(*) INTO policy_count FROM course_policies;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'MISSING TABLES ADDED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Lectures: %', lecture_count;
    RAISE NOTICE 'Course Policies: %', policy_count;
    RAISE NOTICE '========================================';
END $$;
