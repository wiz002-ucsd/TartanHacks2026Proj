import { openai } from '../utils/openai';
import { supabase } from './database';
import { updateMastery, MASTERY_THRESHOLD } from './masteryEngine';
import { QuizQuestion } from '../models/types';
import { z } from 'zod';

const QuizResponseSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correct_index: z.number().min(0).max(3),
    explanation: z.string(),
  })),
});

export async function generateQuiz(
  topicName: string,
  topicId: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<{ quiz_id: number; questions: QuizQuestion[] }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Generate exactly 5 multiple-choice questions for the topic: "${topicName}" at ${difficulty} difficulty.
Return JSON: { "questions": [{ "question": string, "options": string[4], "correct_index": 0-3, "explanation": string }] }
All options arrays must have exactly 4 items. correct_index is 0-based.`,
      },
      { role: 'user', content: `Topic: ${topicName}` },
    ],
  });

  const raw = JSON.parse(response.choices[0].message.content ?? '{}');
  const parsed = QuizResponseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(`Quiz generation validation failed: ${parsed.error.message}`);
  }

  const { questions } = parsed.data;

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .insert({ topic_id: topicId, generated_by_ai: true, questions })
    .select('id')
    .single();

  if (error || !quiz) throw new Error(`Failed to store quiz: ${error?.message}`);

  return { quiz_id: quiz.id, questions };
}

export async function scoreAttempt(
  quizId: number,
  userId: string,
  answers: number[]
): Promise<{ score: number; correct: boolean[]; updated_mastery: number }> {
  // Fetch quiz
  const { data: quizRow, error: quizError } = await supabase
    .from('quizzes')
    .select('topic_id, questions')
    .eq('id', quizId)
    .single();

  if (quizError || !quizRow) throw new Error(`Quiz ${quizId} not found`);

  const questions: QuizQuestion[] = quizRow.questions as QuizQuestion[];
  const correct = answers.map((a, i) => a === questions[i]?.correct_index);
  const score = correct.filter(Boolean).length / Math.max(correct.length, 1);

  // Record attempt
  await supabase.from('quiz_attempts').insert({
    quiz_id: quizId,
    user_id: userId,
    score,
    answers,
  });

  // Fetch current mastery
  const { data: mastery } = await supabase
    .from('user_global_topic_mastery')
    .select('mastery_score, total_attempts, threshold_reached_date')
    .eq('user_id', userId)
    .eq('global_topic_id', quizRow.topic_id)
    .maybeSingle();

  const prevMastery = mastery?.mastery_score ?? 0;
  const newMastery = updateMastery(prevMastery, score);
  const prevAttempts = mastery?.total_attempts ?? 0;
  const justCrossedThreshold = newMastery >= MASTERY_THRESHOLD && !mastery?.threshold_reached_date;
  const thresholdReachedDate = justCrossedThreshold
    ? new Date().toISOString()
    : (mastery?.threshold_reached_date ?? null);

  // Upsert mastery record
  await supabase.from('user_global_topic_mastery').upsert({
    user_id: userId,
    global_topic_id: quizRow.topic_id,
    mastery_score: newMastery,
    last_practiced_at: new Date().toISOString(),
    total_attempts: prevAttempts + 1,
    threshold_reached_date: thresholdReachedDate,
  });

  // Update aggregate stats when threshold is first crossed
  if (justCrossedThreshold) {
    await updateAggregateStats(quizRow.topic_id, prevAttempts + 1);
  }

  return { score, correct, updated_mastery: newMastery };
}

async function updateAggregateStats(topicId: number, attempts: number): Promise<void> {
  const { data: existing } = await supabase
    .from('topic_aggregate_stats')
    .select('avg_attempts, difficulty_score, sample_size')
    .eq('global_topic_id', topicId)
    .single();

  if (!existing) return;

  const n = existing.sample_size;
  const newAvgAttempts = existing.avg_attempts !== null
    ? (existing.avg_attempts * n + attempts) / (n + 1)
    : attempts;
  // Difficulty: normalize attempts needed (20 attempts → difficulty 1.0)
  const newDifficulty = Math.min(newAvgAttempts / 20, 1);

  await supabase.from('topic_aggregate_stats').update({
    avg_attempts: newAvgAttempts,
    difficulty_score: newDifficulty,
    sample_size: n + 1,
    updated_at: new Date().toISOString(),
  }).eq('global_topic_id', topicId);
}
