/**
 * Mastery Engine — learning model for topic mastery tracking.
 * Placeholder formulas: replace with empirically calibrated model.
 */

export const MASTERY_THRESHOLD = 0.8;

/**
 * Exponential moving average update.
 * TODO: replace with BKT (Bayesian Knowledge Tracing) or ELO-style model.
 */
export function updateMastery(previousMastery: number, quizScore: number): number {
  return previousMastery + 0.2 * (quizScore - previousMastery);
}

/**
 * Exponential decay since last practice (Ebbinghaus forgetting curve, simplified).
 * TODO: fit decay constant from real user data.
 */
export function applyDecay(mastery: number, daysSinceLastPractice: number): number {
  return mastery * Math.exp(-0.05 * daysSinceLastPractice);
}

/** Mastery adjusted for time elapsed since last practice session. */
export function effectiveMastery(mastery: number, lastPracticedAt: string | null): number {
  if (!lastPracticedAt) return mastery;
  const days = (Date.now() - new Date(lastPracticedAt).getTime()) / 86_400_000;
  return applyDecay(mastery, days);
}
