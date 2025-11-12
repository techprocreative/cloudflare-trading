// RAG (Retrieval Augmented Generation) System - Phase 2
// Knowledge base for Indonesian trading content

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: 'trading' | 'forex' | 'stocks' | 'crypto' | 'analysis' | 'risk' | 'beginner' | 'advanced';
  keywords: string[];
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

// Indonesian Trading Knowledge Base Content
export const INDONESIAN_KNOWLEDGE_BASE: KnowledgeBase[] = [
  // Beginner Content
  {
    id: 'id_trading_basics_1',
    title: 'Apa itu Trading?',
    content: `Trading adalah aktivitas jual beli instrumen keuangan seperti saham, forex, atau crypto dengan tujuan mendapatkan keuntungan dari perubahan harga. 
    Trading berbeda dengan investasi jangka panjang karena biasanya dilakukan dalam waktu singkat (menit/hari).
    Untuk pemula, penting memahami risiko dan memulai dengan modal kecil.`,
    category: 'beginner',
    keywords: ['trading', 'pemula', 'saham', 'forex', 'crypto', 'definisi'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'id_risk_management_1', 
    title: 'Manajemen Risiko untuk Pemula',
    content: `Risk management adalah aturan mengelola modal trading. Aturan dasar:
    1. Risk hanya 1-2% dari total modal per trade
    2. Gunakan stop loss untuk membatasi kerugian
    3. Jangan trading dengan emosi (FOMO/panic selling)
    4. Diversifikasi ke beberapa instrumen
    5. Trading plan yang jelas sebelum membuka posisi`,
    category: 'risk',
    keywords: ['risk management', 'manajemen risiko', 'stop loss', 'modal', 'pemula'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'id_forex_basics_1',
    title: 'Trading Forex di Indonesia',
    content: `Forex (Foreign Exchange) adalah pasar uang global. Di Indonesia, yang populer:
    - USD/IDR: Dolar Amerika ke Rupiah
    - EUR/IDR: Euro ke Rupiah  
    - GBP/IDR: Poundsterling ke Rupiah
    - JPY/IDR: Yen Jepang ke Rupiah
    
    Faktor yang mempengaruhi USD/IDR: data inflasi, suku bunga BI, cadangan devisa, sentimen global.
    
    Tips: Trading forex membutuhkan analisis fundamental dan teknikal.`,
    category: 'forex',
    keywords: ['forex', 'USD/IDR', 'EUR/IDR', 'mata uang', 'analisis fundamental'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'id_stocks_indonesia_1',
    title: 'Trading Saham Indonesia (IHSG)',
    content: `Pasar modal Indonesia diwakili IHSG (Indeks Harga Saham Gabungan). Saham populer:
    - Bank BCA (BBCA): Bank terbesar Indonesia
    - Bank BRI (BBRI): Bank BUMN terbesar  
    - Telkom (TLKM): Perusahaan telekomunikasi BUMN
    - Unilever (UNVR): Consumer goods terkemuka
    - Astra (ASII): Konglomerat otomotif
    
    Trading hours BEI: Senin-Jumat 09:00-15:30 WIB.
    Untuk trading, penting analisis fundamental (laporan keuangan) dan teknikal (chart).`,
    category: 'stocks',
    keywords: ['saham', 'IHSG', 'BBCA', 'BBRI', 'TLKM', 'UNVR', 'ASII', 'BEI', 'trading saham'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'id_crypto_trading_1',
    title: 'Trading Cryptocurrency di Indonesia',
    content: `Crypto trading di Indonesia makin populer. Exchange lokal: Indodax, Tokocrypto, Pintu.
    
    Crypto populer di Indonesia:
    - Bitcoin (BTC): Emas digital, store of value
    - Ethereum (ETH): Platform smart contracts terbesar
    - BNB: Token exchange Binance
    
    Risk crypto: volatility tinggi, regulasi masih berkembang.
    Tips: Diversifikasi, gunakan stop loss, understand project fundamentals.`,
    category: 'crypto',
    keywords: ['crypto', 'bitcoin', 'ethereum', 'BNB', 'indodax', 'tokocrypto', 'cryptocurrency'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'id_technical_analysis_1',
    title: 'Analisis Teknikal Dasar',
    content: `Analisis teknikal membaca chart untuk prediksi harga. Tools dasar:
    
    1. Candlestick: Pattern pembalikan (doji, hammer, shooting star)
    2. Support & Resistance: Level psikologis harga
    3. Moving Average (SMA/EMA): Trend following
    4. RSI: Overbought (>70) / Oversold (<30)
    5. Volume: Konfirmasi pergerakan harga
    
    Tips: Gunakan multiple timeframes (1D, 4H, 1H) untuk konfirmasi.`,
    category: 'analysis',
    keywords: ['analisis teknikal', 'candlestick', 'RSI', 'moving average', 'support', 'resistance'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'id_market_hours_1',
    title: 'Jam Trading Indonesia (WIB)',
    content: `Time zone trading penting untuk Indonesia market:
    
    🇮🇩 Jakarta (WIB): GMT+7
    - Forex Market: Buka 24/5, paling aktif:
      * London: 14:00-23:00 WIB  
      * New York: 19:00-04:00 WIB
      * Tokyo: 07:00-16:00 WIB
      * Sydney: 06:00-15:00 WIB
    
    🇮🇩 BEI (Indonesia Stock Exchange):
    - Senin-Jumat: 09:00-15:30 WIB
    - Tidak trading Sabtu/Minggu/libur nasional
    
    🇮🇩 Crypto Market: 24/7, no holidays`,
    category: 'trading',
    keywords: ['jam trading', 'WIB', 'forex market', 'BEI', 'crypto market', 'time zone'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'id_psychology_1',
    title: 'Psikologi Trading Indonesia',
    content: `Psikologi trading di Indonesia sering terpengaruh:
    
    Emosi negatif yang harus dihindari:
    - FOMO (Fear of Missing Out): Ikuti pasar karena tak ketinggalan
    - Panic Selling: Jual rugi saat turun drastis  
    - Greed: Over-leverage karena pengen untung cepat
    - Revenge Trading: Balas dendam setelah loss
    
    Tips psikologi:
    1. Trading plan yang jelas
    2. Jurnal trading untuk evaluasi
    3. Break jika emotional trading
    4. Focus pada process, bukan profit
    5. Trading dalam kondisi mental baik`,
    category: 'risk',
    keywords: ['psikologi trading', 'FOMO', 'panic selling', 'emotional trading', 'mental trading'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'id_regulation_1',
    title: 'Regulasi Trading Indonesia',
    content: `Regulator trading di Indonesia:
    
    🏦 OJK (Otoritas Jasa Keuangan):
    - Regulasi pasar modal, broker lokal
    - Investor protection fund
    - Edukasi investor
    
    🏦 Bank Indonesia:
    - Regulasi forex & crypto payment gateway
    - Stabilitas nilai tukar
    
    🏦 Bappebti:
    - Regulasi crypto/futures trading
    - Registration crypto exchange
    
    Tips untuk trader Indonesia:
    1. Gunakan broker regulated Bappebti untuk crypto/futures
    2. Gunakan broker resmi BEI untuk saham
    3. Perhatikan pajak trading income
    4. Tetapkan modal trading max dari disposable income`,
    category: 'risk',
    keywords: ['OJK', 'Bank Indonesia', 'Bappebti', 'regulasi', 'broker regulated', 'trading Indonesia'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// RAG Service Class
export class RAGService {
  private knowledgeBase: KnowledgeBase[];
  
  constructor() {
    this.knowledgeBase = INDONESIAN_KNOWLEDGE_BASE;
  }

  // Simple keyword-based search (for Phase 2)
  // Can be upgraded to vector search in Phase 3
  searchKnowledge(query: string, limit: number = 3): KnowledgeBase[] {
    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(' ').filter(word => word.length > 2);
    
    // Score each knowledge base entry
    const scored = this.knowledgeBase.map(item => {
      let score = 0;
      
      // Check title match
      if (item.title.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }
      
      // Check keyword matches
      keywords.forEach(keyword => {
        if (item.keywords.some(k => k.toLowerCase().includes(keyword))) {
          score += 5;
        }
      });
      
      // Check content match
      if (item.content.toLowerCase().includes(lowerQuery)) {
        score += 2;
      }
      
      return { item, score };
    }).filter(result => result.score > 0);
    
    // Sort by score and limit
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.item);
  }

  // Get context for AI prompt
  getContextForQuery(query: string): string {
    const relevantKnowledge = this.searchKnowledge(query, 3);
    
    if (relevantKnowledge.length === 0) {
      return '';
    }
    
    return `Konteks Pengetahuan Trading Indonesia:

${relevantKnowledge.map((item, index) => 
  `${index + 1}. **${item.title}**
   ${item.content}`
).join('\n\n')}

Gunakan konteks di atas untuk memberikan jawaban yang relevan dengan pasar Indonesia.`;
  }

  // Get knowledge by category
  getKnowledgeByCategory(category: KnowledgeBase['category']): KnowledgeBase[] {
    return this.knowledgeBase.filter(item => item.category === category);
  }

  // Add new knowledge
  addKnowledge(knowledge: Omit<KnowledgeBase, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeBase {
    const newKnowledge: KnowledgeBase = {
      ...knowledge,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.knowledgeBase.push(newKnowledge);
    return newKnowledge;
  }

  // Search suggestions
  getSuggestions(query: string, limit: number = 5): string[] {
    const lowerQuery = query.toLowerCase();
    const suggestions = new Set<string>();
    
    // Get matching keywords
    this.knowledgeBase.forEach(item => {
      item.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(lowerQuery) && keyword.length > 3) {
          suggestions.add(keyword);
        }
      });
    });
    
    // Get matching titles
    this.knowledgeBase.forEach(item => {
      if (item.title.toLowerCase().includes(lowerQuery) && item.title.length < 30) {
        suggestions.add(item.title);
      }
    });
    
    return Array.from(suggestions).slice(0, limit);
  }
}

// Singleton instance
export const ragService = new RAGService();

// Export types
export type { KnowledgeBase };
