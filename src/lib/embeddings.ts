// Embedding Service for RAG - Phase 2
// Converts text to vector embeddings for similarity search

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface SimilaritySearchResult {
  knowledgeId: string;
  title: string;
  content: string;
  similarity: number;
  category: string;
}

export class EmbeddingService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'text-embedding-3-small') {
    this.apiKey = apiKey;
    this.model = model;
  }

  // Generate embedding for a single text
  async embedText(text: string): Promise<EmbeddingResponse | null> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: text,
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        embedding: data.data[0].embedding,
        model: this.model,
        usage: data.usage
      };
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return null;
    }
  }

  // Generate embeddings for multiple texts (batch)
  async embedTexts(texts: string[]): Promise<EmbeddingResponse[] | null> {
    if (texts.length === 0) return null;

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: texts,
        }),
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        throw new Error(`Batch embedding API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => ({
        embedding: item.embedding,
        model: this.model,
      }));
    } catch (error) {
      console.error('Batch embedding generation failed:', error);
      return null;
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Find most similar embeddings
  findSimilar(
    queryEmbedding: number[],
    storedEmbeddings: Array<{
      id: string;
      title: string;
      content: string;
      embedding: number[];
      category: string;
    }>,
    topK: number = 5
  ): SimilaritySearchResult[] {
    const similarities = storedEmbeddings.map(item => ({
      knowledgeId: item.id,
      title: item.title,
      content: item.content,
      similarity: this.cosineSimilarity(queryEmbedding, item.embedding),
      category: item.category
    }));

    // Sort by similarity (descending) and take top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter(result => result.similarity > 0.3); // Filter out low similarity
  }

  // Embed Indonesian knowledge base (initialization)
  async embedKnowledgeBase(knowledgeBase: any[]): Promise<Array<{
    id: string;
    title: string;
    content: string;
    embedding: number[];
    category: string;
  }>> {
    const texts = knowledgeBase.map(item => 
      `${item.title}\n${item.content}\nKeywords: ${item.keywords.join(', ')}`
    );

    const embeddings = await this.embedTexts(texts);
    if (!embeddings) {
      throw new Error('Failed to embed knowledge base');
    }

    return knowledgeBase.map((item, index) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      embedding: embeddings[index].embedding,
      category: item.category
    }));
  }

  // Simple text chunking for large documents
  chunkText(text: string, maxChunkSize: number = 500): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += maxChunkSize) {
      const chunk = words.slice(i, i + maxChunkSize).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }
    
    return chunks;
  }

  // Create search embedding from query
  async createSearchEmbedding(query: string): Promise<number[] | null> {
    const response = await this.embedText(query);
    return response ? response.embedding : null;
  }

  // Store embeddings in Cloudflare KV (for production)
  async storeEmbedding(key: string, embedding: number[]): Promise<void> {
    try {
      const data = {
        embedding,
        timestamp: Date.now(),
        model: this.model
      };
      
      // In production, this would store in KV
      // await ENV.EMBEDDINGS_KV.put(key, JSON.stringify(data), { expirationTtl: 86400 * 30 });
    } catch (error) {
      console.error('Failed to store embedding:', error);
    }
  }

  // Retrieve embeddings from Cloudflare KV
  async retrieveEmbedding(key: string): Promise<number[] | null> {
    try {
      // In production, this would retrieve from KV
      // const stored = await ENV.EMBEDDINGS_KV.get(key);
      // return stored ? JSON.parse(stored).embedding : null;
      return null;
    } catch (error) {
      console.error('Failed to retrieve embedding:', error);
      return null;
    }
  }
}

// Fallback embedding service for when OpenAI is not available
export class SimpleEmbeddingService {
  // Simple TF-IDF like approach for Indonesian text
  async embedText(text: string): Promise<number[]> {
    // Simple word frequency vector for demonstration
    const words = this.tokenize(text.toLowerCase());
    const wordFreq = this.getWordFrequency(words);
    
    // Create 300-dimensional vector (small for demo)
    const embedding = new Array(300).fill(0);
    
    // Hash word to dimension
    Object.entries(wordFreq).forEach(([word, freq]) => {
      const hash = this.simpleHash(word);
      const dim = hash % 300;
      embedding[dim] = Math.min(embedding[dim] + freq * 0.1, 1);
    });
    
    return embedding;
  }

  private tokenize(text: string): string[] {
    // Simple Indonesian tokenization
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private getWordFrequency(words: string[]): Record<string, number> {
    const freq: Record<string, number> = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    return freq;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Factory function to create appropriate embedding service
export function createEmbeddingService(env?: any): EmbeddingService | SimpleEmbeddingService {
  // Check for OpenAI API key in environment
  const openaiApiKey = env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  
  if (openaiApiKey) {
    console.log('Using OpenAI embedding service');
    return new EmbeddingService(openaiApiKey);
  } else {
    console.log('OpenAI API key not found, using simple embedding service');
    return new SimpleEmbeddingService() as any;
  }
}

// Export singleton
export const embeddingService = createEmbeddingService();

// Export types
export type { EmbeddingResponse, SimilaritySearchResult };
