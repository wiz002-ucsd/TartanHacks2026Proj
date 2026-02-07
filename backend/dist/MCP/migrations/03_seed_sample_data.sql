-- Migration 03: Seed Sample Data for Testing Mastery System
-- ============================================================================
-- This adds realistic sample data to test the mastery tracking system

-- ============================================================================
-- SAMPLE COURSES
-- ============================================================================

INSERT INTO courses (id, student_id, name, code, term, semester_start, semester_end, instructor) VALUES
(1, 1, 'Advanced Probability & Statistics for Engineers', '18-665/465', 'Spring 2026', '2026-01-13', '2026-05-08', 'Dr. Sarah Chen'),
(2, 1, 'Environmental Chemistry and Thermodynamics Laboratory', '12-222', 'Spring 2026', '2026-01-13', '2026-05-08', 'Prof. Michael Torres'),
(3, 1, 'Optimization', '18-460/18-660', 'Spring 2026', '2026-01-13', '2026-05-08', 'Dr. Emily Rodriguez')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));

-- ============================================================================
-- SAMPLE TOPICS (3-4 per course)
-- ============================================================================

INSERT INTO topics (id, course_id, name, description) VALUES
-- 18-665 Topics
(1, 1, 'Probability Distributions', 'Discrete and continuous distributions, PDFs, CDFs'),
(2, 1, 'Hypothesis Testing', 'T-tests, chi-square, ANOVA, p-values'),
(3, 1, 'Regression Analysis', 'Linear regression, multiple regression, model selection'),
(4, 1, 'Markov Chains', 'State transitions, steady-state analysis'),

-- 12-222 Topics
(5, 2, 'Thermodynamic Laws', 'First and second laws, entropy, enthalpy'),
(6, 2, 'Chemical Equilibrium', 'Equilibrium constants, Le Chatelier principle'),
(7, 2, 'Reaction Kinetics', 'Rate laws, activation energy, catalysis'),

-- 18-460 Topics
(8, 3, 'Linear Programming', 'Simplex method, duality, sensitivity analysis'),
(9, 3, 'Convex Optimization', 'Convex sets, convex functions, KKT conditions'),
(10, 3, 'Integer Programming', 'Branch and bound, cutting planes'),
(11, 3, 'Dynamic Programming', 'Bellman equations, value iteration')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('topics_id_seq', (SELECT MAX(id) FROM topics));

-- ============================================================================
-- SAMPLE MASTERY SCORES (Realistic distribution)
-- ============================================================================

INSERT INTO topic_mastery (student_id, topic_id, mastery_score, last_updated, previous_score, update_count) VALUES
-- 18-665: Mixed performance
(1, 1, 0.72, NOW() - INTERVAL '2 days', 0.65, 3),    -- Probability Distributions - Good
(1, 2, 0.35, NOW() - INTERVAL '5 days', 0.30, 2),    -- Hypothesis Testing - LOW (needs work!)
(1, 3, 0.58, NOW() - INTERVAL '1 day', 0.50, 4),     -- Regression - Developing
(1, 4, 0.45, NOW() - INTERVAL '3 days', 0.40, 2),    -- Markov Chains - Emerging

-- 12-222: Generally strong but one weak spot
(1, 5, 0.82, NOW() - INTERVAL '1 day', 0.75, 5),     -- Thermodynamic Laws - Proficient
(1, 6, 0.68, NOW() - INTERVAL '4 days', 0.60, 3),    -- Chemical Equilibrium - Developing
(1, 7, 0.42, NOW() - INTERVAL '6 days', 0.38, 2),    -- Reaction Kinetics - LOW

-- 18-460: Early in semester, lower scores expected
(1, 8, 0.55, NOW() - INTERVAL '2 days', 0.45, 3),    -- Linear Programming - Emerging/Developing
(1, 9, 0.38, NOW() - INTERVAL '1 day', 0.30, 2),     -- Convex Optimization - LOW (just started)
(1, 10, 0.50, NOW() - INTERVAL '3 days', 0.45, 2),   -- Integer Programming - Emerging
(1, 11, 0.25, NOW() - INTERVAL '7 days', 0.20, 1)    -- Dynamic Programming - VERY LOW (just introduced)
ON CONFLICT (student_id, topic_id) DO UPDATE SET
    mastery_score = EXCLUDED.mastery_score,
    last_updated = EXCLUDED.last_updated;

-- ============================================================================
-- SAMPLE UPCOMING EVENTS/DEADLINES
-- ============================================================================

INSERT INTO events (course_id, topic_id, name, type, due_date, release_date, weight) VALUES
-- 18-665 Events
(1, 2, 'Homework 4: Hypothesis Testing', 'homework', CURRENT_DATE + 5, CURRENT_DATE - 2, 8),
(1, 3, 'Midterm Exam', 'exam', CURRENT_DATE + 12, NULL, 25),
(1, 4, 'Project: Markov Chain Analysis', 'project', CURRENT_DATE + 18, CURRENT_DATE - 5, 15),

-- 12-222 Events
(2, 7, 'Lab Report: Kinetics Experiment', 'project', CURRENT_DATE + 7, CURRENT_DATE - 3, 12),
(2, 6, 'Quiz 2: Equilibrium', 'quiz', CURRENT_DATE + 9, NULL, 10),

-- 18-460 Events
(3, 9, 'Problem Set 3: Convex Functions', 'homework', CURRENT_DATE + 6, CURRENT_DATE - 1, 10),
(3, 8, 'Quiz 1: Linear Programming', 'quiz', CURRENT_DATE + 4, NULL, 8)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE ASSIGNMENTS (More detailed than events)
-- ============================================================================

INSERT INTO assignments (course_id, topic_id, name, type, due_date, release_date, weight, status) VALUES
-- 18-665 Assignments
(1, 2, 'Homework 4: Hypothesis Testing Applications', 'homework',
 CURRENT_DATE + 5, CURRENT_DATE - 2, 8, 'pending'),

(1, 3, 'Homework 5: Regression Analysis', 'homework',
 CURRENT_DATE + 12, CURRENT_DATE + 5, 8, 'pending'),

(1, NULL, 'Midterm Exam', 'exam',
 CURRENT_DATE + 12, NULL, 25, 'pending'),

-- 12-222 Assignments
(2, 7, 'Lab Report: Reaction Kinetics Study', 'project',
 CURRENT_DATE + 7, CURRENT_DATE - 3, 12, 'pending'),

(2, 6, 'Pre-Lab: Equilibrium Calculations', 'homework',
 CURRENT_DATE + 3, CURRENT_DATE - 1, 5, 'pending'),

-- 18-460 Assignments
(3, 9, 'Problem Set 3: Convex Optimization', 'homework',
 CURRENT_DATE + 6, CURRENT_DATE - 1, 10, 'pending'),

(3, 10, 'Project Proposal: Integer Programming Application', 'project',
 CURRENT_DATE + 20, CURRENT_DATE, 15, 'pending')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE QUIZZES (High urgency items)
-- ============================================================================

INSERT INTO quizzes (topic_id, course_id, name, scheduled_date, duration_minutes, weight, difficulty, question_count) VALUES
-- CRITICAL: Low mastery + soon + high weight
(2, 1, 'Quiz: Hypothesis Testing Fundamentals', CURRENT_DATE + 5, 45, 15, 'medium', 8),

-- High urgency items
(7, 2, 'Quiz: Kinetics Concepts', CURRENT_DATE + 7, 30, 10, 'medium', 6),
(8, 3, 'Quiz: Linear Programming Basics', CURRENT_DATE + 4, 40, 8, 'easy', 10),

-- Medium urgency
(9, 3, 'Quiz: Convex Sets and Functions', CURRENT_DATE + 13, 45, 12, 'hard', 7),
(6, 2, 'Quiz: Chemical Equilibrium', CURRENT_DATE + 9, 35, 10, 'medium', 5)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE GRADING POLICIES
-- ============================================================================

INSERT INTO grading_policies (course_id, category, weight, details) VALUES
(1, 'Homework', 30, '8 assignments, lowest dropped'),
(1, 'Quizzes', 15, '4 quizzes, no drops'),
(1, 'Midterm Exam', 25, 'One midterm'),
(1, 'Final Exam', 30, 'Cumulative final'),

(2, 'Lab Reports', 40, '10 labs, lowest dropped'),
(2, 'Quizzes', 20, '6 quizzes throughout term'),
(2, 'Pre-Labs', 15, 'Completion-based'),
(2, 'Final Exam', 25, 'Practical and written components'),

(3, 'Problem Sets', 40, '10 weekly assignments'),
(3, 'Quizzes', 20, '5 quizzes'),
(3, 'Project', 15, 'Optimization application project'),
(3, 'Final Exam', 25, 'Comprehensive exam')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE FLASHCARD SESSIONS (Past study activity)
-- ============================================================================

INSERT INTO flashcard_sessions (student_id, topic_id, cards_reviewed, correct_count, session_duration_seconds, confidence_ratings, avg_confidence, completed_at) VALUES
-- Recent strong session
(1, 1, 20, 18, 900, '[5, 5, 4, 5, 5, 4, 5, 5, 3, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4]', 4.6, NOW() - INTERVAL '1 day'),

-- Recent weak session (shows need for work)
(1, 2, 15, 6, 600, '[2, 3, 2, 1, 3, 2, 3, 4, 2, 3, 2, 1, 3, 2, 3]', 2.4, NOW() - INTERVAL '2 days'),

-- Older sessions showing improvement
(1, 3, 18, 12, 800, '[3, 4, 3, 4, 3, 3, 4, 3, 4, 3, 4, 3, 3, 4, 4, 3, 4, 3]', 3.4, NOW() - INTERVAL '3 days'),
(1, 5, 25, 22, 1100, '[4, 5, 5, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4]', 4.5, NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUMMARY STATISTICS
-- ============================================================================

DO $$
DECLARE
    course_count INT;
    topic_count INT;
    mastery_count INT;
    avg_mastery FLOAT;
    low_mastery_count INT;
BEGIN
    SELECT COUNT(*) INTO course_count FROM courses;
    SELECT COUNT(*) INTO topic_count FROM topics;
    SELECT COUNT(*) INTO mastery_count FROM topic_mastery;
    SELECT ROUND(AVG(mastery_score)::numeric, 2) INTO avg_mastery FROM topic_mastery;
    SELECT COUNT(*) INTO low_mastery_count FROM topic_mastery WHERE mastery_score < 0.5;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SAMPLE DATA SEEDED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Courses: %', course_count;
    RAISE NOTICE 'Topics: %', topic_count;
    RAISE NOTICE 'Mastery Records: %', mastery_count;
    RAISE NOTICE 'Average Mastery: %', avg_mastery;
    RAISE NOTICE 'Topics with Low Mastery (<0.5): %', low_mastery_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Key Test Scenarios:';
    RAISE NOTICE '  - Topic 2 (Hypothesis Testing): 0.35 mastery, quiz in 5 days, 15%% weight → CRITICAL';
    RAISE NOTICE '  - Topic 7 (Reaction Kinetics): 0.42 mastery, lab report in 7 days → HIGH urgency';
    RAISE NOTICE '  - Topic 11 (Dynamic Programming): 0.25 mastery, no immediate deadline → Low urgency but foundational gap';
    RAISE NOTICE '========================================';
END $$;
