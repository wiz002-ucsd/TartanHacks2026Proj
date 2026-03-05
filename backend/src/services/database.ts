import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { NormalizedTopic, CourseDeadline } from '../models/types';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hardcoded dev user until real Supabase Auth is integrated
export const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function getAllCoursesForUser(userId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, course_name, course_code, semester, created_at,
      course_deadlines(id, title, type, due_date)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCourseWithTopics(courseId: number) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, course_name, course_code, semester, created_at,
      course_topics(
        id, display_name, global_topic_id,
        global_topics(id, canonical_name)
      ),
      course_deadlines(id, title, type, due_date)
    `)
    .eq('id', courseId)
    .single();
  if (error) throw error;
  return data;
}

export async function createCourse(
  userId: string,
  courseName: string,
  courseCode: string | null,
  semester: string
): Promise<number> {
  const { data, error } = await supabase
    .from('courses')
    .insert({ user_id: userId, course_name: courseName, course_code: courseCode, semester })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function insertCourseTopics(
  courseId: number,
  normalizedTopics: NormalizedTopic[]
): Promise<void> {
  if (normalizedTopics.length === 0) return;
  const rows = normalizedTopics.map((t) => ({
    course_id: courseId,
    global_topic_id: t.global_topic_id,
    display_name: t.display_name,
  }));
  const { error } = await supabase.from('course_topics').insert(rows);
  if (error) throw error;
}

export async function insertDeadlines(
  courseId: number,
  deadlines: Array<Pick<CourseDeadline, 'title' | 'type' | 'due_date'>>
): Promise<void> {
  if (deadlines.length === 0) return;
  const rows = deadlines.map((d) => ({ ...d, course_id: courseId }));
  const { error } = await supabase.from('course_deadlines').insert(rows);
  if (error) throw error;
}

export async function deleteCourse(courseId: number): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) throw error;
}

export async function getMasteryForUser(userId: string) {
  const { data, error } = await supabase
    .from('user_global_topic_mastery')
    .select(`
      user_id, global_topic_id, mastery_score, last_practiced_at,
      total_attempts, threshold_reached_date,
      global_topics(canonical_name, topic_aggregate_stats(difficulty_score))
    `)
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function getUpcomingDeadlines(userId: string, daysAhead = 30) {
  const today = new Date().toISOString().split('T')[0];
  const cutoff = new Date(Date.now() + daysAhead * 86_400_000).toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('course_deadlines')
    .select(`
      id, title, type, due_date,
      courses!inner(id, course_name, user_id)
    `)
    .eq('courses.user_id', userId)
    .gte('due_date', today)
    .lte('due_date', cutoff)
    .order('due_date');
  if (error) throw error;
  return data ?? [];
}
