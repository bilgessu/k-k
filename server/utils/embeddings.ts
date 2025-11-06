/**
 * Embedding Generation Service
 * Uses OpenAI's text-embedding-3-small model for semantic search
 */

import OpenAI from "openai";
import { withTimeout, AI_TIMEOUT_MS, openaiCircuitBreaker } from "./ai-safety";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Generate embedding vector for text using OpenAI
 * Model: text-embedding-3-small (1536 dimensions, fast and cost-effective)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text');
  }

  try {
    // Wrap with circuit breaker to prevent cascading failures
    const response = await openaiCircuitBreaker.execute(() =>
      withTimeout(
        openai.embeddings.create({
          model: "text-embedding-3-small",
          input: text.substring(0, 8000), // OpenAI limit
          encoding_format: "float",
        }),
        AI_TIMEOUT_MS,
        'Embedding generation timeout'
      )
    );

    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * More efficient than calling generateEmbedding multiple times
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  // Filter out empty texts
  const validTexts = texts.filter(t => t && t.trim().length > 0);
  
  if (validTexts.length === 0) {
    return [];
  }

  try {
    // Wrap with circuit breaker to prevent cascading failures
    const response = await openaiCircuitBreaker.execute(() =>
      withTimeout(
        openai.embeddings.create({
          model: "text-embedding-3-small",
          input: validTexts.map(t => t.substring(0, 8000)),
          encoding_format: "float",
        }),
        AI_TIMEOUT_MS * 2, // 14s for batch operations
        'Batch embedding generation timeout'
      )
    );

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Batch embedding generation error:', error);
    throw new Error(`Failed to generate batch embeddings: ${error}`);
  }
}

/**
 * Calculate semantic similarity between two texts
 * Returns similarity score between 0 and 1
 */
export async function calculateSemanticSimilarity(text1: string, text2: string): Promise<number> {
  const [embedding1, embedding2] = await generateEmbeddingsBatch([text1, text2]);
  
  // Cosine similarity
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;

  const similarity = dotProduct / denominator;
  
  // Normalize to 0-1 range (cosine similarity is -1 to 1)
  return (similarity + 1) / 2;
}

/**
 * Find most semantically similar text from a list
 */
export async function findMostSimilarText(
  query: string,
  candidates: string[],
  topK: number = 5
): Promise<Array<{ text: string; similarity: number; index: number }>> {
  if (candidates.length === 0) {
    return [];
  }

  const queryEmbedding = await generateEmbedding(query);
  const candidateEmbeddings = await generateEmbeddingsBatch(candidates);

  const results: Array<{ text: string; similarity: number; index: number }> = [];

  for (let i = 0; i < candidates.length; i++) {
    let dotProduct = 0;
    let normQuery = 0;
    let normCandidate = 0;

    for (let j = 0; j < queryEmbedding.length; j++) {
      dotProduct += queryEmbedding[j] * candidateEmbeddings[i][j];
      normQuery += queryEmbedding[j] * queryEmbedding[j];
      normCandidate += candidateEmbeddings[i][j] * candidateEmbeddings[i][j];
    }

    const denominator = Math.sqrt(normQuery) * Math.sqrt(normCandidate);
    const similarity = denominator === 0 ? 0 : dotProduct / denominator;
    const normalizedSimilarity = (similarity + 1) / 2;

    results.push({
      text: candidates[i],
      similarity: normalizedSimilarity,
      index: i
    });
  }

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, topK);
}

/**
 * Estimate token count for embedding (approximate)
 * OpenAI embeddings cost is based on tokens
 */
export function estimateEmbeddingTokens(text: string): number {
  // Rough estimate: ~1 token per 4 characters
  return Math.ceil(text.length / 4);
}
