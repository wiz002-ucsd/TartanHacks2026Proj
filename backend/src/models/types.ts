export interface GlobalTopic {
  id: number;
  canonical_name: string;
  embedding?: number[];
  created_at?: string;
}

export interface Course {
  id: number;
  user_id: string;
  course_name: string;
  course_code?: string | null;
  semester: string;
  created_at?: string;
}

export interface CourseTopic {
  id: number;
  course_id: number;
  global_topic_id: number;
  display_name: string;
  created_at?: string;
}

export interface CourseDeadline {
  id: number;
  course_id: number;
  title: string;
  type: 'exam' | 'hw' | 'project' | 'quiz';
  due_date: string;
  created_at?: string;
}

export interface UserMastery {
  user_id: string;
  global_topic_id: number;
  mastery_score: number;
  last_practiced_at: string | null;
  total_attempts: number;
  threshold_reached_date: string | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface Quiz {
  id: number;
  topic_id: number;
  generated_by_ai: boolean;
  questions: QuizQuestion[];
  created_at?: string;
}

export interface QuizAttempt {
  id?: number;
  quiz_id: number;
  user_id: string;
  score: number;
  answers: number[];
  created_at?: string;
}

export interface TopicAggregateStats {
  global_topic_id: number;
  avg_time_to_mastery: number | null;
  avg_attempts: number | null;
  difficulty_score: number;
  sample_size: number;
  updated_at?: string;
}

export interface SyllabusExtraction {
  course_name: string;
  course_code?: string | null;
  semester?: string | null;
  topics: string[];
  deadlines: Array<{
    title: string;
    type: 'exam' | 'hw' | 'project' | 'quiz';
    due_date: string;
  }>;
}

export interface NormalizedTopic {
  display_name: string;
  global_topic_id: number;
}

export interface TopicRiskInput {
  global_topic_id: number;
  display_name: string;
  mastery_score: number;
  last_practiced_at: string | null;
  difficulty_score: number;
  days_until_next_exam: number;
}

export interface TopicRisk {
  global_topic_id: number;
  display_name: string;
  risk_score: number;
  effective_mastery: number;
}
