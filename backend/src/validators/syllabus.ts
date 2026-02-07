import { z } from 'zod';

// Zod schemas for strict validation of LLM output

export const CourseSchema = z.object({
  name: z.string(),
  code: z.string(),
  term: z.string(),
  units: z.number().nullable(),
});

export const GradingSchema = z.object({
  homework: z.number().nullable(),
  tests: z.number().nullable(),
  project: z.number().nullable(),
  quizzes: z.number().nullable(),
});

export const EventTypeSchema = z.enum(['homework', 'test', 'project', 'quiz']);

export const EventSchema = z.object({
  type: EventTypeSchema,
  name: z.string(),
  release_date: z.string().nullable(), // YYYY-MM-DD or null
  due_date: z.string().nullable(),     // YYYY-MM-DD or null
  weight: z.number().nullable(),
});

export const PoliciesSchema = z.object({
  late_days_total: z.number().nullable(),
  late_days_per_hw: z.number().nullable(),
  genai_allowed: z.boolean().nullable(),
  genai_notes: z.string().nullable(),
});

export const LectureSchema = z.object({
  lecture_number: z.number(),
  title: z.string(),
  date: z.string().nullable(), // YYYY-MM-DD or null
  topics: z.array(z.string()),
  description: z.string().nullable(),
});

export const SyllabusDataSchema = z.object({
  course: CourseSchema,
  grading: GradingSchema,
  events: z.array(EventSchema),
  policies: PoliciesSchema,
  lectures: z.array(LectureSchema),
});

// Type inference from Zod schema
export type ValidatedSyllabusData = z.infer<typeof SyllabusDataSchema>;
