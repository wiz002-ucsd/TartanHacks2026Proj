#!/usr/bin/env python3
"""
Seed Demo Course with Mastery Progression
Inserts a Machine Learning course with topics at varying mastery levels
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv(Path(__file__).parent / '.env')

def seed_demo_course():
    """Insert demo course with mastery progression into database."""

    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SECRET_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        return False

    supabase: Client = create_client(supabase_url, supabase_key)

    print("=" * 70)
    print("SEEDING DEMO COURSE: Machine Learning Fundamentals")
    print("=" * 70)
    print()

    try:
        # Read the SQL file
        sql_file = Path(__file__).parent / 'migrations' / 'seed_mastery_demo.sql'
        with open(sql_file, 'r') as f:
            sql_content = f.read()

        print("📄 Executing SQL script...")
        print()

        # Execute the SQL using Supabase RPC (if available) or direct SQL execution
        # For now, we'll use the Python Supabase client to insert data step by step

        # 1. Insert course
        print("1. Creating course...")
        course_data = {
            'name': 'Machine Learning Fundamentals',
            'code': '10-601',
            'term': 'Spring 2026',
            'units': 12,
            'instructor': 'Dr. Sarah Chen',
            'semester_start': '2026-01-13',
            'semester_end': '2026-05-08'
        }
        course_result = supabase.table('courses').insert(course_data).execute()
        course_id = course_result.data[0]['id']
        print(f"   ✓ Course created with ID: {course_id}")

        # 2. Insert grading policy
        print("2. Adding grading policy...")
        grading_data = {
            'course_id': course_id,
            'homework': 25,
            'tests': 35,
            'project': 30,
            'quizzes': 10
        }
        supabase.table('grading_policies').insert(grading_data).execute()
        print("   ✓ Grading policy added")

        # 3. Insert course policies
        print("3. Adding course policies...")
        policy_data = {
            'course_id': course_id,
            'late_days_total': 5,
            'late_days_per_hw': 2,
            'genai_allowed': True,
            'genai_notes': 'GenAI tools like ChatGPT are allowed for concept explanation but not for solving homework problems directly.'
        }
        supabase.table('course_policies').insert(policy_data).execute()
        print("   ✓ Course policies added")

        # 4. Insert topics
        print("4. Creating topics...")
        topics_data = [
            {'course_id': course_id, 'name': 'Linear Regression', 'description': 'Introduction to supervised learning and linear models for regression'},
            {'course_id': course_id, 'name': 'Logistic Regression', 'description': 'Binary classification using logistic regression and decision boundaries'},
            {'course_id': course_id, 'name': 'Neural Networks', 'description': 'Deep learning fundamentals: feedforward networks, backpropagation, activation functions'},
            {'course_id': course_id, 'name': 'Decision Trees & Random Forests', 'description': 'Tree-based models for classification and regression'},
            {'course_id': course_id, 'name': 'K-Means Clustering', 'description': 'Unsupervised learning and clustering algorithms'},
            {'course_id': course_id, 'name': 'Support Vector Machines', 'description': 'SVMs, kernel methods, and margin-based classification'},
        ]
        topics_result = supabase.table('topics').insert(topics_data).execute()
        topic_ids = [t['id'] for t in topics_result.data]
        print(f"   ✓ Created {len(topic_ids)} topics")

        # 5. Insert topic mastery (with varying levels)
        print("5. Adding mastery data...")
        mastery_data = [
            {'student_id': 1, 'topic_id': topic_ids[0], 'mastery_score': 0.92, 'previous_score': 0.85, 'update_count': 3},  # Linear Regression - Expert
            {'student_id': 1, 'topic_id': topic_ids[1], 'mastery_score': 0.81, 'previous_score': 0.75, 'update_count': 2},  # Logistic - Proficient
            {'student_id': 1, 'topic_id': topic_ids[2], 'mastery_score': 0.67, 'previous_score': 0.55, 'update_count': 2},  # Neural Nets - Developing
            {'student_id': 1, 'topic_id': topic_ids[3], 'mastery_score': 0.45, 'previous_score': 0.30, 'update_count': 1},  # Decision Trees - Emerging
            {'student_id': 1, 'topic_id': topic_ids[4], 'mastery_score': 0.28, 'previous_score': None, 'update_count': 1},  # K-Means - Foundational
            # SVMs - No mastery entry (not started)
        ]
        supabase.table('topic_mastery').insert(mastery_data).execute()
        print(f"   ✓ Added mastery for {len(mastery_data)} topics")

        # 6. Insert events
        print("6. Adding course events...")
        from datetime import datetime, timedelta
        today = datetime.now().date()

        events_data = [
            {'course_id': course_id, 'topic_id': topic_ids[0], 'name': 'Homework 1: Linear Regression', 'type': 'homework', 'due_date': str(today + timedelta(days=3)), 'release_date': str(today - timedelta(days=7)), 'weight': 2.5},
            {'course_id': course_id, 'topic_id': topic_ids[1], 'name': 'Homework 2: Logistic Regression', 'type': 'homework', 'due_date': str(today + timedelta(days=8)), 'release_date': str(today - timedelta(days=2)), 'weight': 2.5},
            {'course_id': course_id, 'topic_id': topic_ids[2], 'name': 'Homework 3: Neural Networks', 'type': 'homework', 'due_date': str(today + timedelta(days=15)), 'release_date': str(today + timedelta(days=5)), 'weight': 2.5},
            {'course_id': course_id, 'topic_id': topic_ids[0], 'name': 'Quiz 1: Regression Basics', 'type': 'quiz', 'due_date': str(today + timedelta(days=5)), 'release_date': str(today), 'weight': 2.5},
            {'course_id': course_id, 'topic_id': topic_ids[2], 'name': 'Midterm Exam', 'type': 'test', 'due_date': str(today + timedelta(days=20)), 'release_date': str(today + timedelta(days=10)), 'weight': 17.5},
            {'course_id': course_id, 'topic_id': topic_ids[3], 'name': 'Homework 4: Decision Trees', 'type': 'homework', 'due_date': str(today + timedelta(days=22)), 'release_date': str(today + timedelta(days=12)), 'weight': 2.5},
            {'course_id': course_id, 'topic_id': None, 'name': 'Final Project: ML Application', 'type': 'project', 'due_date': str(today + timedelta(days=45)), 'release_date': str(today + timedelta(days=15)), 'weight': 30.0},
        ]
        supabase.table('events').insert(events_data).execute()
        print(f"   ✓ Added {len(events_data)} events")

        # 7. Insert lectures
        print("7. Adding lectures...")
        lectures_data = [
            {'course_id': course_id, 'topic_id': topic_ids[0], 'lecture_number': 1, 'title': 'Introduction to Machine Learning', 'date': str(today - timedelta(days=21)), 'topics': ['Linear Regression', 'Supervised Learning'], 'description': 'Course overview and introduction to regression'},
            {'course_id': course_id, 'topic_id': topic_ids[0], 'lecture_number': 2, 'title': 'Linear Regression Deep Dive', 'date': str(today - timedelta(days=18)), 'topics': ['Linear Regression', 'Gradient Descent'], 'description': 'Mathematical foundations and optimization'},
            {'course_id': course_id, 'topic_id': topic_ids[1], 'lecture_number': 3, 'title': 'Classification with Logistic Regression', 'date': str(today - timedelta(days=14)), 'topics': ['Logistic Regression', 'Binary Classification'], 'description': 'From regression to classification'},
            {'course_id': course_id, 'topic_id': topic_ids[1], 'lecture_number': 4, 'title': 'Multi-class Classification', 'date': str(today - timedelta(days=11)), 'topics': ['Logistic Regression', 'Softmax'], 'description': 'Extending to multiple classes'},
            {'course_id': course_id, 'topic_id': topic_ids[2], 'lecture_number': 5, 'title': 'Introduction to Neural Networks', 'date': str(today - timedelta(days=7)), 'topics': ['Neural Networks', 'Perceptron'], 'description': 'Building blocks of deep learning'},
            {'course_id': course_id, 'topic_id': topic_ids[2], 'lecture_number': 6, 'title': 'Backpropagation', 'date': str(today - timedelta(days=4)), 'topics': ['Neural Networks', 'Gradient Descent'], 'description': 'Training neural networks'},
            {'course_id': course_id, 'topic_id': topic_ids[3], 'lecture_number': 7, 'title': 'Decision Trees', 'date': str(today - timedelta(days=2)), 'topics': ['Decision Trees', 'Information Gain'], 'description': 'Tree-based learning algorithms'},
            {'course_id': course_id, 'topic_id': topic_ids[3], 'lecture_number': 8, 'title': 'Random Forests & Ensemble Methods', 'date': str(today + timedelta(days=2)), 'topics': ['Random Forests', 'Bagging'], 'description': 'Combining multiple models'},
            {'course_id': course_id, 'topic_id': topic_ids[4], 'lecture_number': 9, 'title': 'K-Means Clustering', 'date': str(today + timedelta(days=5)), 'topics': ['K-Means', 'Unsupervised Learning'], 'description': 'Introduction to clustering'},
            {'course_id': course_id, 'topic_id': topic_ids[5], 'lecture_number': 10, 'title': 'Support Vector Machines', 'date': str(today + timedelta(days=9)), 'topics': ['SVMs', 'Kernel Methods'], 'description': 'Margin-based classification'},
        ]
        supabase.table('lectures').insert(lectures_data).execute()
        print(f"   ✓ Added {len(lectures_data)} lectures")

        print()
        print("=" * 70)
        print("✅ DEMO COURSE CREATED SUCCESSFULLY")
        print("=" * 70)
        print()
        print(f"Course: Machine Learning Fundamentals (10-601)")
        print(f"Course ID: {course_id}")
        print()
        print("Mastery Levels:")
        print("  🟢 Linear Regression: 92% (Expert)")
        print("  🔵 Logistic Regression: 81% (Proficient)")
        print("  🟡 Neural Networks: 67% (Developing)")
        print("  🟠 Decision Trees: 45% (Emerging)")
        print("  🔴 K-Means: 28% (Foundational)")
        print("  ⚪ SVMs: Not started")
        print()
        print("=" * 70)

        return True

    except Exception as e:
        print(f"❌ Error seeding demo course: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = seed_demo_course()
    sys.exit(0 if success else 1)
