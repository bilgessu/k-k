/**
 * Story Similarity Matching System
 * Uses semantic embeddings to find and recommend similar stories
 */

import { VectorStore, type VectorDocument } from "./vector-store";
import { generateEmbedding } from "./embeddings";
import { randomUUID } from "crypto";

export interface StoryMatch {
  storyId: string;
  title: string;
  content: string;
  similarity: number;
  metadata: {
    childAge: number;
    culturalTheme: string;
    values: string[];
    timestamp: number;
  };
}

export interface StoryRecommendation {
  story: StoryMatch;
  reason: string;
  confidenceScore: number;
}

/**
 * Story Similarity Matcher
 * Finds semantically similar stories and generates recommendations
 */
export class StoryMatcher {
  private vectorStore: VectorStore;

  constructor(maxStories: number = 10000) {
    this.vectorStore = new VectorStore(maxStories);
  }

  /**
   * Index a story for similarity matching
   */
  async indexStory(story: {
    id: string;
    title: string;
    content: string;
    childAge: number;
    culturalTheme: string;
    values: string[];
  }): Promise<void> {
    try {
      // Create a rich text representation for embedding
      const storyText = `${story.title}\n${story.content}\nTheme: ${story.culturalTheme}\nValues: ${story.values.join(', ')}`;
      
      const embedding = await generateEmbedding(storyText);

      const vectorDoc: VectorDocument = {
        id: story.id,
        text: storyText,
        embedding,
        metadata: {
          storyId: story.id,
          title: story.title,
          childAge: story.childAge,
          culturalTheme: story.culturalTheme,
          values: story.values,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      };

      await this.vectorStore.add(vectorDoc);
      console.log(`StoryMatcher: Indexed story "${story.title}"`);
    } catch (error) {
      console.error('Failed to index story:', error);
      throw error;
    }
  }

  /**
   * Find stories similar to a given story
   */
  async findSimilarStories(
    storyId: string,
    topK: number = 5,
    minSimilarity: number = 0.7
  ): Promise<StoryMatch[]> {
    try {
      // Get the source story
      const sourceDoc = await this.vectorStore.get(storyId);
      if (!sourceDoc) {
        console.warn(`Story ${storyId} not found in vector store`);
        return [];
      }

      // Search for similar stories
      const results = await this.vectorStore.search(
        sourceDoc.embedding,
        topK + 1, // +1 to exclude the source story itself
        minSimilarity
      );

      // Filter out the source story and map to StoryMatch
      return results
        .filter(r => r.document.id !== storyId)
        .slice(0, topK)
        .map(r => ({
          storyId: r.document.metadata.storyId,
          title: r.document.metadata.title,
          content: r.document.text,
          similarity: r.similarity,
          metadata: {
            childAge: r.document.metadata.childAge,
            culturalTheme: r.document.metadata.culturalTheme,
            values: r.document.metadata.values,
            timestamp: r.document.metadata.timestamp
          }
        }));
    } catch (error) {
      console.error('Failed to find similar stories:', error);
      return [];
    }
  }

  /**
   * Find stories by semantic query (text-based search)
   */
  async searchStoriesByQuery(
    query: string,
    topK: number = 5,
    minSimilarity: number = 0.6
  ): Promise<StoryMatch[]> {
    try {
      const queryEmbedding = await generateEmbedding(query);
      const results = await this.vectorStore.search(queryEmbedding, topK, minSimilarity);

      return results.map(r => ({
        storyId: r.document.metadata.storyId,
        title: r.document.metadata.title,
        content: r.document.text,
        similarity: r.similarity,
        metadata: {
          childAge: r.document.metadata.childAge,
          culturalTheme: r.document.metadata.culturalTheme,
          values: r.document.metadata.values,
          timestamp: r.document.metadata.timestamp
        }
      }));
    } catch (error) {
      console.error('Failed to search stories:', error);
      return [];
    }
  }

  /**
   * Get personalized story recommendations based on child preferences
   */
  async getPersonalizedRecommendations(params: {
    childAge: number;
    preferences: string[];
    previousStories: string[];
    topK?: number;
  }): Promise<StoryRecommendation[]> {
    const topK = params.topK || 5;

    try {
      // Build a query from preferences
      const preferenceQuery = `Age ${params.childAge} child likes: ${params.preferences.join(', ')}`;
      
      // Search for matching stories
      const matches = await this.searchStoriesByQuery(preferenceQuery, topK * 2, 0.5);

      // Filter out previously read stories
      const newMatches = matches.filter(
        m => !params.previousStories.includes(m.storyId)
      );

      // Calculate recommendations with reasons
      const recommendations: StoryRecommendation[] = newMatches
        .slice(0, topK)
        .map(story => {
          let reason = '';
          let confidenceScore = story.similarity;

          // Age matching
          const ageDiff = Math.abs(story.metadata.childAge - params.childAge);
          if (ageDiff === 0) {
            reason = 'Yaş grubuna tam uygun';
            confidenceScore += 0.1;
          } else if (ageDiff <= 2) {
            reason = 'Yaş grubuna yakın';
          } else {
            reason = 'Farklı yaş grubu';
            confidenceScore -= 0.1;
          }

          // Preference matching
          const matchedPreferences = story.metadata.values.filter(v =>
            params.preferences.some(p => 
              v.toLowerCase().includes(p.toLowerCase()) ||
              p.toLowerCase().includes(v.toLowerCase())
            )
          );

          if (matchedPreferences.length > 0) {
            reason += `, ${matchedPreferences.length} tercih eşleşmesi`;
            confidenceScore += matchedPreferences.length * 0.05;
          }

          return {
            story,
            reason,
            confidenceScore: Math.min(confidenceScore, 1.0) // Cap at 1.0
          };
        })
        .sort((a, b) => b.confidenceScore - a.confidenceScore);

      return recommendations;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  }

  /**
   * Find stories by cultural theme
   */
  async findStoriesByTheme(
    theme: string,
    topK: number = 5
  ): Promise<StoryMatch[]> {
    return this.searchStoriesByQuery(`Turkish cultural theme: ${theme}`, topK, 0.6);
  }

  /**
   * Find stories by specific values (e.g., "respect", "kindness")
   */
  async findStoriesByValues(
    values: string[],
    topK: number = 5
  ): Promise<StoryMatch[]> {
    const query = `Stories teaching these values: ${values.join(', ')}`;
    return this.searchStoriesByQuery(query, topK, 0.65);
  }

  /**
   * Get statistics about indexed stories
   */
  getStats(): {
    totalStories: number;
    maxCapacity: number;
    utilizationPercent: number;
  } {
    const stats = this.vectorStore.getStats();
    return {
      totalStories: stats.totalDocuments,
      maxCapacity: stats.maxCapacity,
      utilizationPercent: stats.utilizationPercent
    };
  }

  /**
   * Clear all indexed stories
   */
  async clear(): Promise<void> {
    await this.vectorStore.clear();
    console.log('StoryMatcher: Cleared all indexed stories');
  }
}

/**
 * Global story matcher instance
 */
export const storyMatcher = new StoryMatcher(10000);
