# Flow & Navigation Redesign Plan - COMPLETE REFERENCE

## Context
- Saat ini route `/` langsung merender `HomePage` yang berisi dashboard + chat sehingga pengalaman awal terasa "post-login".
- Tidak ada halaman landing, CTA onboarding, maupun jalur login/registrasi meskipun `AuthService` sudah tersedia.
- Navigasi `/pricing` mencoba mengarahkan ke `/dashboard` (tidak ada) sehingga alur paket gratis/pembayaran berujung dead-end.
- Komponen `AppLayout`/sidebar belum dimanfaatkan untuk membedakan shell publik vs privat.

## Tujuan
1. Menyediakan landing page publik yang menjelaskan value prop, paket, dan CTA "Masuk/Daftar".
2. Memisahkan alur sebelum-login dan sesudah-login dengan proteksi route serta pemanfaatan autentikasi.
3. Memperbaiki alur pemilihan paket agar pengguna diarahkan ke login/onboarding sebelum masuk aplikasi inti.
4. Menyatukan navigasi publik & privat agar konsisten di desktop/mobile, tanpa link rusak.

---

## Technical Architecture

### Route Structure Lengkap

```typescript
// ===== PUBLIC ROUTES (tidak perlu login) =====
/                       → LandingPage
                          - Hero section dengan value proposition
                          - Feature highlights (3-4 key features)
                          - Pricing preview (link ke /pricing)
                          - CTA: "Coba Gratis" & "Masuk"
                          - Testimonials (optional)

/pricing                → PricingPage
                          - Comparison table 4 tiers (Free/Basic/Premium/Pro)
                          - FAQ section
                          - CTA per tier dengan auth check

/terms                  → TermsOfService (existing)
/privacy                → PrivacyPolicy (existing)

/login                  → LoginPage
                          - Email/password form
                          - "Lupa password?" link
                          - Social login buttons (Google, optional)
                          - "Belum punya akun? Daftar" link
                          - Support redirect dengan query: ?returnUrl=/app/portfolio

/register               → RegisterPage
                          - Email/password/name form
                          - Terms & Privacy checkbox
                          - Social signup (Google, optional)
                          - "Sudah punya akun? Masuk" link

// ===== PROTECTED ROUTES (perlu login) =====
/app                    → AppShell (layout dengan AppSidebar)
                          - Sidebar navigation (mobile: bottom nav)
                          - Header dengan profile dropdown & notifications
                          - Breadcrumbs
                          - Children routes rendered in main area

  /app/dashboard        → DashboardPage (default redirect setelah login)
                          - Market overview widgets
                          - Recent signals
                          - Portfolio summary (jika ada)
                          - Quick actions

  /app/chat             → ChatPage (refactor dari HomePage)
                          - AI chat interface
                          - Chat history sidebar
                          - Model selector
                          - Tools panel

  /app/portfolio        → PortfolioPage [requireSubscription: 'premium']
                          - Holdings list
                          - P&L summary
                          - Asset allocation chart
                          - Add/edit positions

  /app/signals          → SignalsHistoryPage
                          - Table of past signals
                          - Filter by symbol/date/type
                          - Accuracy stats
                          - Export feature (Premium+)

  /app/settings         → SettingsPage
                          - Profile settings
                          - Subscription management
                          - Language & timezone
                          - API keys (Pro tier)

  /app/profile          → ProfilePage
                          - Public profile view
                          - Trading stats
                          - Achievements (optional)

// ===== ONBOARDING ROUTES (protected, linear flow) =====
/onboarding             → OnboardingLayout (minimal header, progress bar)

  /onboarding/welcome   → WelcomeStep
                          - "Selamat datang!" message
                          - Brief platform intro
                          - CTA: "Mulai"

  /onboarding/plan      → PlanSelectionStep
                          - Pricing cards (simplified)
                          - Highlight recommended plan
                          - CTA per plan → checkout atau skip (free)

  /onboarding/profile   → ProfileSetupStep
                          - Risk profile questionnaire
                          - Experience level
                          - Preferred markets
                          - CTA: "Selesai" → /app/dashboard

// ===== PAYMENT ROUTES (protected) =====
/checkout/:tier         → CheckoutPage (parameter: 'basic' | 'premium' | 'pro')
                          - Order summary
                          - Payment method selector (Midtrans)
                          - Promo code input
                          - Terms acceptance

/payment/success        → PaymentSuccessPage
                          - Success message
                          - Order details
                          - CTA: "Mulai menggunakan" → /app/dashboard

/payment/failed         → PaymentFailedPage
                          - Error message
                          - Retry options
                          - Support contact link
```

### Auth Flow Diagram

```mermaid
graph TD
    A[User lands on /] --> B{Sudah login?}
    B -->|Ya| C[Redirect ke /app/dashboard]
    B -->|Tidak| D[Tampilkan LandingPage]
    
    D --> E[User klik 'Masuk']
    D --> F[User klik 'Daftar']
    D --> G[User klik 'Coba Gratis']
    
    E --> H[/login]
    F --> I[/register]
    G --> J{Sudah login?}
    
    J -->|Tidak| H
    J -->|Ya| K[/onboarding/plan]
    
    H --> L[Form Login]
    I --> M[Form Register]
    
    L --> N{Login berhasil?}
    M --> O{Register berhasil?}
    
    N -->|Ya| P{Ada returnUrl?}
    N -->|Tidak| Q[Show error & stay]
    
    O -->|Ya| R[Auto login]
    O -->|Tidak| S[Show error & stay]
    
    P -->|Ya| T[Redirect ke returnUrl]
    P -->|Tidak| U[Redirect ke /app/dashboard]
    
    R --> V{User baru?}
    V -->|Ya| K
    V -->|Tidak| U
    
    K --> W[/onboarding/welcome]
    W --> X[/onboarding/plan]
    X --> Y[Pilih paket]
    
    Y --> Z{Paket gratis?}
    Z -->|Ya| AA[Update tier = free]
    Z -->|Tidak| AB[/checkout/:tier]
    
    AA --> AC[/onboarding/profile]
    
    AB --> AD{Payment berhasil?}
    AD -->|Ya| AE[/payment/success]
    AD -->|Tidak| AF[/payment/failed]
    
    AE --> AC
    AF --> X
    
    AC --> AG[Setup profile]
    AG --> U
    
    style C fill:#90EE90
    style U fill:#90EE90
    style Q fill:#FFB6C1
    style S fill:#FFB6C1
    style AF fill:#FFB6C1
```

### State Management Strategy

**Pilihan:** React Context API + Custom Hooks (tidak perlu library eksternal untuk auth state sederhana)

**Why Context API?**
- Auth state relatif simple (user, token, subscription)
- Tidak perlu complex state updates
- Sudah built-in React, no extra bundle size
- Mudah migrate ke Zustand/Redux nanti jika perlu

**File Structure:**

```typescript
// src/lib/auth-context.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, User } from './auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'pro';
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateSubscription: (tier: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    subscriptionTier: 'free',
  });

  // Init: check existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            subscriptionTier: user.subscriptionTier || 'free',
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth init failed:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  // Token refresh interval (every 5 minutes)
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        await AuthService.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Force logout if refresh fails
        await logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  const login = async (email: string, password: string, rememberMe = false) => {
    const user = await AuthService.login(email, password, rememberMe);
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      subscriptionTier: user.subscriptionTier || 'free',
    });
  };

  const register = async (data: RegisterData) => {
    const user = await AuthService.register(data);
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      subscriptionTier: 'free', // new users start with free
    });
  };

  const logout = async () => {
    await AuthService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      subscriptionTier: 'free',
    });
  };

  const refreshUser = async () => {
    const user = await AuthService.getCurrentUser();
    if (user) {
      setState(prev => ({
        ...prev,
        user,
        subscriptionTier: user.subscriptionTier || 'free',
      }));
    }
  };

  const updateSubscription = async (tier: string) => {
    await AuthService.updateSubscription(tier);
    setState(prev => ({
      ...prev,
      subscriptionTier: tier as any,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser, updateSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Session Persistence Strategy:**

```typescript
// src/lib/auth.ts (extend existing AuthService)

export class AuthService {
  private static readonly SESSION_KEY = 'signal_sage_session';
  private static readonly REMEMBER_KEY = 'signal_sage_remember';

  static async login(email: string, password: string, rememberMe: boolean) {
    // Call API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    const { user, token, refreshToken } = await response.json();

    // Save session
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.SESSION_KEY, JSON.stringify({ user, token, refreshToken }));
    
    return user;
  }

  static async getCurrentUser(): Promise<User | null> {
    // Check both storages
    const sessionData = 
      sessionStorage.getItem(this.SESSION_KEY) ||
      localStorage.getItem(this.SESSION_KEY);

    if (!sessionData) return null;

    try {
      const { user, token } = JSON.parse(sessionData);
      
      // Validate token expiry
      if (this.isTokenExpired(token)) {
        await this.refreshToken();
        return this.getCurrentUser(); // Retry after refresh
      }

      return user;
    } catch {
      return null;
    }
  }

  static async logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    // Call logout API if needed
    await fetch('/api/auth/logout', { method: 'POST' });
  }

  private static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private static async refreshToken() {
    const sessionData = 
      sessionStorage.getItem(this.SESSION_KEY) ||
      localStorage.getItem(this.SESSION_KEY);

    if (!sessionData) throw new Error('No session');

    const { refreshToken } = JSON.parse(sessionData);
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    const { token: newToken, refreshToken: newRefreshToken } = await response.json();

    // Update storage
    const storage = localStorage.getItem(this.SESSION_KEY) ? localStorage : sessionStorage;
    const data = JSON.parse(sessionData);
    storage.setItem(this.SESSION_KEY, JSON.stringify({
      ...data,
      token: newToken,
      refreshToken: newRefreshToken,
    }));
  }
}
```

**Redirect Handling Pattern:**

```typescript
// Di ProtectedRoute component atau LoginPage
const location = useLocation();
const navigate = useNavigate();
const searchParams = new URLSearchParams(location.search);

// Get returnUrl from query param, fallback to /app/dashboard
const returnUrl = searchParams.get('returnUrl') || '/app/dashboard';

// After successful login:
navigate(returnUrl, { replace: true });

// Cara pakai:
// User coba akses /app/portfolio (belum login)
// → Redirect ke /login?returnUrl=/app/portfolio
// → Login berhasil → Redirect kembali ke /app/portfolio
```

### Protected Route Implementation

```typescript
// src/components/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: 'basic' | 'premium' | 'pro' | null;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children,
  requireSubscription = null,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, subscriptionTier } = useAuth();
  const location = useLocation();

  // Loading state saat initial check
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        {fallback || (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  // User belum login → redirect ke /login dengan returnUrl
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  // User sudah login tapi subscription tier tidak cukup
  if (requireSubscription) {
    const tierHierarchy = ['free', 'basic', 'premium', 'pro'];
    const userTierIndex = tierHierarchy.indexOf(subscriptionTier);
    const requiredTierIndex = tierHierarchy.indexOf(requireSubscription);
    
    if (userTierIndex < requiredTierIndex) {
      // Redirect ke pricing page dengan upgrade prompt
      return <Navigate 
        to={`/pricing?upgrade=${requireSubscription}&returnUrl=${encodeURIComponent(location.pathname)}`} 
        replace 
      />;
    }
  }

  // All checks passed
  return <>{children}</>;
}

// Usage di main.tsx:
// {
//   path: "/app/portfolio",
//   element: (
//     <ProtectedRoute requireSubscription="premium">
//       <PortfolioPage />
//     </ProtectedRoute>
//   ),
// }
```

**Alternative Pattern - Layout-based Protection:**

```typescript
// src/components/layouts/AppShell.tsx

import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppSidebar } from '@/components/AppSidebar';

export function AppShell() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet /> {/* Child routes render here */}
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Di main.tsx, wrap parent route:
// {
//   path: "/app",
//   element: <AppShell />, // Protected layout
//   children: [
//     { path: "dashboard", element: <DashboardPage /> },
//     { path: "chat", element: <ChatPage /> },
//     // etc...
//   ]
// }
```

### Analytics & Tracking Plan

**Goal:** Track conversion funnel dari landing → signup → onboarding → paid

**Events to Track:**

```typescript
// src/lib/analytics.ts

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

class Analytics {
  track(event: string, properties?: Record<string, any>) {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', event, properties);
    }

    // Mixpanel (optional)
    if (window.mixpanel) {
      window.mixpanel.track(event, properties);
    }

    // Console log for debugging
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', { user_id: userId });
    }

    if (window.mixpanel) {
      window.mixpanel.identify(userId);
      if (traits) window.mixpanel.people.set(traits);
    }
  }
}

export const analytics = new Analytics();

// Custom hook
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
  };
}
```

**Event Mapping:**

```typescript
// ===== LANDING PAGE =====
analytics.track('landing_page_view');
analytics.track('cta_clicked', { 
  cta_location: 'hero' | 'navbar' | 'footer',
  cta_text: 'Coba Gratis' | 'Masuk' | 'Lihat Harga'
});

// ===== PRICING PAGE =====
analytics.track('pricing_page_view', {
  referrer: document.referrer
});
analytics.track('plan_selected', { 
  tier: 'free' | 'basic' | 'premium' | 'pro',
  billing: 'monthly' | 'annual'
});
analytics.track('plan_comparison_toggled', { 
  show_annual: boolean 
});

// ===== AUTH FLOW =====
analytics.track('login_page_view', {
  return_url: string | null
});
analytics.track('login_attempt', {
  method: 'email' | 'google'
});
analytics.track('login_success', {
  method: 'email' | 'google',
  return_url: string | null
});
analytics.track('login_failed', {
  method: 'email' | 'google',
  error_type: 'invalid_credentials' | 'network_error'
});

analytics.track('register_page_view');
analytics.track('register_attempt', {
  method: 'email' | 'google'
});
analytics.track('register_success', {
  method: 'email' | 'google'
});
analytics.track('register_failed', {
  method: 'email' | 'google',
  error_type: string
});

// ===== ONBOARDING =====
analytics.track('onboarding_started');
analytics.track('onboarding_step_viewed', {
  step: 'welcome' | 'plan' | 'profile',
  step_number: 1 | 2 | 3
});
analytics.track('onboarding_step_completed', {
  step: string,
  time_spent_seconds: number
});
analytics.track('onboarding_completed', {
  total_time_seconds: number,
  selected_tier: string
});
analytics.track('onboarding_skipped', {
  at_step: string
});

// ===== CHECKOUT & PAYMENT =====
analytics.track('checkout_started', {
  tier: string,
  amount: number,
  currency: 'IDR'
});
analytics.track('payment_method_selected', {
  method: 'credit_card' | 'bank_transfer' | 'ewallet' | 'qris'
});
analytics.track('promo_code_applied', {
  code: string,
  discount_amount: number
});
analytics.track('checkout_completed', {
  tier: string,
  amount: number,
  payment_method: string,
  transaction_id: string
});
analytics.track('checkout_failed', {
  tier: string,
  payment_method: string,
  error: string
});

// ===== APP USAGE =====
analytics.track('dashboard_viewed');
analytics.track('chat_message_sent', {
  model: string,
  message_length: number
});
analytics.track('signal_generated', {
  symbol: string,
  signal_type: 'BUY' | 'SELL' | 'HOLD'
});
analytics.track('portfolio_viewed');
analytics.track('settings_updated', {
  setting_type: string
});

// ===== FEATURE LOCKS & UPGRADES =====
analytics.track('feature_locked_shown', {
  feature: 'portfolio' | 'advanced_indicators' | 'api_access',
  user_tier: string
});
analytics.track('upgrade_prompt_clicked', {
  from_page: string,
  target_tier: string
});

// ===== RETENTION & ENGAGEMENT =====
analytics.track('session_started');
analytics.track('session_ended', {
  duration_seconds: number
});
analytics.track('user_returned', {
  days_since_last_visit: number
});
```

**Conversion Funnel Setup (Google Analytics 4):**

1. **Landing → Signup Funnel:**
   - landing_page_view
   - pricing_page_view
   - register_page_view
   - register_success

2. **Signup → Paid Funnel:**
   - register_success
   - onboarding_started
   - plan_selected (tier != 'free')
   - checkout_started
   - checkout_completed

3. **Free → Paid Conversion Funnel:**
   - register_success (tier = 'free')
   - feature_locked_shown
   - upgrade_prompt_clicked
   - checkout_completed

**Implementation Locations:**

```typescript
// src/pages/LandingPage.tsx
useEffect(() => {
  analytics.track('landing_page_view');
}, []);

// src/pages/LoginPage.tsx
const handleLogin = async () => {
  analytics.track('login_attempt', { method: 'email' });
  try {
    await login(email, password);
    analytics.track('login_success', { method: 'email', return_url: returnUrl });
    navigate(returnUrl);
  } catch (error) {
    analytics.track('login_failed', { method: 'email', error_type: error.type });
  }
};

// etc...
```

---

## Fase Implementasi (Detailed)

### Phase 1 — Landing & Router Publik

**Output:** LandingPage baru di `/`, router restructure dengan public/protected separation.

**Task Breakdown:**

1. **Create LandingPage component** (`src/pages/LandingPage.tsx`)
   - [ ] Hero section dengan headline & CTA
   - [ ] Features section (3-4 cards)
   - [ ] Pricing preview (link ke /pricing)
   - [ ] Testimonials (optional, mock data OK)
   - [ ] Footer dengan legal links
   - [ ] Responsive mobile layout
   - [ ] i18n untuk semua text
   - **Estimasi:** 6-8 jam

2. **Update Router** (`src/main.tsx`)
   - [ ] Tambah route `/` → LandingPage
   - [ ] Tambah route `/login` → LoginPage (placeholder OK)
   - [ ] Tambah route `/register` → RegisterPage (placeholder OK)
   - [ ] Buat layout `AppShell` untuk `/app/*` routes
   - [ ] Move existing HomePage → `/app/dashboard` (atau `/app/chat`)
   - [ ] Test: semua route accessible
   - **Estimasi:** 3-4 jam

3. **Create PublicLayout component** (`src/components/layouts/PublicLayout.tsx`)
   - [ ] Header dengan logo, nav links (Pricing, Terms, Privacy)
   - [ ] CTAs: "Masuk" & "Daftar" buttons
   - [ ] LanguageSwitcher integration
   - [ ] ThemeToggle integration
   - [ ] Footer
   - [ ] Responsive mobile nav (hamburger menu)
   - **Estimasi:** 4-6 jam

4. **Refactor HomePage → DashboardPage**
   - [ ] Rename `src/pages/HomePage.tsx` → `src/pages/app/DashboardPage.tsx`
   - [ ] Remove full-page layout, assume parent AppShell
   - [ ] Split ChatPanel → separate page `/app/chat` (optional Phase 1, required Phase 2)
   - [ ] Update imports & routes
   - **Estimasi:** 2-3 jam

5. **Create AppShell layout** (`src/components/layouts/AppShell.tsx`)
   - [ ] Sidebar navigation (desktop)
   - [ ] Bottom navigation (mobile)
   - [ ] Header with user dropdown
   - [ ] Main content area with `<Outlet />`
   - [ ] Breadcrumbs (optional)
   - **Estimasi:** 6-8 jam

**Testing Checklist:**
- [ ] Navigate `/` → tampil landing page
- [ ] Navigate `/pricing` → tampil pricing page (existing)
- [ ] Navigate `/login` → tampil login placeholder
- [ ] Navigate `/app/dashboard` → redirect ke `/login` (belum auth)
- [ ] Mobile responsive: landing, pricing, legal pages
- [ ] Language switch works on landing page
- [ ] Theme toggle works

**Total Estimasi Phase 1:** ~25-30 jam (3-4 hari kerja)

---

### Phase 2 — Autentikasi Dasar

**Output:** Login/register functional, AuthContext, protected routes working.

**Task Breakdown:**

1. **Setup AuthContext** (`src/lib/auth-context.tsx`)
   - [ ] Create context & provider (lihat code example di atas)
   - [ ] Implement useAuth hook
   - [ ] Session persistence (localStorage/sessionStorage)
   - [ ] Token expiry check & auto-refresh
   - [ ] Wrap app dengan `<AuthProvider>` di main.tsx
   - **Estimasi:** 6-8 jam

2. **Extend AuthService** (`src/lib/auth.ts`)
   - [ ] Implement login() - call backend /api/auth/login
   - [ ] Implement register() - call backend /api/auth/register
   - [ ] Implement logout() - clear session
   - [ ] Implement getCurrentUser() - validate token & get user
   - [ ] Implement refreshToken() - get new token
   - [ ] **Note:** Bisa mock API response dulu jika backend belum ready
   - **Estimasi:** 4-6 jam

3. **Create LoginPage** (`src/pages/LoginPage.tsx`)
   - [ ] Email & password input fields
   - [ ] "Remember me" checkbox
   - [ ] Submit button dengan loading state
   - [ ] Error handling & display
   - [ ] "Lupa password?" link (optional)
   - [ ] Google login button (optional, mock OK)
   - [ ] "Belum punya akun? Daftar" link → /register
   - [ ] Handle returnUrl query param
   - [ ] i18n untuk semua text
   - [ ] Form validation (email format, password min length)
   - **Estimasi:** 6-8 jam

4. **Create RegisterPage** (`src/pages/RegisterPage.tsx`)
   - [ ] Name, email, password, confirm password fields
   - [ ] Terms & Privacy checkbox (required)
   - [ ] Submit button dengan loading state
   - [ ] Error handling (email already exists, etc.)
   - [ ] Google signup button (optional, mock OK)
   - [ ] "Sudah punya akun? Masuk" link → /login
   - [ ] Auto login setelah register berhasil
   - [ ] i18n untuk semua text
   - [ ] Form validation
   - **Estimasi:** 6-8 jam

5. **Create ProtectedRoute component** (`src/components/ProtectedRoute.tsx`)
   - [ ] Check isAuthenticated from useAuth()
   - [ ] Show loading spinner saat isLoading
   - [ ] Redirect ke /login jika belum auth (dengan returnUrl)
   - [ ] Support requireSubscription prop untuk tier gating
   - [ ] Redirect ke /pricing jika tier kurang (dengan upgrade prompt)
   - **Estimasi:** 3-4 jam

6. **Wrap /app/* routes dengan ProtectedRoute**
   - [ ] Update main.tsx router config
   - [ ] Test: akses /app/dashboard tanpa login → redirect
   - [ ] Test: login → redirect ke /app/dashboard
   - [ ] Test: akses /app/portfolio tanpa login → redirect dengan returnUrl → login → kembali ke portfolio
   - **Estimasi:** 2-3 jam

7. **Add auth CTAs ke PublicLayout**
   - [ ] Header: "Masuk" & "Daftar" buttons
   - [ ] Jika sudah login: tampilkan user avatar/name + dropdown
   - [ ] Dropdown: Profile, Settings, Logout
   - [ ] Mobile: hamburger menu dengan auth CTAs
   - **Estimasi:** 3-4 jam

8. **Backend API endpoints** (`worker/routes/auth.ts`)
   - [ ] POST /api/auth/register - create user, return token
   - [ ] POST /api/auth/login - validate, return token
   - [ ] POST /api/auth/logout - invalidate token (optional)
   - [ ] POST /api/auth/refresh - refresh token
   - [ ] GET /api/auth/me - get current user
   - [ ] Database: users table (extend existing atau buat baru)
   - [ ] Password hashing (bcrypt)
   - [ ] JWT token generation & validation
   - **Estimasi:** 8-10 jam (atau gunakan Supabase Auth untuk shortcut)

**Testing Checklist:**
- [ ] Register user baru → auto login → redirect ke /app/dashboard
- [ ] Login dengan user existing → redirect ke /app/dashboard
- [ ] Login dengan returnUrl → redirect ke returnUrl setelah login
- [ ] Logout → clear session → redirect ke landing
- [ ] Protected route access tanpa login → redirect ke login
- [ ] "Remember me" checkbox → session persist setelah close browser
- [ ] Token expiry → auto refresh → no disruption
- [ ] Error handling: wrong password, email taken, network error
- [ ] Mobile: auth forms responsive

**Total Estimasi Phase 2:** ~40-50 jam (5-6 hari kerja)

**Shortcut Option (jika deadline ketat):**
- Gunakan **Supabase Auth** → kurangi backend work jadi ~4-6 jam
- Total jadi ~32-40 jam (4-5 hari)

---

### Phase 3 — Onboarding & Plan Flow

**Output:** Smooth onboarding flow setelah register, plan selection integrated.

**Task Breakdown:**

1. **Create OnboardingLayout** (`src/components/layouts/OnboardingLayout.tsx`)
   - [ ] Minimal header (logo, progress bar)
   - [ ] Main content area
   - [ ] No sidebar/footer
   - [ ] Progress indicator (step 1/3, 2/3, 3/3)
   - [ ] "Skip" button (optional)
   - **Estimasi:** 3-4 jam

2. **Create WelcomeStep** (`src/pages/onboarding/WelcomeStep.tsx`)
   - [ ] Welcome message dengan user name
   - [ ] Brief intro (3-4 bullet points)
   - [ ] CTA: "Mulai" → next step
   - [ ] i18n
   - **Estimasi:** 2-3 jam

3. **Create PlanSelectionStep** (`src/pages/onboarding/PlanSelectionStep.tsx`)
   - [ ] Pricing cards (4 tiers)
   - [ ] Highlight recommended tier (Basic/Premium)
   - [ ] CTA per tier:
     - Free: "Mulai Gratis" → skip checkout, update tier, next step
     - Paid: "Pilih [Tier]" → /checkout/:tier
   - [ ] "Saya belum yakin" → default ke Free
   - [ ] i18n
   - **Estimasi:** 4-6 jam

4. **Create ProfileSetupStep** (`src/pages/onboarding/ProfileSetupStep.tsx`)
   - [ ] Risk profile questionnaire (3-5 questions)
   - [ ] Experience level (Beginner/Intermediate/Advanced)
   - [ ] Preferred markets (checkboxes: Saham, Forex, Crypto)
   - [ ] CTA: "Selesai" → /app/dashboard
   - [ ] Save to user profile
   - [ ] i18n
   - **Estimasi:** 4-6 jam

5. **Update RegisterPage flow**
   - [ ] After successful register → redirect ke /onboarding/welcome (bukan langsung /app/dashboard)
   - [ ] Set flag: user.hasCompletedOnboarding = false
   - **Estimasi:** 1-2 jam

6. **Update PricingPage CTAs**
   - [ ] Check isAuthenticated dari useAuth()
   - [ ] Jika belum login:
     - Free CTA: "Coba Gratis" → /register
     - Paid CTA: "Pilih [Tier]" → /register?plan=[tier]
   - [ ] Jika sudah login:
     - Free CTA: "Gunakan Gratis" → update tier, redirect /app/dashboard
     - Paid CTA: "Upgrade ke [Tier]" → /checkout/:tier
   - [ ] Show current tier badge jika sudah subscribe
   - **Estimasi:** 3-4 jam

7. **Add onboarding routes to router** (`src/main.tsx`)
   - [ ] /onboarding → OnboardingLayout (protected)
   - [ ] /onboarding/welcome → WelcomeStep
   - [ ] /onboarding/plan → PlanSelectionStep
   - [ ] /onboarding/profile → ProfileSetupStep
   - [ ] Test linear flow
   - **Estimasi:** 2-3 jam

8. **Add "skip onboarding" logic**
   - [ ] Check if user already completed onboarding
   - [ ] If yes & tries to access /onboarding → redirect /app/dashboard
   - [ ] Add to AppShell or ProtectedRoute
   - **Estimasi:** 1-2 jam

9. **Backend: Update user profile endpoints**
   - [ ] POST /api/user/profile - save risk profile, experience, markets
   - [ ] PATCH /api/user/subscription - update tier (for free tier)
   - [ ] GET /api/user/me - include hasCompletedOnboarding flag
   - **Estimasi:** 3-4 jam

**Testing Checklist:**
- [ ] Register → welcome → plan selection → profile setup → dashboard (full flow)
- [ ] Choose free plan → skip checkout → complete profile → dashboard
- [ ] Choose paid plan → redirect to checkout
- [ ] Logout lalu login lagi → tidak tampil onboarding lagi (flag check)
- [ ] Pricing page CTAs react properly to auth status
- [ ] "Skip" button works (jika diimplementasi)
- [ ] Mobile: onboarding responsive

**Total Estimasi Phase 3:** ~25-35 jam (3-4 hari kerja)

---

### Phase 4 — Navigasi & UX Konsisten

**Output:** Polished navigation publik & privat, mobile-friendly.

**Task Breakdown:**

1. **Enhance PublicLayout header**
   - [ ] Logo → link ke /
   - [ ] Desktop nav: Home, Pricing, (optional: Features, Blog)
   - [ ] Right side: Language, Theme, Login, Signup
   - [ ] Mobile: Hamburger menu
   - [ ] Sticky header (optional)
   - **Estimasi:** 3-4 jam

2. **Enhance AppShell sidebar** (`src/components/AppSidebar.tsx`)
   - [ ] Logo + app name
   - [ ] Nav items dengan icons:
     - Dashboard (Home icon)
     - Chat (MessageSquare icon)
     - Signals (TrendingUp icon)
     - Portfolio (PieChart icon) - show lock if not premium
     - Settings (Settings icon)
   - [ ] User section at bottom: avatar, name, tier badge
   - [ ] Collapsible sidebar (desktop)
   - [ ] Slide-out drawer (mobile)
   - **Estimasi:** 6-8 jam

3. **Create bottom navigation (mobile)** (`src/components/AppBottomNav.tsx`)
   - [ ] Fixed bottom bar
   - [ ] 4-5 main nav items (same as sidebar)
   - [ ] Active state highlighting
   - [ ] Hide on scroll down, show on scroll up (optional)
   - **Estimasi:** 3-4 jam

4. **Add breadcrumbs** (`src/components/Breadcrumbs.tsx`)
   - [ ] Show in AppShell header
   - [ ] Auto-generate from route path
   - [ ] Clickable navigation
   - [ ] i18n for route names
   - **Estimasi:** 3-4 jam

5. **Add user dropdown menu** (AppShell header)
   - [ ] Avatar + name + tier badge
   - [ ] Dropdown options:
     - Profile
     - Settings
     - Subscription (link to /pricing if want upgrade)
     - Logout
   - [ ] Mobile: slide-out dari sidebar
   - **Estimasi:** 3-4 jam

6. **Add footer to PublicLayout**
   - [ ] Logo + tagline
   - [ ] Links: Terms, Privacy, Support, Blog
   - [ ] Social media icons (optional)
   - [ ] Language selector (duplicate atau shared component)
   - [ ] Copyright text
   - **Estimasi:** 2-3 jam

7. **Fix all broken links**
   - [ ] Audit semua `<a href>` → ganti ke `<Link to>`
   - [ ] Test: klik setiap link di nav, footer, CTAs
   - [ ] Test: back button works correctly (no broken state)
   - **Estimasi:** 2-3 jam

8. **Add "feature locked" modal/banner**
   - [ ] Component: `src/components/FeatureLockedModal.tsx`
   - [ ] Show when user with insufficient tier tries access premium feature
   - [ ] Content: "Upgrade to [Tier] to unlock this feature"
   - [ ] CTA: "Lihat Paket" → /pricing?upgrade=[tier]
   - [ ] Reusable component
   - **Estimasi:** 3-4 jam

9. **Polish mobile UX**
   - [ ] Test all pages di mobile viewport
   - [ ] Fix layout issues
   - [ ] Ensure touch targets are big enough (min 44px)
   - [ ] Test hamburger menu, bottom nav, dropdowns
   - [ ] Fix any z-index issues
   - **Estimasi:** 4-6 jam

10. **Add loading states & skeletons**
    - [ ] Page transitions
    - [ ] Data loading (signals, portfolio, etc.)
    - [ ] Skeleton screens untuk lists/cards
    - [ ] Spinner untuk buttons
    - **Estimasi:** 4-6 jam

**Testing Checklist:**
- [ ] Desktop: semua nav links work, no broken links
- [ ] Mobile: hamburger menu, bottom nav, dropdowns work
- [ ] Sidebar collapsible works (desktop)
- [ ] User dropdown accessible di desktop & mobile
- [ ] Breadcrumbs accurate, clickable
- [ ] Footer links work
- [ ] Feature locked modal shows correctly (test dengan free tier user)
- [ ] Language switch persists across pages
- [ ] Theme toggle persists
- [ ] No horizontal scroll on mobile
- [ ] Touch targets adequate for mobile

**Total Estimasi Phase 4:** ~35-45 jam (4-5 hari kerja)

---

### Phase 5 — QA & Validasi

**Output:** Bug-free, tested, documented flow.

**Task Breakdown:**

1. **Manual Testing - Happy Paths**
   - [ ] Path 1: Landing → Pricing → Register → Onboarding → Dashboard → Logout
   - [ ] Path 2: Landing → Login → Dashboard → Settings → Logout
   - [ ] Path 3: Landing → Pricing → Register (paid) → Onboarding → Checkout → Dashboard
   - [ ] Path 4: Dashboard → Try access Premium feature → Locked → Pricing → Checkout
   - [ ] Path 5: Mobile versions of all above
   - **Estimasi:** 4-6 jam

2. **Manual Testing - Error Cases**
   - [ ] Login with wrong password
   - [ ] Register with existing email
   - [ ] Access protected route without login
   - [ ] Network error during login
   - [ ] Token expiry mid-session
   - [ ] Payment failure flow
   - [ ] Browser back/forward edge cases
   - **Estimasi:** 3-4 jam

3. **Cross-browser Testing**
   - [ ] Chrome (desktop & mobile)
   - [ ] Safari (desktop & mobile iOS)
   - [ ] Firefox
   - [ ] Edge
   - [ ] Test: auth, routing, layout, responsiveness
   - **Estimasi:** 3-4 jam

4. **Accessibility Audit**
   - [ ] Keyboard navigation (Tab, Enter, Esc)
   - [ ] Screen reader basics (aria labels)
   - [ ] Color contrast (WCAG AA minimum)
   - [ ] Focus indicators visible
   - [ ] Forms have labels
   - **Estimasi:** 2-3 jam

5. **Performance Check**
   - [ ] Lighthouse audit (aim for >90 score)
   - [ ] Check bundle size (code splitting effective?)
   - [ ] Image optimization
   - [ ] Lazy loading routes
   - [ ] Fix any red flags
   - **Estimasi:** 3-4 jam

6. **Security Review**
   - [ ] XSS prevention (input sanitization)
   - [ ] CSRF token (if applicable)
   - [ ] Secure token storage (no plain text in localStorage if sensitive)
   - [ ] HTTPS enforced (production)
   - [ ] Content Security Policy (CSP) headers
   - **Estimasi:** 2-3 jam

7. **Documentation**
   - [ ] Update README with:
     - New route structure
     - How to run locally
     - Environment variables needed
   - [ ] Code comments untuk complex logic (auth, routing)
   - [ ] API documentation (if backend added endpoints)
   - **Estimasi:** 2-3 jam

8. **Automated Tests (Optional but recommended)**
   - [ ] React Testing Library: ProtectedRoute logic
   - [ ] React Testing Library: Login/Register form validation
   - [ ] E2E with Playwright: Full happy path (landing → register → dashboard)
   - [ ] E2E: Protected route redirect flow
   - **Estimasi:** 8-12 jam (optional, dapat jadi Phase 6)

9. **Fix Bugs Found**
   - [ ] Prioritize P0/P1 bugs
   - [ ] Log P2/P3 untuk backlog
   - [ ] Re-test after fixes
   - **Estimasi:** Variable, buffer 8-12 jam

10. **Demo Preparation**
    - [ ] Prepare demo script (walthrough flow)
    - [ ] Create demo account (pre-populated data)
    - [ ] Slides atau video walkthrough (optional)
    - [ ] Collect feedback from stakeholders
    - **Estimasi:** 2-4 jam

**Testing Checklist (Comprehensive):**

**Functional:**
- [ ] All routes accessible
- [ ] Auth flow (login, register, logout) works
- [ ] Protected routes redirect correctly
- [ ] Onboarding flow completes
- [ ] Subscription tier gating works
- [ ] CTAs lead to correct destinations
- [ ] Forms validate input
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Redirect with returnUrl works

**UI/UX:**
- [ ] Layout consistent across pages
- [ ] Mobile responsive (all pages)
- [ ] No broken images/icons
- [ ] No layout shift (CLS)
- [ ] Loading states show properly
- [ ] Animations smooth (no jank)
- [ ] Text readable (contrast, size)
- [ ] Buttons/links have hover states
- [ ] Active nav item highlighted

**Compatibility:**
- [ ] Works on Chrome (latest)
- [ ] Works on Safari (latest)
- [ ] Works on Firefox (latest)
- [ ] Works on mobile Chrome (Android)
- [ ] Works on mobile Safari (iOS)
- [ ] Works on tablet (iPad, Android tablet)

**Performance:**
- [ ] Page load < 3 seconds (3G)
- [ ] Lighthouse score > 90
- [ ] No console errors/warnings
- [ ] No memory leaks (basic check)

**Security:**
- [ ] No sensitive data in localStorage (or encrypted)
- [ ] Tokens have expiry
- [ ] No XSS vulnerabilities
- [ ] HTTPS only (production)

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Focus visible
- [ ] Forms have labels
- [ ] Alt text on images
- [ ] Color contrast WCAG AA

**Total Estimasi Phase 5:** ~30-45 jam (4-6 hari kerja, termasuk bug fixes)

---

## Timeline Summary

| Phase | Scope | Estimasi | Cumulative |
|-------|-------|----------|------------|
| 1 | Landing & Router Publik | 3-4 hari | 3-4 hari |
| 2 | Autentikasi Dasar | 5-6 hari | 8-10 hari |
| 3 | Onboarding & Plan Flow | 3-4 hari | 11-14 hari |
| 4 | Navigasi & UX Konsisten | 4-5 hari | 15-19 hari |
| 5 | QA & Validasi | 4-6 hari | 19-25 hari |

**Total:** ~4-5 minggu (1 developer full-time, atau 2-3 minggu dengan 2 developers)

**Buffer:** Tambah 20% untuk unexpected issues → ~5-6 minggu total

---

## Risiko & Mitigasi

### 1. Backend API delays
**Risk:** Auth API belum ready saat frontend mau test  
**Mitigation:**
- Use mock API responses (MSW atau hardcoded)
- Define API contract early (OpenAPI spec)
- Frontend bisa develop parallel dengan backend

### 2. Ketidakkonsistenan translasi
**Risk:** Missing translations, inconsistent terminology  
**Mitigation:**
- Centralize semua strings di `locales/*`
- Run audit: check missing keys
- Use TypeScript untuk i18n (type-safe keys)

### 3. Auth state synchronization
**Risk:** State tidak sync antara tabs, atau race condition  
**Mitigation:**
- Use `storage` event listener untuk sync antar tabs
- Implement proper loading states
- Use optimistic UI updates dengan rollback

### 4. Mobile UX complexity
**Risk:** Layout breaks di edge case devices  
**Mitigation:**
- Test early on real devices (not just emulator)
- Use CSS Grid/Flexbox yang robust
- Use Tailwind responsive breakpoints consistently

### 5. Scope creep
**Risk:** Stakeholder minta tambahan feature mid-development  
**Mitigation:**
- Lock scope per phase, log extra requests untuk next phase
- Prioritize ruthlessly (must-have vs nice-to-have)
- Time-box tasks, move to backlog jika overrun

### 6. Performance regression
**Risk:** Tambahan code bikin bundle size membengkak  
**Mitigation:**
- Monitor bundle size dengan `vite-bundle-visualizer`
- Code-split routes
- Lazy load heavy components (charts, modals)
- Run Lighthouse di CI/CD

---

## Success Criteria

**Phase 1:**
- ✅ Landing page live di `/`
- ✅ Route structure clear (public vs protected)
- ✅ Mobile responsive

**Phase 2:**
- ✅ User bisa register & login
- ✅ Session persists (with remember me)
- ✅ Protected routes redirect ke login
- ✅ No major bugs

**Phase 3:**
- ✅ Onboarding flow completes
- ✅ Plan selection works (free & paid)
- ✅ User tidak bingung (clear CTAs)

**Phase 4:**
- ✅ Navigation intuitive (desktop & mobile)
- ✅ No broken links
- ✅ Consistent design language
- ✅ Feature gating works (premium features locked for free users)

**Phase 5:**
- ✅ No P0/P1 bugs
- ✅ Lighthouse score > 85
- ✅ Works on major browsers & devices
- ✅ Stakeholder sign-off

---

## Next Steps - Getting Started

### Week 1: Phase 1 Kickoff
1. ✅ Review this document dengan team
2. ✅ Assign tasks (split jika >1 developer)
3. ✅ Setup branch: `feature/navigation-redesign`
4. ✅ Start dengan LandingPage component
5. ✅ Daily standup untuk track progress

### Week 2: Phase 2 Start
1. ✅ Complete Phase 1
2. ✅ Demo Phase 1 ke stakeholders
3. ✅ Start AuthContext & LoginPage
4. ✅ Backend: setup /api/auth/* endpoints (parallel)

### Week 3: Phase 2-3
1. ✅ Complete Auth flow
2. ✅ Start Onboarding flow
3. ✅ Integration testing

### Week 4: Phase 4-5
1. ✅ Polish navigation
2. ✅ Start QA
3. ✅ Fix bugs
4. ✅ Final demo

### Week 5: Buffer & Launch
1. ✅ Final testing
2. ✅ Deploy to staging
3. ✅ Stakeholder approval
4. ✅ Deploy to production
5. ✅ Monitor for issues

---

## Appendix

### Tech Stack Reference
- **Router:** React Router v6
- **State:** React Context API (auth), Zustand (optional for other state)
- **Forms:** React Hook Form + Zod validation (recommended)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **i18n:** react-i18next
- **Analytics:** Google Analytics 4 + Mixpanel (optional)
- **Testing:** React Testing Library + Playwright (E2E, optional)

### File Structure
```
src/
├── components/
│   ├── layouts/
│   │   ├── PublicLayout.tsx
│   │   ├── AppShell.tsx
│   │   └── OnboardingLayout.tsx
│   ├── ProtectedRoute.tsx
│   ├── AppSidebar.tsx
│   ├── AppBottomNav.tsx (mobile)
│   ├── Breadcrumbs.tsx
│   ├── FeatureLockedModal.tsx
│   └── ...
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── Pricing.tsx (existing, update CTAs)
│   ├── TermsOfService.tsx (existing)
│   ├── PrivacyPolicy.tsx (existing)
│   ├── app/
│   │   ├── DashboardPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── PortfolioPage.tsx
│   │   ├── SignalsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ProfilePage.tsx
│   ├── onboarding/
│   │   ├── WelcomeStep.tsx
│   │   ├── PlanSelectionStep.tsx
│   │   └── ProfileSetupStep.tsx
│   └── payment/
│       ├── CheckoutPage.tsx
│       ├── PaymentSuccessPage.tsx
│       └── PaymentFailedPage.tsx
├── lib/
│   ├── auth.ts (AuthService, existing)
│   ├── auth-context.tsx (NEW - AuthProvider & useAuth)
│   ├── analytics.ts (NEW)
│   ├── pricing.ts (existing)
│   └── ...
└── main.tsx (router setup)
```

### Resources
- [React Router v6 Docs](https://reactrouter.com/en/main)
- [React Context Best Practices](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- [Mermaid Diagram Syntax](https://mermaid.js.org/)
- [Google Analytics 4 Events](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Document Version:** 2.0 (Complete Reference)  
**Last Updated:** 2025-11-12  
**Prepared By:** Droid AI  
**Status:** Ready for Implementation

---

**Questions?** Ping team lead atau raise di standup.  
**Ready to start?** Checkout Phase 1 tasks dan mulai coding! 🚀
