# 🐛 Critical Bugs & Comprehensive Fix Plan

**Created:** 12 November 2025  
**Priority:** URGENT  
**Status:** Action Required

---

## 📋 Summary

Setelah analisis mendalam, ditemukan **7 CRITICAL BUGS** yang membuat aplikasi tidak berfungsi dengan baik. Dokumen ini berisi daftar lengkap bug, impact analysis, dan step-by-step fix instructions.

**⚠️ IMPORTANT NOTE:**  
Platform ini menggunakan **OpenRouter** sebagai AI provider, bukan Cloudflare AI Gateway. OpenRouter memberikan akses ke 100+ AI models termasuk GPT-4, Claude, Gemini, dan models lainnya melalui single API.

---

## 🚨 CRITICAL BUGS (P0 - BLOCKER)

### Bug #1: Environment Variables Tidak Disetup 🔴

**File:** `wrangler.jsonc`

**Current Code:**
```jsonc
"vars": {
  "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai",
  "CF_AI_API_KEY": "your-cloudflare-api-key"
}
```

**Problem:**
- API keys adalah placeholder
- Platform ini sebenarnya menggunakan **OpenRouter** bukan Cloudflare
- Chat AI tidak bisa connect
- Market data API calls akan gagal
- Semua AI features broken

**Impact:** 🔴 **CRITICAL** - Core features tidak berfungsi

**Fix Steps:**

#### Option 1: Menggunakan OpenRouter (Recommended) 🚀

1. Sign up/Login ke OpenRouter:
   - Go to: https://openrouter.ai/
   - Create account atau login
   - Go to Keys: https://openrouter.ai/keys
   - Create new API key
   - Copy API key

2. Update `wrangler.jsonc`:
   ```jsonc
   "vars": {
     "CF_AI_BASE_URL": "https://openrouter.ai/api/v1",
     "CF_AI_API_KEY": "sk-or-v1-YOUR_OPENROUTER_API_KEY_HERE",
     "OPENROUTER_API_KEY": "sk-or-v1-YOUR_OPENROUTER_API_KEY_HERE",
     "SERPAPI_KEY": "your_serpapi_key_optional"
   }
   ```

3. Create `.env` file untuk local development:
   ```bash
   CF_AI_BASE_URL=https://openrouter.ai/api/v1
   CF_AI_API_KEY=sk-or-v1-YOUR_OPENROUTER_API_KEY
   OPENROUTER_API_KEY=sk-or-v1-YOUR_OPENROUTER_API_KEY
   SERPAPI_KEY=your_serpapi_key_optional
   ```

4. Create `.dev.vars` file untuk Cloudflare local development:
   ```bash
   CF_AI_BASE_URL=https://openrouter.ai/api/v1
   CF_AI_API_KEY=sk-or-v1-YOUR_OPENROUTER_API_KEY
   OPENROUTER_API_KEY=sk-or-v1-YOUR_OPENROUTER_API_KEY
   ```

#### Option 2: Menggunakan Cloudflare AI Gateway (Alternative)

Jika tetap ingin menggunakan Cloudflare:

1. Sign up/Login ke Cloudflare Dashboard
2. Create AI Gateway:
   - Go to: https://dash.cloudflare.com/?to=/:account/ai/ai-gateway/general
   - Create new Gateway
   - Copy Gateway URL & API Key
3. Update `wrangler.jsonc`:
   ```jsonc
   "vars": {
     "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY/openai",
     "CF_AI_API_KEY": "your_cloudflare_api_key",
     "OPENROUTER_API_KEY": ""
   }
   ```

**Catatan Penting:**
- OpenRouter memberikan akses ke 100+ AI models termasuk GPT-4, Claude, Gemini, dll.
- Free tier OpenRouter sudah cukup untuk development
- Platform ini menggunakan OpenAI SDK yang kompatibel dengan OpenRouter

**Effort:** 15-30 minutes  
**Priority:** P0

---

### Bug #2: Dashboard Hardcoded EUR/USD dengan Fake Data 🔴

**Files:**
- `src/store/signalStore.ts`
- `src/hooks/use-chart-data.ts`
- `src/components/DashboardPanel.tsx`

**Current Code:**
```typescript
// signalStore.ts
const initialState: Signal = {
  pair: 'EUR/USD', // ❌ HARDCODED
  signal: 'HOLD',
  price: 1.0752,
  ...
}

// use-chart-data.ts
const generateInitialData = () => {
  let price = 1.0750; // ❌ FAKE DATA
  price += (Math.random() - 0.5) * 0.0002; // Random movement
}
```

**Problem:**
- Dashboard stuck di EUR/USD
- Chart menampilkan random fake data
- Tidak ada market selector
- Backend market service tidak dipakai

**Impact:** 🔴 **CRITICAL** - Core trading feature tidak real

**Fix Steps:**

#### Step 1: Add Market Selector Component

Create `src/components/MarketSelector.tsx`:
```typescript
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDONESIAN_SYMBOLS } from '@/lib/marketData';

interface MarketSelectorProps {
  onPairChange: (pair: string) => void;
  currentPair: string;
}

export function MarketSelector({ onPairChange, currentPair }: MarketSelectorProps) {
  const symbols = Object.keys(INDONESIAN_SYMBOLS);

  return (
    <Select value={currentPair} onValueChange={onPairChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select market" />
      </SelectTrigger>
      <SelectContent>
        {symbols.map((symbol) => (
          <SelectItem key={symbol} value={symbol}>
            {symbol}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

#### Step 2: Create Real Market Data Hook

Create `src/hooks/use-real-market-data.ts`:
```typescript
import { useState, useEffect } from 'react';
import { useSignalStore } from '@/store/signalStore';

export function useRealMarketData(pair: string) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const updateSignal = useSignalStore((state) => state.updateSignal);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        
        // Call backend market service
        const response = await fetch('/api/market/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pair })
        });

        if (!response.ok) throw new Error('Failed to fetch market data');

        const data = await response.json();
        
        // Update signal store with real data
        updateSignal({
          pair: data.pair,
          signal: data.signal,
          price: data.price,
          confidence: data.confidence,
          reasoning: data.reasoning
        });

        // Transform historical data for chart
        const chartPoints = data.historicalData.map((point: any) => ({
          time: new Date(point.timestamp).toLocaleTimeString(),
          price: point.close
        }));
        
        setChartData(chartPoints);
        setIsLoading(false);
      } catch (error) {
        console.error('Market data fetch error:', error);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchMarketData();

    // Poll every 30 seconds for updates
    interval = setInterval(fetchMarketData, 30000);

    return () => clearInterval(interval);
  }, [pair, updateSignal]);

  return { chartData, isLoading };
}
```

#### Step 3: Update DashboardPanel

Update `src/components/DashboardPanel.tsx`:
```typescript
import { useState } from 'react';
import { MarketSelector } from './MarketSelector';
import { useRealMarketData } from '@/hooks/use-real-market-data';

export function DashboardPanel() {
  const { t } = useTranslation();
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const { chartData, isLoading } = useRealMarketData(selectedPair);
  const latestSignal = useSignalStore((state) => state.signal);

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6 text-white">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-gray-400">{t('dashboard.subtitle', { pair: latestSignal.pair })}</p>
        </div>
        
        {/* ADD MARKET SELECTOR */}
        <MarketSelector 
          currentPair={selectedPair} 
          onPairChange={setSelectedPair} 
        />
      </header>

      {isLoading ? (
        <div className="text-center py-12">Loading market data...</div>
      ) : (
        <>
          {/* Chart with REAL data */}
          <div className="mb-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                {/* Chart configuration */}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Rest of dashboard */}
        </>
      )}
    </div>
  );
}
```

#### Step 4: Add Backend Route

Add to `worker/userRoutes.ts`:
```typescript
app.post('/api/market/signal', async (c) => {
  try {
    const { pair } = await c.req.json();
    
    const marketService = new MarketDataService(c.env);
    const signal = await marketService.getMarketDataAndSignal(pair);
    
    return c.json({ success: true, ...signal });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});
```

**Effort:** 4-6 hours  
**Priority:** P0

---

### Bug #3: Broken /support Route 🔴

**File:** `src/components/app-sidebar.tsx`

**Current Code:**
```typescript
<Link to="/support">  {/* ❌ Route tidak ada! */}
  <LifeBuoy /> <span>{t('nav.profile')}</span>
</Link>
```

**Problem:**
- Clicking "Profile" menu → 404 Error
- Route /support tidak defined di router

**Impact:** 🔴 **HIGH** - Navigation broken

**Fix Steps:**

**Option 1: Change to Settings** (Recommended)
```typescript
<Link to="/app/settings">
  <LifeBuoy /> <span>{t('nav.settings')}</span>
</Link>
```

**Option 2: Create Support Page**

1. Create `src/pages/app/SupportPage.tsx`:
```typescript
export function SupportPage() {
  return (
    <div className="h-full p-6">
      <h1 className="text-2xl font-bold mb-4">Support</h1>
      {/* Support content */}
    </div>
  );
}
```

2. Add route to `src/main.tsx`:
```typescript
{
  path: "support",
  element: <SupportPage />,
}
```

**Effort:** 15 minutes  
**Priority:** P0

---

### Bug #4: SignalsPage Hanya Placeholder 🔴

**File:** `src/pages/app/SignalsPage.tsx`

**Current Code:**
```typescript
export function SignalsPage() {
  return (
    <div className="text-center">
      <p>This page is coming soon in Phase 2.</p>
    </div>
  );
}
```

**Problem:**
- Menu "Signals" tidak ada konten
- Hanya tampilan "Coming Soon"

**Impact:** 🔴 **HIGH** - Core feature missing

**Fix Steps:**

Create proper SignalsPage implementation:

```typescript
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SignalHistoryItem {
  id: string;
  pair: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  timestamp: Date;
  reasoning: string;
}

export function SignalsPage() {
  const { t } = useTranslation();
  const [signals, setSignals] = useState<SignalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSignalHistory();
  }, []);

  const fetchSignalHistory = async () => {
    try {
      const response = await fetch('/api/signals/history');
      const data = await response.json();
      setSignals(data.signals || []);
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'SELL': return <TrendingDown className="h-5 w-5 text-red-400" />;
      default: return <Minus className="h-5 w-5 text-yellow-400" />;
    }
  };

  if (isLoading) {
    return <div className="h-full p-6 text-white">Loading signals...</div>;
  }

  return (
    <div className="h-full p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">{t('signals.title')}</h1>
      
      <div className="space-y-4">
        {signals.length === 0 ? (
          <Card className="bg-gray-800/50 border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">
                No signals yet. Start chatting with AI to generate signals.
              </p>
            </CardContent>
          </Card>
        ) : (
          signals.map((signal) => (
            <Card key={signal.id} className="bg-gray-800/50 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getSignalIcon(signal.signal)}
                    {signal.pair}
                  </CardTitle>
                  <Badge className={
                    signal.signal === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    signal.signal === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }>
                    {signal.signal}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Price</p>
                    <p className="font-bold">{signal.price.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Confidence</p>
                    <p className="font-bold">{signal.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="font-bold">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{signal.reasoning}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

Add backend route in `worker/userRoutes.ts`:
```typescript
app.get('/api/signals/history', async (c) => {
  try {
    // Get signals from database or session storage
    // For now, return from chat history
    const sessionId = c.req.query('sessionId');
    // Fetch and filter signals from chat messages
    
    return c.json({ 
      success: true, 
      signals: [] // Return actual signals
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

**Effort:** 3-4 hours  
**Priority:** P1

---

### Bug #5: SettingsPage Hanya Placeholder 🔴

**File:** `src/pages/app/SettingsPage.tsx`

**Current Code:**
```typescript
export function SettingsPage() {
  return (
    <div className="text-center">
      <p>This page is coming soon in Phase 2.</p>
    </div>
  );
}
```

**Problem:**
- Menu "Settings" tidak ada konten
- No user preferences management

**Impact:** ⚠️ **MEDIUM** - Important UX feature missing

**Fix Steps:**

Implement basic settings page:

```typescript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    toast.success('Language updated');
  };

  const handleLogout = () => {
    signOut();
    window.location.href = '/login';
  };

  return (
    <div className="h-full p-6 text-white overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">{t('nav.settings')}</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Settings */}
        <Card className="bg-gray-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.user.email || ''}
                disabled
                className="bg-gray-700 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={user?.user.fullName || ''}
                className="bg-gray-700 border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="bg-gray-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={i18n.language} 
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="bg-gray-700 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card className="bg-gray-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-2">Current Plan</p>
            <p className="text-xl font-bold capitalize">
              {user?.subscription.tier || 'Free'}
            </p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => window.location.href = '/pricing'}
            >
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-900/20 border-red-500/50">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              disabled={isLoading}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Effort:** 2-3 hours  
**Priority:** P2

---

### Bug #6: PortfolioPage Hanya Placeholder 🔴

**File:** `src/pages/app/PortfolioPage.tsx`

**Current Code:**
```typescript
export function PortfolioPage() {
  return (
    <div className="text-center">
      <p>This feature is available for Premium users.</p>
    </div>
  );
}
```

**Problem:**
- Even premium users can't use it
- No portfolio tracking functionality

**Impact:** ⚠️ **MEDIUM** - Premium feature missing

**Fix Steps:**

Implement basic portfolio page (simplified):

```typescript
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';
import { AssetAllocationChart } from '@/components/portfolio/AssetAllocationChart';
import { Lock } from 'lucide-react';

export function PortfolioPage() {
  const { user } = useAuth();
  const isPremium = user?.subscription.tier !== 'free';

  if (!isPremium) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <Card className="bg-gray-800/50 border-white/10 max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-yellow-500" />
              <CardTitle>Premium Feature</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Portfolio tracking is available for Premium subscribers.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6 text-white overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>
      
      <div className="space-y-6">
        <PortfolioOverview />
        <AssetAllocationChart />
        
        {/* Add more portfolio features */}
        <Card className="bg-gray-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-center py-8">
              Holdings management coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Effort:** 2-3 hours (for basic implementation)  
**Priority:** P2

---

### Bug #7: Chat Tidak Berfungsi (No API Keys) 🔴

**Files:**
- `wrangler.jsonc`
- `worker/agent.ts`
- `worker/chat.ts`

**Problem:**
- Chat depends on CF_AI_BASE_URL and CF_AI_API_KEY (yang sekarang pointing ke OpenRouter)
- Platform menggunakan OpenRouter API untuk AI models
- Without valid OpenRouter API keys, chat will fail
- User will see errors atau "mock mode" messages ketika trying to chat
- Semua AI models (GPT-4, Claude, Gemini, etc.) tidak akan berfungsi

**Impact:** 🔴 **CRITICAL** - Main AI feature broken

**Fix:** See Bug #1 (Setup Environment Variables) - Option 1 untuk OpenRouter

**Additional Testing Steps:**
After setting up OpenRouter API keys, test chat functionality:

1. **Start local dev server:**
   ```bash
   npm run dev
   # atau
   npx wrangler dev
   ```

2. **Test chat dengan berbagai models:**
   - Try sending message: "Analyze EUR/USD"
   - Should see AI response dengan market analysis
   - Try different models dari dropdown (Gemini, GPT-4, Claude)

3. **Verify API connection:**
   ```bash
   # Check console untuk errors
   # Should NOT see: "AI Gateway not configured. Running in mock mode"
   # Should see: "ChatAgent initialized with session..."
   ```

4. **Test tool calls:**
   - Send: "Get market data for BTC/USD"
   - Should trigger `get_market_data_and_signal` tool
   - Should see real market data response

**Available Models di OpenRouter:**
- `google-ai-studio/gemini-2.5-flash` (Default)
- `openai/gpt-4o`
- `anthropic/claude-3-5-sonnet`
- `meta-llama/llama-3.1-70b-instruct`
- Dan 100+ models lainnya

**Effort:** Same as Bug #1 (15-30 minutes)  
**Priority:** P0

---

## 📊 Summary Table

| Bug # | Title | Priority | Impact | Effort | Status |
|-------|-------|----------|--------|--------|--------|
| #1 | Environment Variables Tidak Disetup | P0 | 🔴 Critical | 30min | 🔴 Not Fixed |
| #2 | Dashboard Hardcoded EUR/USD | P0 | 🔴 Critical | 4-6h | 🔴 Not Fixed |
| #3 | Broken /support Route | P0 | 🔴 High | 15min | 🔴 Not Fixed |
| #4 | SignalsPage Placeholder | P1 | 🔴 High | 3-4h | 🔴 Not Fixed |
| #5 | SettingsPage Placeholder | P2 | ⚠️ Medium | 2-3h | 🔴 Not Fixed |
| #6 | PortfolioPage Placeholder | P2 | ⚠️ Medium | 2-3h | 🔴 Not Fixed |
| #7 | Chat Tidak Berfungsi | P0 | 🔴 Critical | Same as #1 | 🔴 Not Fixed |

**Total Effort to Fix All Bugs:** 12-16 hours (1.5-2 working days)

---

## 🎯 Recommended Fix Order

### Sprint 1: Critical Fixes (Day 1)
1. **Bug #1** - Setup OpenRouter API Keys (15-30min) ⚡
2. **Bug #3** - Fix /support Route (15min)
3. **Bug #7** - Verify Chat Connection to OpenRouter (included in #1)
4. **Bug #2** - Connect Dashboard to Real Market Data (4-6h)

**Total:** ~5-7 hours

### Sprint 2: Core Features (Day 2)
4. **Bug #4** - Implement SignalsPage (3-4h)
5. **Bug #5** - Implement SettingsPage (2-3h)

**Total:** ~5-7 hours

### Sprint 3: Polish (Day 3)
6. **Bug #6** - Implement PortfolioPage (2-3h)
7. **Testing & Verification** - Test all fixes (2-3h)

**Total:** ~4-6 hours

---

## ✅ Testing Checklist

After implementing fixes, verify:

### Environment & API Connection
- [ ] **OpenRouter API key** is set correctly in wrangler.jsonc
- [ ] `.dev.vars` file created dengan correct API keys
- [ ] Chat connects to **OpenRouter** and responds
- [ ] No "mock mode" messages dalam console
- [ ] AI models dapat di-switch (Gemini, GPT-4, Claude)

### Dashboard Functionality
- [ ] Dashboard shows real market data untuk EUR/USD
- [ ] **Market selector** muncul dan berfungsi
- [ ] Market selector dapat switch antara different pairs:
  - [ ] EUR/USD, USD/IDR
  - [ ] BBCA.JK, BBRI.JK (Indonesian stocks)
  - [ ] BTC/USD, ETH/USD
- [ ] Chart displays **real price data** (not random fake data)
- [ ] Chart updates ketika market pair diubah

### Navigation
- [ ] All sidebar menu items work (no 404 errors)
- [ ] /support route fixed atau redirected to settings
- [ ] Dashboard, Chat, Signals, Portfolio, Settings - semua accessible

### Core Pages
- [ ] **SignalsPage** shows signal history (not "Coming Soon")
- [ ] **SettingsPage** allows language change & profile view
- [ ] **PortfolioPage** shows untuk premium users
- [ ] Free users see upgrade prompt untuk portfolio

### AI Features
- [ ] Tool calls work:
  - [ ] `get_market_data_and_signal` returns real data
  - [ ] `execute_trade_signal` executes properly
  - [ ] Market data updates dalam dashboard
- [ ] Signal generation works untuk different markets
- [ ] RAG agent provides Indonesian trading education responses

---

## 📞 Support

Untuk pertanyaan atau bantuan implementasi:
- **Email:** development@nusanexus.trading
- **Documentation:** `/CRITICAL_BUGS_AND_FIXES.md`

**Last Updated:** 12 November 2025
