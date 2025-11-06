/**
 * FAISS-like Vector Store for Semantic Search
 * Implements in-memory vector database with cosine similarity search
 */

export interface VectorDocument {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, any>;
  timestamp: number;
}

export interface SearchResult {
  document: VectorDocument;
  similarity: number;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * In-Memory Vector Store with FAISS-like functionality
 */
export class VectorStore {
  private documents: Map<string, VectorDocument> = new Map();
  private readonly maxDocuments: number;

  constructor(maxDocuments: number = 10000) {
    this.maxDocuments = maxDocuments;
  }

  /**
   * Add a document with its embedding to the store
   */
  async add(doc: VectorDocument): Promise<void> {
    // LRU eviction if limit reached
    if (this.documents.size >= this.maxDocuments) {
      const oldestId = this.getOldestDocumentId();
      if (oldestId) {
        this.documents.delete(oldestId);
        console.log(`VectorStore: Evicted oldest document (${oldestId})`);
      }
    }

    this.documents.set(doc.id, doc);
  }

  /**
   * Add multiple documents in batch
   */
  async addBatch(docs: VectorDocument[]): Promise<void> {
    for (const doc of docs) {
      await this.add(doc);
    }
  }

  /**
   * Search for similar documents using cosine similarity
   */
  async search(queryEmbedding: number[], topK: number = 5, minSimilarity: number = 0.5): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const doc of Array.from(this.documents.values())) {
      const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
      
      if (similarity >= minSimilarity) {
        results.push({ document: doc, similarity });
      }
    }

    // Sort by similarity descending and take top K
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }

  /**
   * Search by metadata filters
   */
  async searchByMetadata(filters: Record<string, any>, topK: number = 10): Promise<VectorDocument[]> {
    const results: VectorDocument[] = [];

    for (const doc of Array.from(this.documents.values())) {
      let matches = true;
      
      for (const [key, value] of Object.entries(filters)) {
        if (doc.metadata[key] !== value) {
          matches = false;
          break;
        }
      }

      if (matches) {
        results.push(doc);
      }
    }

    return results.slice(0, topK);
  }

  /**
   * Get document by ID
   */
  async get(id: string): Promise<VectorDocument | null> {
    return this.documents.get(id) || null;
  }

  /**
   * Delete document by ID
   */
  async delete(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  /**
   * Clear all documents
   */
  async clear(): Promise<void> {
    this.documents.clear();
  }

  /**
   * Get total document count
   */
  size(): number {
    return this.documents.size;
  }

  /**
   * Get oldest document ID for LRU eviction
   */
  private getOldestDocumentId(): string | null {
    let oldestId: string | null = null;
    let oldestTime = Infinity;

    for (const [id, doc] of Array.from(this.documents.entries())) {
      if (doc.timestamp < oldestTime) {
        oldestTime = doc.timestamp;
        oldestId = id;
      }
    }

    return oldestId;
  }

  /**
   * Get statistics about the vector store
   */
  getStats(): {
    totalDocuments: number;
    maxCapacity: number;
    utilizationPercent: number;
  } {
    const size = this.size();
    return {
      totalDocuments: size,
      maxCapacity: this.maxDocuments,
      utilizationPercent: Math.round((size / this.maxDocuments) * 100)
    };
  }
}

/**
 * Global vector stores for different use cases
 */
export const childInteractionsVectorStore = new VectorStore(5000); // 5000 interaction embeddings
export const storiesVectorStore = new VectorStore(10000); // 10000 story embeddings
export const preferencesVectorStore = new VectorStore(2000); // 2000 preference embeddings
