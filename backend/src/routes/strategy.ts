import { Router, Request, Response } from 'express';
import { generateWeeklyPlan } from '../services/strategyEngine';
import { DEV_USER_ID } from '../services/database';

const router = Router();

/**
 * POST /api/strategy/generate
 * Fetches user mastery + deadlines, ranks topics by risk, calls OpenAI for 7-day plan.
 * Returns: { plan: string }
 */
router.post('/generate', async (_req: Request, res: Response) => {
  try {
    const plan = await generateWeeklyPlan(DEV_USER_ID);
    return res.status(200).json({ success: true, plan });
  } catch (error) {
    console.error('Error generating strategy:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
});

export default router;
