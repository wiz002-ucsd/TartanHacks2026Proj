import { effectiveMastery } from './masteryEngine';
import { TopicRiskInput, TopicRisk } from '../models/types';

/**
 * Computes a risk score [0, 1] for a topic.
 * Higher score = higher priority to study.
 *
 * Weights (TODO: tune from real user data):
 *   50% — knowledge gap (1 - effective mastery)
 *   30% — deadline urgency (1 / days until exam, capped)
 *   20% — topic difficulty
 */
export function computeRiskScore(
  input: Pick<TopicRiskInput, 'mastery_score' | 'last_practiced_at' | 'days_until_next_exam' | 'difficulty_score'>
): number {
  const em = effectiveMastery(input.mastery_score, input.last_practiced_at);
  return (
    (1 - em) * 0.5 +
    (1 / Math.max(input.days_until_next_exam, 1)) * 0.3 +
    input.difficulty_score * 0.2
  );
}

/** Returns topics sorted by risk score descending (highest risk first). */
export function rankTopics(topics: TopicRiskInput[]): TopicRisk[] {
  return topics
    .map((t) => ({
      global_topic_id: t.global_topic_id,
      display_name: t.display_name,
      effective_mastery: effectiveMastery(t.mastery_score, t.last_practiced_at),
      risk_score: computeRiskScore(t),
    }))
    .sort((a, b) => b.risk_score - a.risk_score);
}
