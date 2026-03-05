import { Router, Request, Response } from 'express';
import { generateQuiz, scoreAttempt } from '../services/quizEngine';
import { DEV_USER_ID } from '../services/database';

const router = Router();

/**
 * POST /api/quizzes/generate
 * Body: { topic_id: number, topic_name: string, difficulty?: "easy"|"medium"|"hard" }
 * Returns: { quiz_id, questions }
 */
router.post('/generate', async (req: Request, res: Response) => {
  const { topic_id, topic_name, difficulty } = req.body;

  if (!topic_id || typeof topic_id !== 'number') {
    return res.status(400).json({ success: false, error: 'topic_id (number) is required' });
  }
  if (!topic_name || typeof topic_name !== 'string') {
    return res.status(400).json({ success: false, error: 'topic_name (string) is required' });
  }

  const diff: 'easy' | 'medium' | 'hard' =
    difficulty === 'easy' || difficulty === 'hard' ? difficulty : 'medium';

  try {
    const result = await generateQuiz(topic_name, topic_id, diff);
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
});

/**
 * POST /api/quizzes/submit
 * Body: { quiz_id: number, answers: number[] }
 * Returns: { score, correct, updated_mastery }
 */
router.post('/submit', async (req: Request, res: Response) => {
  const { quiz_id, answers } = req.body;

  if (!quiz_id || typeof quiz_id !== 'number') {
    return res.status(400).json({ success: false, error: 'quiz_id (number) is required' });
  }
  if (!Array.isArray(answers) || answers.some((a) => typeof a !== 'number')) {
    return res.status(400).json({ success: false, error: 'answers must be an array of numbers' });
  }

  try {
    const result = await scoreAttempt(quiz_id, DEV_USER_ID, answers);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error scoring quiz:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
});

export default router;
