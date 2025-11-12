// Educational Content Management System - Phase 2.3
// Course, lesson, article, and quiz management for Indonesian trading education

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  thumbnailUrl?: string;
  isPremium: boolean;
  publishedAt: Date;
  lessons: Lesson[];
  category: string;
  instructor?: string;
  prerequisites?: string[];
  learningObjectives: string[];
}

export interface Lesson {
  id: string;
  courseId: string;
  orderIndex: number;
  title: string;
  content: string; // markdown
  videoUrl?: string;
  durationMinutes: number;
  quiz?: Quiz;
  resources?: LessonResource[];
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
  passingScore: number;
  maxAttempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonResource {
  type: 'pdf' | 'video' | 'link' | 'image';
  title: string;
  url: string;
  description?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string; // markdown
  category: 'fundamental' | 'technical' | 'news' | 'tutorial' | 'psychology' | 'risk';
  authorId?: string;
  authorName: string;
  publishedAt: Date;
  views: number;
  readTime: number;
  tags: string[];
  featuredImage?: string;
  excerpt: string;
}

export interface UserProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  quizScore?: number;
  timeSpent: number; // minutes
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: Date;
  certificateUrl: string;
  metadata: {
    userName: string;
    courseTitle: string;
    completionDate: string;
    grade?: string;
  };
}

// Indonesian Trading Courses Data
export const INDONESIAN_COURSES: Course[] = [
  {
    id: 'course_trading_pemula',
    title: 'Trading untuk Pemula',
    description: 'Pelajari dasar-dasar trading dari nol. Mulai perjalanan trading Anda dengan pemahaman yang solid.',
    level: 'beginner',
    durationMinutes: 60,
    isPremium: false,
    publishedAt: new Date('2024-01-01'),
    category: 'basics',
    instructor: 'Signal Sage AI Team',
    learningObjectives: [
      'Memahami konsep dasar trading',
      'Mengenal jenis-jenis instrumen trading',
      'Belajar membuka akun broker',
      'Menguasai istilah-istilah trading penting'
    ],
    lessons: [
      {
        id: 'lesson_1_1',
        courseId: 'course_trading_pemula',
        orderIndex: 1,
        title: 'Apa itu Trading?',
        content: 'Apa itu Trading?\\n\\nTrading adalah aktivitas jual beli instrumen keuangan dengan tujuan mendapatkan keuntungan dari perubahan harga.\\n\\nDefinisi Trading:\\n- Trading: Aktivitas trading jangka pendek hingga menengah\\n- Berbeda dengan Investasi: Trading lebih aktif, investasi lebih pasif\\n- Tujuan: Mendapatkan profit dari fluktuasi harga\\n\\nJenis Instrumen Trading:\\n1. Saham: Unit kepemilikan perusahaan\\n2. Forex: Pertukaran mata uang asing\\n3. Cryptocurrency: Mata uang digital\\n4. Futures: Kontrak perdagangan berjangka\\n5. Options: Hak untuk membeli/menjual pada harga tertentu\\n\\nKarakteristik Trader Sukses:\\n- Disiplin tinggi\\n- Manajemen risiko yang baik\\n- Emosional yang stabil\\n- Pendidikan yang continuous',
        durationMinutes: 10
      },
      {
        id: 'lesson_1_2',
        courseId: 'course_trading_pemula',
        orderIndex: 2,
        title: 'Jenis-jenis Instrumen Trading',
        content: 'Jenis-jenis Instrumen Trading\\n\\nMari kita pelajari berbagai instrumen trading yang tersedia di Indonesia.\\n\\n1. Saham Indonesia (BEI)\\n- Pasar: Bursa Efek Indonesia (BEI)\\n- Jam Trading: 09:00-15:30 WIB (Senin-Jumat)\\n- Saham Populer: BBCA, BBRI, TLKM, UNVR, ASII\\n- Min Lot: 1 lot = 100 saham\\n\\nKeunggulan Saham:\\n- Dividen dari perusahaan\\n- Capital gain dari kenaikan harga\\n- Likuiditas tinggi\\n- Transparansi laporan keuangan\\n\\n2. Forex (Mata Uang)\\n- Pasar: 24/5 (Senin-Jumat)\\n- Pasangan Populer: USD/IDR, EUR/IDR, GBP/IDR\\n- Leverage: Hingga 1:1000 (berisiko tinggi)\\n\\nFaktor Pengaruh USD/IDR:\\n- Data inflasi Indonesia\\n- Suku bunga Bank Indonesia\\n- Cadangan devisa\\n- Sentimen global',
        durationMinutes: 15
      },
      {
        id: 'lesson_1_3',
        courseId: 'course_trading_pemula',
        orderIndex: 3,
        title: 'Cara Membuka Akun Broker',
        content: 'Cara Membuka Akun Broker\\n\\nPanduan step-by-step untuk membuka akun trading di Indonesia.\\n\\n1. Pilih Broker Terdaftar\\n\\nKriteria Broker Saham (BEI):\\n- Terdaftar di OJK\\n- Anggota Bursa Efek Indonesia\\n- Memberikan akses ke RDN (Rekening Dana Nasabah)\\n- Platform trading yang user-friendly\\n- Customer service responsif\\n\\nBroker Saham Populer:\\n- Stockbit: User-friendly, fees rendah\\n- Ajaib: Interface modern, mobile-first\\n- Bibit: Robo advisor, investasi otomatis\\n- Mandiri Sekuritas: Broker BUMN, kredibilitas tinggi\\n\\n2. Dokumen yang Dibutuhkan\\n- KTP asli\\n- NPWP\\n- Rekening bank\\n- Foto selfie dengan KTP\\n\\n3. Proses Pendaftaran Online\\n1. Download App: iOS/Android store\\n2. Daftar: Email dan nomor HP\\n3. Verifikasi: OTP dan upload dokumen\\n4. Face Recognition: Untuk keamanan\\n5. Tunggu Approval: 1-3 hari kerja\\n\\n4. Deposit Dana\\n- Transfer Bank: BCA, Mandiri, BRI, BNI\\n- Minimum Deposit: Rp 100.000 - 1.000.000\\n- Biaya Admin: Rp 0 - 5.000 (tergantung bank)\\n\\n5. Mulai Trading\\n- Download platform trading\\n- Login dengan username/password\\n- Deposit dana ke RDN\\n- Mulai dengan jumlah kecil\\n\\nTips untuk Pemula:\\n- Mulai dengan modal kecil (Rp 500.000)\\n- Pelajari platform sebelum deposit besar\\n- Gunakan fitur paper trading (simulasi)\\n- Jangan tergoda untuk langsung main stock picking',
        durationMinutes: 12,
        quiz: {
          id: 'quiz_1_3',
          lessonId: 'lesson_1_3',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              id: 'q1',
              question: 'Berapa jam trading BEI (Bursa Efek Indonesia)?',
              options: [
                '08:00-16:30 WIB',
                '09:00-15:30 WIB', 
                '10:00-14:30 WIB',
                '24/7'
              ],
              correctAnswer: 1,
              explanation: 'BEI beroperasi Senin-Jumat 09:00-15:30 WIB, tidak termasuk akhir pekan dan hari libur nasional.'
            },
            {
              id: 'q2',
              question: 'Apa kepanjangan dari RDN?',
              options: [
                'Rekening Dana Nasabah',
                'Rumah Dana Nasional', 
                'Rapat Dewan Nasabah',
                'Rangka Dasar Negosiasi'
              ],
              correctAnswer: 0,
              explanation: 'RDN (Rekening Dana Nasabah) adalah rekening khusus untuk menyimpan dana trading yang terpisah dari dana pribadi.'
            }
          ]
        }
      },
      {
        id: 'lesson_1_4',
        courseId: 'course_trading_pemula',
        orderIndex: 4,
        title: 'Istilah Dasar Trading',
        content: 'Istilah Dasar Trading\\n\\nKamus istilah trading yang harus dikuasai pemula.\\n\\nIstilah Saham:\\n\\nTransaksi:\\n- Buy: Membeli saham\\n- Sell: Menjual saham\\n- Lot: 100 saham (satuan perdagangan)\\n- Lot Minimum: 1 lot = 100 saham\\n\\nHarga:\\n- Open: Harga pembukaan\\n- High: Harga tertinggi hari ini\\n- Low: Harga terendah hari ini\\n- Close: Harga penutupan\\n- Volume: Jumlah saham yang diperdagangkan\\n\\nPasar:\\n- Bearish: Kondisi pasar turun\\n- Bullish: Kondisi pasar naik\\n- Sideways: Pasar stagnan\\n- Gap: Selisih harga antara penutupan dan pembukaan\\n\\nIstilah Forex:\\n\\nPair Currency:\\n- Base Currency: Mata uang pertama (misal USD di USD/IDR)\\n- Quote Currency: Mata uang kedua (IDR di USD/IDR)\\n- Pip: Point in price (unit pergerakan harga terkecil)\\n- Spread: Selisih harga bid dan ask\\n\\nAnalisis:\\n- Fundamental: Analisis berdasarkan ekonomi\\n- Technical: Analisis berdasarkan chart\\n- Sentiment: Analisis berdasarkan mood pasar',
        durationMinutes: 10,
        resources: [
          {
            type: 'pdf',
            title: 'Trading Glossary Indonesia',
            url: '/resources/trading-glossary.pdf',
            description: 'Kamus lengkap istilah trading dalam Bahasa Indonesia'
          }
        ]
      },
      {
        id: 'lesson_1_5',
        courseId: 'course_trading_pemula',
        orderIndex: 5,
        title: 'Psikologi Trading Dasar',
        content: 'Psikologi Trading Dasar\\n\\nAspek mental yang paling menentukan sucesso trader.\\n\\nMengapa Psikologi Penting?\\n\\nTrading adalah 70% psikologi, 30% teknik. Tanpa kontrol mental yang baik, bahkan strategy terbaik akan gagal.\\n\\nEmosi Negatif yang Harus Dihindari:\\n\\n1. FOMO (Fear of Missing Out)\\nDefinisi: Rasa takut melewatkan peluang trading yang menguntungkan.\\n\\nContoh:\\n- Beli saham setelah naik 50% karena takut melewatkan opportunity\\n- Masuk crypto rally tanpa analisis\\n- Copy trading tanpa riset\\n\\nSolusi:\\n- Buat trading plan dan patuhi\\n- Jangan mengejar harga yang sudah mahal\\n- Sabar menunggu setup yang tepat\\n\\n2. Panic Selling\\nDefinisi: Menjual rugi secara emosional karena takut rugi lebih besar.\\n\\nSolusi:\\n- Selalu gunakan stop loss\\n- Accept loss sebagai bagian dari trading\\n- Review apakah entry point salah\\n\\n3. Greed (Keserakahan)\\nDefinisi: Ingin cepat kaya, over-leverage, tidak realista.\\n\\nSolusi:\\n- Trading hanya dengan dana bebas risiko\\n- Realistic expectation (10-30% per bulan)\\n- Always take partial profits\\n\\nKeterampilan Mental yang Harus Dikembangkan:\\n\\n1. Disiplin\\n2. Kesabaran\\n3. Acceptance\\n4. Continuous Learning',
        durationMinutes: 13,
        quiz: {
          id: 'quiz_1_5',
          lessonId: 'lesson_1_5',
          passingScore: 80,
          maxAttempts: 3,
          questions: [
            {
              id: 'q1',
              question: 'Apa yang dimaksud dengan FOMO dalam trading?',
              options: [
                'Fear of Missing Out - Rasa takut melewatkan peluang trading',
                'Fear of Making Offers - Takut menawarkan harga',
                'First Order Market Order - Jenis order pertama',
                'Follow Other Market Operators - Mengikuti trader lain'
              ],
              correctAnswer: 0,
              explanation: 'FOMO adalah emosi yang membuat trader merasa takut melewatkan opportunity trading yang menguntungkan, sering menyebabkan keputusan buruk.'
            },
            {
              id: 'q2',
              question: 'Berapa persentase psikologi dalam trading menurut artikel?',
              options: [
                '30%',
                '50%', 
                '70%',
                '90%'
              ],
              correctAnswer: 2,
              explanation: '70% psikologi, 30% teknik. Mental game adalah faktor paling menentukan keberhasilan dalam trading.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'course_analisa_teknikal',
    title: 'Analisa Teknikal Dasar',
    description: 'Pelajari cara membaca chart dan menggunakan indikator teknikal untuk analisis pasar.',
    level: 'beginner',
    durationMinutes: 90,
    isPremium: false,
    publishedAt: new Date('2024-01-01'),
    category: 'technical',
    instructor: 'Signal Sage AI Team',
    learningObjectives: [
      'Memahami pola candlestick',
      'Menggunakan support dan resistance',
      'Menguasai indikator RSI dan Moving Average',
      'Membuat trendline yang akurat'
    ],
    lessons: [
      {
        id: 'lesson_2_1',
        courseId: 'course_analisa_teknikal',
        orderIndex: 1,
        title: 'Pengenalan Analisa Teknikal',
        content: 'Pengenalan Analisa Teknikal\\n\\nAnalisa teknikal adalah metode analisis pasar berdasarkan pergerakan harga dan volume historis.\\n\\nDefinisi Analisa Teknikal:\\n- Price Action: Pergerakan harga yang memberikan signal\\n- Historical Data: Data harga dan volume masa lalu\\n- Pattern Recognition: Mengenali pola yang berulang\\n- Future Prediction: Memprediksi arah pergerakan harga\\n\\nAsumsi Dasar Analisa Teknikal:\\n\\n1. Market Discounts Everything\\nSemua informasi (fundamental, news, emotion) sudah tercermin dalam harga.\\n\\n2. Price Moves in Trends\\n- Uptrend: Harga cenderung bergerak naik\\n- Downtrend: Harga cenderung bergerak turun\\n- Sideways: Harga bergerak datar\\n\\n3. History Repeats Itself\\nPola historis cenderung terulang di masa depan.\\n\\nKeunggulan vs Fundamental Analysis:\\n\\nTeknikal Analysis:\\n- Fast: Cepat mendapat signal\\n- Visual: Mudah dibaca dengan chart\\n- Timing: Good untuk entry/exit timing\\n- Universal: Bisa applied ke semua market\\n\\nFundamental Analysis:\\n- Long-term: Good untuk investment horizon panjang\\n- Root Cause: Analisis penyebab dari pergerakan harga\\n- Company Health: Analisis kesehatan perusahaan\\n- Economic: Analisis kondisi ekonomi makro',
        durationMinutes: 15
      },
      {
        id: 'lesson_2_2',
        courseId: 'course_analisa_teknikal',
        orderIndex: 2,
        title: 'Support dan Resistance',
        content: 'Support dan Resistance\\n\\nLevel psychological yang paling penting dalam analisa teknikal.\\n\\nDefinisi Support dan Resistance:\\n\\nSupport:\\nDefinisi: Level harga dimana penurunan cenderung berhenti dan harga kembali naik.\\n\\nKarakteristik:\\n- Zone dimana buyers masuk secara aggressive\\n- Level historis dimana harga bounce up\\n- Tidak mudah untuk broken downward\\n\\nResistance:\\nDefinisi: Level harga dimana kenaikan cenderung berhenti dan harga kembali turun.\\n\\nKarakteristik:\\n- Zone wherein sellers masuk secara aggressive\\n- Level historis dimana harga bounce down\\n- Tidak mudah untuk broken upward\\n\\nJenis-jenis Support/Resistance:\\n\\n1. Historical Support/Resistance\\n- Previous High/Low: Level preços tertinggi/terendah sebelumnya\\n- Psychological levels: Level angka bulat (1000, 5000, 10000)\\n- Gap levels: Level dimana ada gap di chart\\n\\n2. Dynamic Support/Resistance\\n- Moving Averages: MA acts as support/resistance dinamis\\n- Fibonacci Levels: Level retracement dan extension\\n- Trendlines: Diagonal support/resistance\\n\\n3. Volume-based Support/Resistance\\n- Volume Profile: Level dengan high volume\\n- High Volume Nodes: Level dimana banyak transaction\\n- POC (Point of Control): Level dengan volume tertinggi',
        durationMinutes: 18
      }
    ]
  }
];

// Indonesian Trading Articles
export const INDONESIAN_ARTICLES: Article[] = [
  {
    id: 'article_cara_trading_saham_pemula',
    title: 'Cara Trading Saham untuk Pemula: Panduan Lengkap 2024',
    slug: 'cara-trading-saham-untuk-pemula-2024',
    content: 'Cara Trading Saham untuk Pemula: Panduan Lengkap 2024\\n\\nTrading saham adalah cara yang populer untuk membangun kekayaan di Indonesia. Namun, bagi pemula, dunia trading bisa terasa overwhelming. Artikel ini akan memandu Anda step-by-step cara trading saham dengan aman dan profitable.\\n\\n1. Persiapan Sebelum Trading\\n\\na. Pahami Risiko Trading\\nTrading saham memiliki risiko tinggi. Anda bisa kehilangan sebagian atau seluruh modal yang diinvestasikan. Pastikan Anda:\\n\\n- Trading hanya dengan dana yang siap hilang (bukan dana untuk biaya hidup)\\n- Memahami bahwa kerugian adalah bagian normal dari trading\\n- Tidak menggunakan uang pinjam untuk trading\\n- Belajar risk management sejak awal\\n\\nb. Pilih Broker yang Tepat\\nDi Indonesia, ada banyak broker saham yang bisa dipilih. Berikut kriteria broker terbaik:\\n\\nKeamanan & Legalitas:\\n- Terdaftar di OJK (Otoritas Jasa Keuangan)\\n- Anggota Bursa Efek Indonesia (BEI)\\n- Memiliki rekening dana nasabah (RDN) terpisah\\n\\nPlatform & Teknologi:\\n- Platform trading yang user-friendly\\n- Mobile app yang responsif\\n- Real-time data dan chart analysis\\n- Sistem eksekusi yang cepat\\n\\nBiaya Trading:\\n- Commission fee kompetitif\\n- Free maintenance untuk account aktif\\n- Transparent dalam pelaporan biaya\\n\\nRekomendasi Broker Saham 2024:\\n1. Stockbit - Interface modern, fees rendah\\n2. Ajaib - Mobile-first, fitur lengkap\\n3. Mandiri Sekuritas - Broker BUMN terpercaya\\n4. Ciptadana Sekuritas - Research kuat\\n\\nc. Siapkan Modal yang Tepat\\nModal Minimum Trading Saham:\\n- Pemula: Rp 1.000.000 - 5.000.000\\n- Intermediate: Rp 5.000.000 - 20.000.000\\n- Advanced: Rp 20.000.000+\\n\\nBreakdown Penggunaan Modal:\\n- 80% untuk posisi trading\\n- 20% untuk risk buffer/cash reserve\\n\\n2. Langkah-langkah Trading Saham\\n\\na. Buka Akun Trading\\n1. Download aplikasi broker pilihan Anda\\n2. Daftar dengan email dan nomor HP\\n3. Upload dokumen: KTP, NPWP, foto selfie\\n4. Verifikasi identitas dengan face recognition\\n5. Deposit dana ke rekening RDN\\n6. Tunggu approval (1-3 hari kerja)\\n\\nb. Deposit Dana ke RDN\\nCara Transfer:\\n- BCA: Transfer ke rekening RDN dengan nama PT. [NAMA BROKER] SAHAM\\n- Mandiri: Gunakan menu Investment di mobile banking\\n- BRI: Transfer ke rekening efek dengan kode 88888\\n- BNI: Transfer ke rekening efek\\n\\nMinimum Deposit:\\n- Sebastar: Rp 100.000\\n- Stockbit: Rp 100.000\\n- Ajaib: Rp 50.000\\n- Most brokers: Rp 100.000\\n\\nc. Pilih Saham yang Akan Ditrad\\nCriteria Pemula:\\n\\n1. Saham Blue Chip (Large Cap)\\n- Definisi: Saham perusahaan besar dengan market cap > Rp 100 triliun\\n- Contoh: BBCA (Bank BCA), TLKM (Telkom), UNVR (Unilever)\\n- Keunggulan: Likuiditas tinggi, fundamental solid, dividen stabil\\n\\n2. Saham Liquid\\n- Volume harian > 1 juta saham\\n- Spread bid-ask sempit (<1%)\\n- Easily untuk masuk/keluar posisi\\n\\n3. Saham Familiar\\n- Perusahaan yang Anda kenal\\n- Bisnis model yang mudah dipahami\\n- Monitor news dan development',
    category: 'tutorial',
    authorName: 'Signal Sage AI Team',
    publishedAt: new Date('2024-01-15'),
    views: 15420,
    readTime: 12,
    tags: ['trading saham', 'pemula', 'belajar trading', 'indonesia', 'beian', 'strategy'],
    excerpt: 'Panduan lengkap cara trading saham untuk pemula di Indonesia. Dari persiapan, memilih broker, analisis, hingga strategi trading yang profitable.'
  }
];

// Glossary of Indonesian Trading Terms
export const TRADING_GLOSSARY = [
  {
    term: 'Ajaib',
    definition: 'Platform trading saham Indonesia yang launched pada 2019 dengan fitur robo advisor dan interface mobile-first.',
    category: 'broker'
  },
  {
    term: 'Bear Market',
    definition: 'Kondisi pasar dimana harga cenderung turun secara konsisten (biasanya turun 20% dari peak).',
    category: 'market'
  },
  {
    term: 'Blue Chip',
    definition: 'Saham perusahaan besar dengan fundamental solid, likuiditas tinggi, dan track record yang baik.',
    category: 'stock'
  },
  {
    term: 'Day Trading',
    definition: 'Strategi trading dimana posisi dibuka dan ditutup dalam hari yang sama.',
    category: 'strategy'
  },
  {
    term: 'Dividen',
    definition: 'Pembagian laba perusahaan kepada shareholder dalam bentuk cash atau saham.',
    category: 'stock'
  },
  {
    term: 'EPS (Earnings Per Share)',
    definition: 'Laba bersih perusahaan dibagi dengan jumlah saham yang公开发行.',
    category: 'fundamental'
  },
  {
    term: 'FOMO (Fear of Missing Out)',
    definition: 'Emosi takut melewatkan opportunity trading yang menguntungkan, sering menyebabkan keputusan buruk.',
    category: 'psychology'
  },
  {
    term: 'IHSG (Indeks Harga Saham Gabungan)',
    definition: 'Indeks harga saham gabungan yang mengukur pergerakan harga seluruh saham yang terdaftar di BEI.',
    category: 'index'
  },
  {
    term: 'Lot',
    definition: 'Satuan perdagangan saham di Indonesia, dimana 1 lot = 100 saham.',
    category: 'stock'
  },
  {
    term: 'RDN (Rekening Dana Nasabah)',
    definition: 'Rekening khusus untuk menyimpan dana trading yang terpisah dari dana pribadi investor.',
    category: 'trading'
  },
  {
    term: 'ROE (Return on Equity)',
    definition: 'Rasio yang mengukur seberapa efektif perusahaan menggunakan modal shareholder untuk menghasilkan laba.',
    category: 'fundamental'
  },
  {
    term: 'RSI (Relative Strength Index)',
    definition: 'Indikator teknikal yang mengukur kecepatan dan perubahan pergerakan harga, digunakan untuk identify overbought/oversold conditions.',
    category: 'technical'
  },
  {
    term: 'Support',
    definition: 'Level harga dimana penurunan cenderung berhenti dan harga kembali naik.',
    category: 'technical'
  },
  {
    term: 'Volume',
    definition: 'Jumlah saham yang diperdagangkan dalam periode tertentu.',
    category: 'market'
  }
];

// Educational Content Service Class
export class EducationService {
  private courses: Course[];
  private articles: Article[];
  private glossary: Array<{ term: string; definition: string; category: string }>;

  constructor() {
    this.courses = INDONESIAN_COURSES;
    this.articles = INDONESIAN_ARTICLES;
    this.glossary = TRADING_GLOSSARY;
  }

  // Course Management
  getCourses(filters?: { level?: string; category?: string; isPremium?: boolean }): Course[] {
    let filtered = this.courses;
    
    if (filters?.level) {
      filtered = filtered.filter(course => course.level === filters.level);
    }
    if (filters?.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }
    if (filters?.isPremium !== undefined) {
      filtered = filtered.filter(course => course.isPremium === filters.isPremium);
    }
    
    return filtered;
  }

  getCourseById(id: string): Course | undefined {
    return this.courses.find(course => course.id === id);
  }

  getLessonsByCourseId(courseId: string): Lesson[] {
    const course = this.getCourseById(courseId);
    return course?.lessons || [];
  }

  // Article Management
  getArticles(filters?: { category?: string; featured?: boolean }): Article[] {
    let filtered = this.articles;
    
    if (filters?.category) {
      filtered = filtered.filter(article => article.category === filters.category);
    }
    
    return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  getArticleBySlug(slug: string): Article | undefined {
    return this.articles.find(article => article.slug === slug);
  }

  getFeaturedArticles(): Article[] {
    return this.articles.slice(0, 3); // Top 3 most recent
  }

  // Quiz Management
  getQuizByLessonId(lessonId: string): Quiz | undefined {
    const lessons = this.courses.flatMap(course => course.lessons);
    const lesson = lessons.find(lesson => lesson.id === lessonId);
    return lesson?.quiz;
  }

  // Progress Tracking
  calculateProgress(userProgress: UserProgress[]): {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    totalTimeSpent: number;
  } {
    const totalLessons = this.courses.reduce((acc, course) => acc + course.lessons.length, 0);
    const completedLessons = userProgress.filter(progress => progress.completed).length;
    const totalTimeSpent = userProgress.reduce((acc, progress) => acc + progress.timeSpent, 0);
    
    return {
      totalLessons,
      completedLessons,
      completionPercentage: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
      totalTimeSpent
    };
  }

  // Certificate Generation
  generateCertificate(userId: string, courseId: string, userName: string): Certificate {
    const course = this.getCourseById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: certificateId,
      userId,
      courseId,
      issuedAt: new Date(),
      certificateUrl: `/certificates/${certificateId}.pdf`,
      metadata: {
        userName,
        courseTitle: course.title,
        completionDate: new Date().toLocaleDateString('id-ID'),
        grade: 'Lulus'
      }
    };
  }

  // Glossary Management
  searchGlossary(query: string): Array<{ term: string; definition: string; category: string }> {
    const lowerQuery = query.toLowerCase();
    return this.glossary.filter(
      item => 
        item.term.toLowerCase().includes(lowerQuery) ||
        item.definition.toLowerCase().includes(lowerQuery)
    );
  }

  getGlossaryByCategory(category: string): Array<{ term: string; definition: string; category: string }> {
    return this.glossary.filter(item => item.category === category);
  }

  // Learning Path Recommendations
  getLearningPath(userLevel: 'beginner' | 'intermediate' | 'advanced'): {
    courses: Course[];
    articles: Article[];
    nextSteps: string[];
  } {
    const courseFilters = userLevel === 'beginner' 
      ? { level: 'beginner', isPremium: false }
      : userLevel === 'intermediate'
      ? { level: 'intermediate' }
      : { level: 'advanced' };

    const recommendedCourses = this.getCourses(courseFilters);
    const recommendedArticles = this.articles.slice(0, 5);

    const nextSteps = userLevel === 'beginner' 
      ? [
          'Complete "Trading untuk Pemula" course',
          'Open demo account untuk practice',
          'Learn basic technical analysis',
          'Start with small position sizing'
        ]
      : userLevel === 'intermediate'
      ? [
          'Advanced technical analysis course',
          'Learn portfolio management',
          'Explore option trading',
          'Develop systematic trading strategy'
        ]
      : [
          'Professional trading psychology',
          'Algorithmic trading development',
          'Options and futures trading',
          'Advanced risk management'
        ];

    return {
      courses: recommendedCourses,
      articles: recommendedArticles,
      nextSteps
    };
  }
}

// Singleton instance
export const educationService = new EducationService();