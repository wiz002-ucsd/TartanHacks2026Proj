import { openai } from '../utils/openai';
import { supabase } from './database';
import { NormalizedTopic } from '../models/types';

const SIMILARITY_THRESHOLD = 0.85;

async function embedTopic(name: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: name,
  });
  return res.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * For each topic name:
 *   1. Generate embedding
 *   2. Compare vs all existing global_topics
 *   3. If cosine similarity > threshold → reuse existing global_topic_id
 *   4. Else → create new global_topic + seed topic_aggregate_stats
 *
 * Returns { display_name, global_topic_id } for each input topic.
 */
export async function normalizeTopics(topicNames: string[]): Promise<NormalizedTopic[]> {
  if (topicNames.length === 0) return [];

  // Fetch all existing global topics with embeddings once
  const { data: existing, error } = await supabase
    .from('global_topics')
    .select('id, canonical_name, embedding');

  if (error) throw error;

  const results: NormalizedTopic[] = [];

  for (const name of topicNames) {
    const embedding = await embedTopic(name);

    let bestId: number | null = null;
    let bestScore = 0;

    for (const gt of existing ?? []) {
      if (!gt.embedding) continue;
      // Supabase returns vector as array already when using pgvector
      const gtEmbedding = Array.isArray(gt.embedding)
        ? gt.embedding
        : JSON.parse(gt.embedding as unknown as string);
      const score = cosineSimilarity(embedding, gtEmbedding);
      if (score > bestScore) {
        bestScore = score;
        bestId = gt.id;
      }
    }

    if (bestScore >= SIMILARITY_THRESHOLD && bestId !== null) {
      // Reuse existing canonical topic
      results.push({ display_name: name, global_topic_id: bestId });
    } else {
      // Create new canonical topic
      // Supabase pgvector requires the vector as a bracket-formatted string
      const embeddingStr = `[${embedding.join(',')}]`;
      const { data: inserted, error: insertError } = await supabase
        .from('global_topics')
        .insert({ canonical_name: name, embedding: embeddingStr })
        .select('id')
        .single();

      if (insertError || !inserted) {
        throw new Error(`Failed to insert global topic "${name}": ${insertError?.message}`);
      }

      // Seed aggregate stats with neutral difficulty
      await supabase
        .from('topic_aggregate_stats')
        .insert({ global_topic_id: inserted.id, difficulty_score: 0.5 });

      // Add to local cache (as number[] for cosine similarity in subsequent iterations)
      existing?.push({ id: inserted.id, canonical_name: name, embedding: embedding as unknown as string });

      results.push({ display_name: name, global_topic_id: inserted.id });
    }
  }

  return results;
}
