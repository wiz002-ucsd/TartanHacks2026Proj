import { z } from 'zod';
import { openai } from '../utils/openai';
import { SyllabusExtraction } from '../models/types';

const DeadlineSchema = z.object({
  title: z.string(),
  type: z.enum(['exam', 'hw', 'project', 'quiz']),
  due_date: z.string(),
});

const SyllabusSchema = z.object({
  course_name: z.string(),
  course_code: z.string().nullable().optional(),
  semester: z.string().nullable().optional(),
  topics: z.array(z.string()),
  deadlines: z.array(DeadlineSchema),
});

const SYSTEM_PROMPT = `Extract structured course information from the provided syllabus text.

Return ONLY valid JSON matching this exact shape:
{
  "course_name": string,
  "course_code": string | null,
  "semester": string | null,
  "topics": string[],
  "deadlines": [{ "title": string, "type": "exam"|"hw"|"project"|"quiz", "due_date": "YYYY-MM-DD" }]
}

Rules:
- topics: Extract conceptual subjects covered (e.g. "Eigenvectors", "Gradient Descent", "SQL Joins") — NOT lecture titles or weekly schedules
- deadlines: Include only items with explicit due dates in the syllabus
- due_date: Must be YYYY-MM-DD format. Omit the deadline entirely if no date is given
- type: Use "exam" for midterms/finals, "hw" for homework/problem sets, "project" for projects/labs, "quiz" for quizzes
- Use null for missing fields. Never infer or guess dates.`;

export async function extractSyllabus(text: string): Promise<SyllabusExtraction> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Extract course data from this syllabus:\n\n${text}` },
    ],
  });

  const raw = JSON.parse(response.choices[0].message.content ?? '{}');
  const parsed = SyllabusSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(`Syllabus extraction validation failed: ${parsed.error.message}`);
  }

  return {
    course_name: parsed.data.course_name,
    course_code: parsed.data.course_code ?? null,
    semester: parsed.data.semester ?? null,
    topics: parsed.data.topics,
    deadlines: parsed.data.deadlines,
  };
}
