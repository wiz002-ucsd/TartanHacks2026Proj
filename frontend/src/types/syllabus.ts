// Frontend types for API responses

export type EventType = 'homework' | 'test' | 'project' | 'quiz';

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

export interface Event {
  type: EventType;
  name: string;
  release_date: string | null;
  due_date: string | null;
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
}

export interface UploadResponse {
  success: boolean;
  courseId?: number;
  message?: string;
  data?: {
    courseName: string;
    courseCode: string;
    term: string;
    units: number | null;
    eventsCount: number;
  };
  extractedData?: SyllabusData; // Full extracted data for summary display
  error?: string;
  details?: string;
}

// Course list types for Home page
export interface CourseWithDeadline {
  id: number;
  name: string;
  code: string;
  term: string;
  nextDeadline: {
    name: string;
    type: EventType;
    dueDate: string;
    releaseDate: string | null;
  } | null;
}

export interface CoursesResponse {
  success: boolean;
  courses: CourseWithDeadline[];
  count: number;
  error?: string;
}
