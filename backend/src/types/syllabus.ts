// Core types matching the LLM extraction schema

export interface Course {
  name: string;
  code: string;
  term: string;
  units: number | null;
}

export interface Grading {
  homework: number | null;
  tests: number | null;
  project: number | null;
  quizzes: number | null;
}

export type EventType = 'homework' | 'test' | 'project' | 'quiz';

export interface Event {
  type: EventType;
  name: string;
  release_date: string | null; // YYYY-MM-DD format
  due_date: string | null;     // YYYY-MM-DD format
  weight: number | null;
}

export interface Policies {
  late_days_total: number | null;
  late_days_per_hw: number | null;
  genai_allowed: boolean | null;
  genai_notes: string | null;
}

export interface SyllabusData {
  course: Course;
  grading: Grading;
  events: Event[];
  policies: Policies;
  lectures: Array<{
    lecture_number: number;
    title: string;
    date: string | null;
    topics: string[];
    description: string | null;
  }>;
}

// Database types (with IDs after insertion)
export interface CourseRecord extends Course {
  id: number;
  created_at: string;
}

export interface GradingRecord extends Grading {
  id: number;
  course_id: number;
}

export interface EventRecord extends Event {
  id: number;
  course_id: number;
}

export interface PoliciesRecord extends Policies {
  id: number;
  course_id: number;
}
