export interface Deadline {
  id: number;
  title: string;
  type: 'exam' | 'hw' | 'project' | 'quiz';
  due_date: string;
}

export interface CourseWithDeadlines {
  id: number;
  course_name: string;
  course_code?: string | null;
  semester: string;
  created_at?: string;
  course_deadlines: Deadline[];
}

export interface GlobalTopic {
  id: number;
  canonical_name: string;
}

export interface TopicWithMastery {
  id: number;
  display_name: string;
  global_topic_id: number;
  mastery_score: number;
  last_practiced_at: string | null;
  difficulty_score?: number;
  global_topics?: GlobalTopic;
}

export interface CourseDetail {
  id: number;
  course_name: string;
  course_code?: string | null;
  semester: string;
  created_at?: string;
  course_topics: Array<{
    id: number;
    display_name: string;
    global_topic_id: number;
    mastery_score: number;
    global_topics: GlobalTopic | null;
  }>;
  course_deadlines: Deadline[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  correct: boolean[];
  updated_mastery: number;
}

export interface UploadResult {
  courseId: number;
  course_name: string;
  topic_count: number;
  deadline_count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}
