// RAG-Enhanced AI Agent - Phase 2
// Combines real market data with Indonesian knowledge base

import { ragService } from '../../src/lib/rag';
import { embeddingService, type SimilaritySearchResult } from '../../src/lib/embeddings';
import { createMarketDataService } from './marketData';
import type { Env } from '../core-utils';

export interface RAGAgentResponse {
  content: string;
  sources: Array<{
    title: string;
    category: string;
    relevance: number;
  }>;
  marketData?: {
    symbol: string;
    price: number;
    signal: string;
    confidence: number;
  };
  timestamp: number;
}

export class RAGAgent {
  private env: Env;
  private marketDataService;
  private ragService;
  private embeddingService;

  constructor(env: Env) {
    this.env = env;
    this.marketDataService = createMarketDataService(env);
    this.ragService = ragService;
    this.embeddingService = embeddingService;
  }

  // Enhanced response with RAG context
  async getResponse(query: string, userContext?: {
    experience?: 'beginner' | 'intermediate' | 'advanced';
    riskProfile?: 'conservative' | 'moderate' | 'aggressive';
    preferredLanguage?: 'id' | 'en';
  }): Promise<RAGAgentResponse> {
    const timestamp = Date.now();
    const language = userContext?.preferredLanguage || 'id';
    
    try {
      // 1. Extract potential symbols from query
      const symbols = this.extractSymbols(query);
      
      // 2. Get relevant knowledge
      const knowledgeContext = this.ragService.getContextForQuery(query);
      
      // 3. Get market data if symbols found
      let marketData = null;
      if (symbols.length > 0) {
        try {
          marketData = await this.marketDataService.getMarketDataAndSignal(symbols[0]);
        } catch (error) {
          console.error('Market data fetch failed:', error);
        }
      }
      
      // 4. Generate enhanced response
      const response = await this.generateEnhancedResponse(
        query, 
        knowledgeContext, 
        marketData,
        userContext
      );
      
      // 5. Get sources from knowledge search
      const sources = this.getKnowledgeSources(query);
      
      return {
        content: response,
        sources,
        marketData: marketData ? {
          symbol: marketData.pair,
          price: marketData.price,
          signal: marketData.signal,
          confidence: marketData.confidence
        } : undefined,
        timestamp
      };
      
    } catch (error) {
      console.error('RAG Agent error:', error);
      return {
        content: this.getFallbackResponse(query, language),
        sources: [],
        timestamp
      };
    }
  }

  // Extract trading symbols from query
  private extractSymbols(query: string): string[] {
    const symbols: string[] = [];
    const upperQuery = query.toUpperCase();
    
    // Common Indonesian trading symbols
    const indonesianSymbols = [
      'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOT', 'SOL',
      'BTC/USD', 'ETH/USD', 'BTC/IDR', 'ETH/IDR',
      'USD/IDR', 'EUR/IDR', 'GBP/IDR', 'JPY/IDR',
      'BBCA', 'BBRI', 'BMRI', 'TLKM', 'UNVR', 'ASII',
      'BBCA.JK', 'BBRI.JK', 'BMRI.JK', 'TLKM.JK', 'UNVR.JK', 'ASII.JK',
      'IHSG', '^JKSE'
    ];
    
    indonesianSymbols.forEach(symbol => {
      if (upperQuery.includes(symbol)) {
        symbols.push(symbol);
      }
    });
    
    return symbols;
  }

  // Generate enhanced AI response with context
  private async generateEnhancedResponse(
    query: string,
    knowledgeContext: string,
    marketData: any,
    userContext?: any
  ): Promise<string> {
    const language = userContext?.preferredLanguage || 'id';
    const experience = userContext?.experience || 'beginner';
    const riskProfile = userContext?.riskProfile || 'moderate';
    
    // Build enhanced prompt
    let prompt = '';
    
    if (language === 'id') {
      prompt = this.buildIndonesianPrompt(query, knowledgeContext, marketData, experience, riskProfile);
    } else {
      prompt = this.buildEnglishPrompt(query, knowledgeContext, marketData, experience, riskProfile);
    }
    
    // For Phase 2, use a template response
    // In Phase 3, this would call real AI models
    return this.generateTemplateResponse(query, language, knowledgeContext, marketData, experience);
  }

  // Build Indonesian prompt
  private buildIndonesianPrompt(
    query: string,
    knowledgeContext: string,
    marketData: any,
    experience: string,
    riskProfile: string
  ): string {
    let prompt = `Anda adalah AI Assistant khusus trading Indonesia. Berikan jawaban yang informatif dan berhati-hati.

**Query Pengguna:** ${query}

**Konteks Pengetahuan:**
${knowledgeContext || 'Tidak ada konteks spesifik tersedia.'}

**Konteks Market Data:**`;
    
    if (marketData) {
      prompt += `
Simbol: ${marketData.pair}
Harga Saat Ini: ${this.formatPrice(marketData.price, marketData.pair)}
Signal: ${marketData.signal}
Confidence: ${marketData.confidence}%
Reasoning: ${marketData.reasoning}

**Indikator Teknikal:**
${marketData.indicators?.map((ind: any) => `${ind.name}: ${ind.value} (${ind.signal})`).join('\n') || 'Tidak ada indikator tersedia.'}`;
    } else {
      prompt += '\nTidak ada data market real-time tersedia.';
    }
    
    prompt += `

**User Profile:**
- Experience Level: ${experience}
- Risk Profile: ${riskProfile}

**Instruksi:**
1. Jawab dalam Bahasa Indonesia
2. Gunakan konteks pengetahuan untuk memberikan jawaban spesifik Indonesia
3. Jika ada market data, analisis dengan konteks Indonesian market
4. Berikan disclaimers untuk risiko trading
5. Sesuaikan jawaban dengan level experience user
6. Selalu berikan informasi risk management

**Response Requirements:**
- Edukatif dan informatif
- Mematuhi regulasi Indonesia (OJK, Bappebti)
- Termasuk risk management suggestions
- Update market conditions jika relevant
- Bahasa Indonesia yang natural dan mudah dipahami`;
    
    return prompt;
  }

  // Build English prompt
  private buildEnglishPrompt(
    query: string,
    knowledgeContext: string,
    marketData: any,
    experience: string,
    riskProfile: string
  ): string {
    let prompt = `You are an AI Assistant specialized in Indonesian trading. Provide informative and cautious responses.

**User Query:** ${query}

**Knowledge Context:**
${knowledgeContext || 'No specific context available.'}

**Market Data Context:**`;
    
    if (marketData) {
      prompt += `
Symbol: ${marketData.pair}
Current Price: ${this.formatPrice(marketData.price, marketData.pair)}
Signal: ${marketData.signal}
Confidence: ${marketData.confidence}%
Reasoning: ${marketData.reasoning}

**Technical Indicators:**
${marketData.indicators?.map((ind: any) => `${ind.name}: ${ind.value} (${ind.signal})`).join('\n') || 'No indicators available.'}`;
    } else {
      prompt += '\nNo real-time market data available.';
    }
    
    prompt += `

**User Profile:**
- Experience Level: ${experience}
- Risk Profile: ${riskProfile}

**Instructions:**
1. Answer in English
2. Use knowledge context for Indonesian-specific information
3. Analyze with Indonesian market context if market data is available
4. Provide trading risk disclaimers
5. Tailor response to user's experience level
6. Always include risk management suggestions

**Response Requirements:**
- Educational and informative
- Compliant with Indonesian regulations (OJK, Bappebti)
- Include risk management suggestions
- Update on market conditions if relevant`;
    
    return prompt;
  }

  // Format price with currency
  private formatPrice(price: number, symbol: string): string {
    if (symbol.includes('/IDR') || symbol.includes('.JK')) {
      return `Rp${price.toLocaleString('id-ID')}`;
    } else if (symbol.includes('USD')) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return price.toLocaleString();
    }
  }

  // Generate template response (Phase 2 - will use real AI in Phase 3)
  private generateTemplateResponse(
    query: string,
    language: string,
    knowledgeContext: string,
    marketData: any,
    experience: string
  ): string {
    if (language === 'id') {
      return this.generateIndonesianTemplate(query, knowledgeContext, marketData, experience);
    } else {
      return this.generateEnglishTemplate(query, knowledgeContext, marketData, experience);
    }
  }

  // Indonesian template response
  private generateIndonesianTemplate(
    query: string,
    knowledgeContext: string,
    marketData: any,
    experience: string
  ): string {
    let response = `🤖 **Analisis Signal Sage AI**\n\n`;
    
    // Add market data if available
    if (marketData) {
      response += `📊 **Data Market Real-Time:**\n`;
      response += `• **Simbol:** ${marketData.pair}\n`;
      response += `• **Harga:** ${this.formatPrice(marketData.price, marketData.pair)}\n`;
      response += `• **Signal:** ${marketData.signal}\n`;
      response += `• **Confidence:** ${marketData.confidence}%\n\n`;
    }
    
    // Add knowledge context
    if (knowledgeContext) {
      response += `📚 **Konteks Pengetahuan:**\n`;
      response += `Berdasarkan pengetahuan trading Indonesia, berikut informasi relevan untuk query Anda.\n\n`;
    }
    
    // Add personalized advice based on experience
    if (experience === 'beginner') {
      response += `🔰 **Tips untuk Pemula:**\n`;
      response += `• Mulai dengan demo account untuk belajar\n`;
      response += `• Gunakan modal kecil yang siap hilang\n`;
      response += `• Fokus pada 1-2 instrumen saja\n`;
      response += `• Pelajari risk management sebelum trading\n\n`;
    }
    
    response += `⚠️ **Disclaimer:**\n`;
    response += `Platform ini hanya untuk edukasi trading. Bukan financial advice. Trading memiliki risiko kehilangan modal. `;
    response += `Selalu lakukan riset independen dan trading dengan resiko yang dapat Anda tanggung.\n\n`;
    
    response += `📈 **Next Steps:**\n`;
    response += `1. Gunakan tools analisis teknnikal (RSI, Moving Average)\n`;
    response += `2. Monitor berita ekonomi Indonesia (inflasi, suku bunga BI)\n`;
    response += `3. Tentukan trading plan dengan clear entry/exit\n`;
    response += `4. Jangan lupa stop loss dan risk management`;
    
    return response;
  }

  // English template response
  private generateEnglishTemplate(
    query: string,
    knowledgeContext: string,
    marketData: any,
    experience: string
  ): string {
    let response = `🤖 **Signal Sage AI Analysis**\n\n`;
    
    // Add market data if available
    if (marketData) {
      response += `📊 **Real-Time Market Data:**\n`;
      response += `• **Symbol:** ${marketData.pair}\n`;
      response += `• **Price:** ${this.formatPrice(marketData.price, marketData.pair)}\n`;
      response += `• **Signal:** ${marketData.signal}\n`;
      response += `• **Confidence:** ${marketData.confidence}%\n\n`;
    }
    
    // Add knowledge context
    if (knowledgeContext) {
      response += `📚 **Knowledge Context:**\n`;
      response += `Based on Indonesian trading knowledge, here's relevant information for your query.\n\n`;
    }
    
    // Add personalized advice
    if (experience === 'beginner') {
      response += `🔰 **Beginner Tips:**\n`;
      response += `• Start with demo account to learn\n`;
      response += `• Use small amounts you can afford to lose\n`;
      response += `• Focus on 1-2 instruments only\n`;
      response += `• Learn risk management before trading\n\n`;
    }
    
    response += `⚠️ **Disclaimer:**\n`;
    response += `This platform is for trading education only, not financial advice. Trading involves risk of capital loss. `;
    response += `Always do your own research and trade with risks you can afford.\n\n`;
    
    response += `📈 **Next Steps:**\n`;
    response += `1. Use technical analysis tools (RSI, Moving Average)\n`;
    response += `2. Monitor Indonesian economic news (inflation, BI interest rates)\n`;
    response += `3. Set clear trading plan with entry/exit points\n`;
    response += `4. Don't forget stop loss and risk management`;
    
    return response;
  }

  // Get knowledge sources with relevance scores
  private getKnowledgeSources(query: string): Array<{
    title: string;
    category: string;
    relevance: number;
  }> {
    const relevantKnowledge = this.ragService.searchKnowledge(query, 3);
    
    return relevantKnowledge.map(item => ({
      title: item.title,
      category: item.category,
      relevance: this.calculateRelevance(query, item.title, item.keywords)
    }));
  }

  // Calculate relevance score
  private calculateRelevance(query: string, title: string, keywords: string[]): number {
    const lowerQuery = query.toLowerCase();
    const lowerTitle = title.toLowerCase();
    let score = 0;
    
    // Title match
    if (lowerTitle.includes(lowerQuery)) {
      score += 10;
    }
    
    // Keyword matches
    keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(lowerQuery) || lowerQuery.includes(keyword.toLowerCase())) {
        score += 5;
      }
    });
    
    return Math.min(score, 100);
  }

  // Fallback response when everything fails
  private getFallbackResponse(query: string, language: string): string {
    if (language === 'id') {
      return `🤖 **Signal Sage AI**\n\nMaaf, saya sedang mengalami kendala teknis.\n\nSilakan coba:\n1. Periksa koneksi internet\n2. Refresh halaman\n3. Coba lagi dalam beberapa saat\n\nJika masalah berlanjut, hubungi support kami.\n\n⚠️ **Disclaimer:** Platform ini untuk edukasi trading, bukan financial advice.`;
    } else {
      return `🤖 **Signal Sage AI**\n\nSorry, I'm experiencing technical difficulties.\n\nPlease try:\n1. Check your internet connection\n2. Refresh the page\n3. Try again in a few moments\n\nIf problems persist, contact our support.\n\n⚠️ **Disclaimer:** This platform is for trading education, not financial advice.`;
    }
  }
}

// Factory function
export function createRAGAgent(env: Env): RAGAgent {
  return new RAGAgent(env);
}
