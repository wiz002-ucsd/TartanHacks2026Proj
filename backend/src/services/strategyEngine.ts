import { openai } from '../utils/openai';
import { getMasteryForUser, getUpcomingDeadlines } from './database';
import { rankTopics } from './riskEngine';
import { TopicRiskInput } from '../models/types';

/**
 * Generates a 7-day study plan by:
 *   1. Fetching user mastery + upcoming deadlines
 *   2. Computing risk scores and ranking topics
 *   3. Building a structured prompt
 *   4. Calling OpenAI for the plan
 */
export async function generateWeeklyPlan(userId: string): Promise<string> {
  const [masteryRows, deadlines] = await Promise.all([
    getMasteryForUser(userId),
    getUpcomingDeadlines(userId, 30),
  ]);

  // Build topic risk inputs
  const topicInputs: TopicRiskInput[] = masteryRows.map((m) => {
    const gt = m.global_topics as unknown as {
      canonical_name: string;
      topic_aggregate_stats: { difficulty_score: number } | null;
    } | null;
    const stats = gt?.topic_aggregate_stats ?? null;
    return {
      global_topic_id: m.global_topic_id,
      display_name: gt?.canonical_name ?? `Topic ${m.global_topic_id}`,
      mastery_score: m.mastery_score,
      last_practiced_at: m.last_practiced_at,
      difficulty_score: stats?.difficulty_score ?? 0.5,
      days_until_next_exam: nearestExamDays(deadlines),
    };
  });

  const ranked = rankTopics(topicInputs);

  if (ranked.length === 0 && deadlines.length === 0) {
    return 'No courses or topics found. Upload a syllabus to get started.';
  }

  // Build prompt context
  const topicLines = ranked.slice(0, 8).map((t) =>
    `- ${t.display_name}: mastery ${(t.effective_mastery * 100).toFixed(0)}%, risk ${t.risk_score.toFixed(2)}`
  );

  const deadlineLines = deadlines.slice(0, 6).map((d) => {
    const course = d.courses as unknown as { course_name: string } | null;
    return `- ${course?.course_name ?? 'Course'}: "${d.title}" (${d.type}) due ${d.due_date}`;
  });

  const prompt = `You are an academic study advisor. Generate a structured 7-day study plan.

Student's highest-risk topics:
${topicLines.length > 0 ? topicLines.join('\n') : '- No mastery data yet (student is just starting)'}

Upcoming deadlines (next 30 days):
${deadlineLines.length > 0 ? deadlineLines.join('\n') : '- No upcoming deadlines'}

Generate a concrete daily plan (Monday–Sunday) with:
- Specific topics to study each day
- Estimated study hours per session
- Which topics to prioritize before which deadlines
- Brief rationale for priority ordering

Be specific and actionable. Prioritize high-risk topics nearest to their deadlines.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.5,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content ?? 'Unable to generate study plan.';
}

function nearestExamDays(deadlines: Array<{ type: string; due_date: string }>): number {
  const exams = deadlines.filter((d) => d.type === 'exam');
  if (exams.length === 0) return 30;
  const nearest = exams.sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )[0];
  const days = Math.round((new Date(nearest.due_date).getTime() - Date.now()) / 86_400_000);
  return Math.max(1, days);
}
