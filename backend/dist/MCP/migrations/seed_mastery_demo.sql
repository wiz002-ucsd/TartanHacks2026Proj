-- Seed Mock Course with Topics and Mastery Progression
-- ============================================================================
-- This creates a demo course "Machine Learning Fundamentals" with topics
-- that have varying mastery levels to demonstrate the mastery tracking UI

-- ============================================================================
-- 1. INSERT DEMO COURSE
-- ============================================================================
INSERT INTO courses (name, code, term, units, instructor, semester_start, semester_end) VALUES
('Machine Learning Fundamentals', '10-601', 'Spring 2026', 12, 'Dr. Sarah Chen', '2026-01-13', '2026-05-08')
RETURNING id;

-- Get the course_id (we'll use 3 assuming it's the next ID)
DO $$
DECLARE
    v_course_id INT;
    v_topic_id_1 INT;
    v_topic_id_2 INT;
    v_topic_id_3 INT;
    v_topic_id_4 INT;
    v_topic_id_5 INT;
    v_topic_id_6 INT;
BEGIN
    -- Get the course ID we just created
    SELECT id INTO v_course_id FROM courses WHERE code = '10-601' ORDER BY created_at DESC LIMIT 1;

    RAISE NOTICE 'Course ID: %', v_course_id;

    -- ============================================================================
    -- 2. INSERT GRADING POLICY
    -- ============================================================================
    INSERT INTO grading_policies (course_id, homework, tests, project, quizzes) VALUES
    (v_course_id, 25, 35, 30, 10);

    RAISE NOTICE '✓ Inserted grading policy';

    -- ============================================================================
    -- 3. INSERT COURSE POLICIES
    -- ============================================================================
    INSERT INTO course_policies (course_id, late_days_total, late_days_per_hw, genai_allowed, genai_notes) VALUES
    (v_course_id, 5, 2, true, 'GenAI tools like ChatGPT are allowed for concept explanation but not for solving homework problems directly.');

    RAISE NOTICE '✓ Inserted course policies';

    -- ============================================================================
    -- 4. INSERT TOPICS WITH DESCRIPTIONS
    -- ============================================================================
    INSERT INTO topics (course_id, name, description) VALUES
    (v_course_id, 'Linear Regression', 'Introduction to supervised learning and linear models for regression')
    RETURNING id INTO v_topic_id_1;

    INSERT INTO topics (course_id, name, description) VALUES
    (v_course_id, 'Logistic Regression', 'Binary classification using logistic regression and decision boundaries')
    RETURNING id INTO v_topic_id_2;

    INSERT INTO topics (course_id, name, description) VALUES
    (v_course_id, 'Neural Networks', 'Deep learning fundamentals: feedforward networks, backpropagation, activation functions')
    RETURNING id INTO v_topic_id_3;

    INSERT INTO topics (course_id, name, description) VALUES
    (v_course_id, 'Decision Trees & Random Forests', 'Tree-based models for classification and regression')
    RETURNING id INTO v_topic_id_4;

    INSERT INTO topics (course_id, name, description) VALUES
    (v_course_id, 'K-Means Clustering', 'Unsupervised learning and clustering algorithms')
    RETURNING id INTO v_topic_id_5;

    INSERT INTO topics (course_id, name, description) VALUES
    (v_course_id, 'Support Vector Machines', 'SVMs, kernel methods, and margin-based classification')
    RETURNING id INTO v_topic_id_6;

    RAISE NOTICE '✓ Inserted 6 topics';

    -- ============================================================================
    -- 5. INSERT TOPIC MASTERY (with progression)
    -- ============================================================================
    -- Topic 1: Linear Regression (Expert level - 0.92)
    INSERT INTO topic_mastery (student_id, topic_id, mastery_score, previous_score, update_count, last_updated) VALUES
    (1, v_topic_id_1, 0.92, 0.85, 3, NOW() - INTERVAL '2 days');

    -- Topic 2: Logistic Regression (Proficient - 0.81)
    INSERT INTO topic_mastery (student_id, topic_id, mastery_score, previous_score, update_count, last_updated) VALUES
    (1, v_topic_id_2, 0.81, 0.75, 2, NOW() - INTERVAL '5 days');

    -- Topic 3: Neural Networks (Developing - 0.67)
    INSERT INTO topic_mastery (student_id, topic_id, mastery_score, previous_score, update_count, last_updated) VALUES
    (1, v_topic_id_3, 0.67, 0.55, 2, NOW() - INTERVAL '1 day');

    -- Topic 4: Decision Trees (Emerging - 0.45)
    INSERT INTO topic_mastery (student_id, topic_id, mastery_score, previous_score, update_count, last_updated) VALUES
    (1, v_topic_id_4, 0.45, 0.30, 1, NOW() - INTERVAL '3 days');

    -- Topic 5: K-Means (Foundational - 0.28)
    INSERT INTO topic_mastery (student_id, topic_id, mastery_score, previous_score, update_count, last_updated) VALUES
    (1, v_topic_id_5, 0.28, NULL, 1, NOW() - INTERVAL '7 days');

    -- Topic 6: SVMs (Not started - no mastery entry yet)

    RAISE NOTICE '✓ Inserted mastery data for 5 topics';

    -- ============================================================================
    -- 6. INSERT EVENTS (Homework, Tests, Quizzes)
    -- ============================================================================
    INSERT INTO events (course_id, topic_id, name, type, due_date, release_date, weight) VALUES
    (v_course_id, v_topic_id_1, 'Homework 1: Linear Regression', 'homework', CURRENT_DATE + 3, CURRENT_DATE - 7, 2.5),
    (v_course_id, v_topic_id_2, 'Homework 2: Logistic Regression', 'homework', CURRENT_DATE + 8, CURRENT_DATE - 2, 2.5),
    (v_course_id, v_topic_id_3, 'Homework 3: Neural Networks', 'homework', CURRENT_DATE + 15, CURRENT_DATE + 5, 2.5),
    (v_course_id, v_topic_id_1, 'Quiz 1: Regression Basics', 'quiz', CURRENT_DATE + 5, CURRENT_DATE, 2.5),
    (v_course_id, v_topic_id_3, 'Midterm Exam', 'test', CURRENT_DATE + 20, CURRENT_DATE + 10, 17.5),
    (v_course_id, v_topic_id_4, 'Homework 4: Decision Trees', 'homework', CURRENT_DATE + 22, CURRENT_DATE + 12, 2.5),
    (v_course_id, NULL, 'Final Project: ML Application', 'project', CURRENT_DATE + 45, CURRENT_DATE + 15, 30.0);

    RAISE NOTICE '✓ Inserted 7 events';

    -- ============================================================================
    -- 7. INSERT LECTURES
    -- ============================================================================
    INSERT INTO lectures (course_id, topic_id, lecture_number, title, date, topics, description) VALUES
    (v_course_id, v_topic_id_1, 1, 'Introduction to Machine Learning', CURRENT_DATE - 21, ARRAY['Linear Regression', 'Supervised Learning'], 'Course overview and introduction to regression'),
    (v_course_id, v_topic_id_1, 2, 'Linear Regression Deep Dive', CURRENT_DATE - 18, ARRAY['Linear Regression', 'Gradient Descent'], 'Mathematical foundations and optimization'),
    (v_course_id, v_topic_id_2, 3, 'Classification with Logistic Regression', CURRENT_DATE - 14, ARRAY['Logistic Regression', 'Binary Classification'], 'From regression to classification'),
    (v_course_id, v_topic_id_2, 4, 'Multi-class Classification', CURRENT_DATE - 11, ARRAY['Logistic Regression', 'Softmax'], 'Extending to multiple classes'),
    (v_course_id, v_topic_id_3, 5, 'Introduction to Neural Networks', CURRENT_DATE - 7, ARRAY['Neural Networks', 'Perceptron'], 'Building blocks of deep learning'),
    (v_course_id, v_topic_id_3, 6, 'Backpropagation', CURRENT_DATE - 4, ARRAY['Neural Networks', 'Gradient Descent'], 'Training neural networks'),
    (v_course_id, v_topic_id_4, 7, 'Decision Trees', CURRENT_DATE - 2, ARRAY['Decision Trees', 'Information Gain'], 'Tree-based learning algorithms'),
    (v_course_id, v_topic_id_4, 8, 'Random Forests & Ensemble Methods', CURRENT_DATE + 2, ARRAY['Random Forests', 'Bagging'], 'Combining multiple models'),
    (v_course_id, v_topic_id_5, 9, 'K-Means Clustering', CURRENT_DATE + 5, ARRAY['K-Means', 'Unsupervised Learning'], 'Introduction to clustering'),
    (v_course_id, v_topic_id_6, 10, 'Support Vector Machines', CURRENT_DATE + 9, ARRAY['SVMs', 'Kernel Methods'], 'Margin-based classification');

    RAISE NOTICE '✓ Inserted 10 lectures';

    -- ============================================================================
    -- 8. INSERT MASTERY HISTORY (showing progression)
    -- ============================================================================
    -- Linear Regression progression: 0.65 → 0.85 → 0.92
    INSERT INTO mastery_history (student_id, topic_id, old_score, new_score, change_reason, changed_at) VALUES
    (1, v_topic_id_1, 0.0, 0.65, 'Initial quiz performance', NOW() - INTERVAL '14 days'),
    (1, v_topic_id_1, 0.65, 0.85, 'Homework 1 completion with strong results', NOW() - INTERVAL '7 days'),
    (1, v_topic_id_1, 0.85, 0.92, 'Practice problems and review', NOW() - INTERVAL '2 days');

    -- Logistic Regression progression: 0.55 → 0.75 → 0.81
    INSERT INTO mastery_history (student_id, topic_id, old_score, new_score, change_reason, changed_at) VALUES
    (1, v_topic_id_2, 0.0, 0.55, 'Lecture attendance and notes', NOW() - INTERVAL '10 days'),
    (1, v_topic_id_2, 0.55, 0.75, 'Mid-topic quiz', NOW() - INTERVAL '6 days'),
    (1, v_topic_id_2, 0.75, 0.81, 'Homework 2 in progress', NOW() - INTERVAL '5 days');

    -- Neural Networks progression: 0.40 → 0.55 → 0.67
    INSERT INTO mastery_history (student_id, topic_id, old_score, new_score, change_reason, changed_at) VALUES
    (1, v_topic_id_3, 0.0, 0.40, 'Initial understanding from lectures', NOW() - INTERVAL '5 days'),
    (1, v_topic_id_3, 0.40, 0.55, 'Backpropagation practice', NOW() - INTERVAL '3 days'),
    (1, v_topic_id_3, 0.55, 0.67, 'Implementation exercises', NOW() - INTERVAL '1 day');

    RAISE NOTICE '✓ Inserted mastery history';

    -- ============================================================================
    -- SUCCESS SUMMARY
    -- ============================================================================
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DEMO COURSE CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Course: Machine Learning Fundamentals (10-601)';
    RAISE NOTICE 'Topics: 6 (with varying mastery levels)';
    RAISE NOTICE 'Events: 7 (homework, quizzes, exams, project)';
    RAISE NOTICE 'Lectures: 10';
    RAISE NOTICE '';
    RAISE NOTICE 'Mastery Levels:';
    RAISE NOTICE '  - Linear Regression: 92%% (Expert)';
    RAISE NOTICE '  - Logistic Regression: 81%% (Proficient)';
    RAISE NOTICE '  - Neural Networks: 67%% (Developing)';
    RAISE NOTICE '  - Decision Trees: 45%% (Emerging)';
    RAISE NOTICE '  - K-Means: 28%% (Foundational)';
    RAISE NOTICE '  - SVMs: Not started';
    RAISE NOTICE '========================================';
END $$;
