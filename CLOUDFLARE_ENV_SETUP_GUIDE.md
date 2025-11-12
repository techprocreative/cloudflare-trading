# 🔧 Cloudflare Environment Variables Setup Guide

**Date:** 12 November 2025  
**Status:** STEP-BY-STEP GUIDE  
**Priority:** HIGH

---

## 🤔 Masalah yang Anda Alami

**Yang Anda lihat di Cloudflare Dashboard:**
```json
"CF_AI_BASE_URL": "https://openrouter.ai/api/v1",
"CF_AI_API_KEY": "$OPENROUTER_API_KEY",
"OPENROUTER_API_KEY": "$OPENROUTER_API_KEY",
"SERPAPI_KEY": "$SERPAPI_KEY"
```

**Pertanyaan:**
> "Saya dimana harus memasukkan API key OpenRouter? Apakah saya mengganti yang ada di variable secret ini? Karena saya lihat value yang ada disini ambil dari wrangler.jsonc"

---

## ✅ PENJELASAN PENTING

### 1. **wrangler.jsonc ≠ Cloudflare Dashboard**

**wrangler.jsonc** hanya mendefinisikan **STRUKTUR** variables, BUKAN VALUES:
```jsonc
// wrangler.jsonc
{
  "vars": {
    "CF_AI_BASE_URL": "https://openrouter.ai/api/v1",
    "CF_AI_API_KEY": "$OPENROUTER_API_KEY",  // ← Ini BUKAN value!
    "OPENROUTER_API_KEY": "$OPENROUTER_API_KEY",  // ← Ini reference!
    "SERPAPI_KEY": "$SERPAPI_KEY"
  }
}
```

**Arti `$VARIABLE_NAME`:**
- `$OPENROUTER_API_KEY` artinya: "Ambil value dari environment variable bernama `OPENROUTER_API_KEY`"
- Ini REFERENCE, bukan actual API key
- Actual API key harus di-set di Cloudflare Dashboard

---

## 🎯 DUA CARA SET ENVIRONMENT VARIABLES

### Cara 1: Variables (Public, Visible)
- Bisa dilihat oleh siapa saja yang akses dashboard
- ⚠️ **TIDAK AMAN** untuk API keys
- Cocok untuk: URLs, config values

### Cara 2: Secrets (Hidden, Encrypted)
- Encrypted dan hidden
- ✅ **AMAN** untuk API keys
- Tidak bisa dilihat setelah di-set
- **RECOMMENDED** untuk sensitive data

---

## 📝 STEP-BY-STEP: Set OpenRouter API Key

### ❌ YANG SALAH (Jangan dilakukan):

Di Cloudflare Dashboard, jika value variable adalah:
```
OPENROUTER_API_KEY = "$OPENROUTER_API_KEY"
```
**Ini SALAH!** Value-nya cuma reference, bukan actual key.

---

### ✅ CARA YANG BENAR:

## Option 1: Via Cloudflare Pages Dashboard (Recommended)

### Step 1: Buka Project Settings
1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih project: **nusanexus-trading**
3. Klik tab **Settings**
4. Scroll ke **Environment Variables**

### Step 2: Identifikasi Current Variables

Anda akan melihat sesuatu seperti ini:

| Name | Value | Type |
|------|-------|------|
| CF_AI_BASE_URL | https://openrouter.ai/api/v1 | Variable |
| CF_AI_API_KEY | $OPENROUTER_API_KEY | Variable |
| OPENROUTER_API_KEY | $OPENROUTER_API_KEY | Variable |
| SERPAPI_KEY | $SERPAPI_KEY | Variable |

### Step 3: Fix Variables

**Untuk `CF_AI_BASE_URL`:**
- ✅ Sudah benar, tidak perlu diubah
- Value: `https://openrouter.ai/api/v1`

**Untuk `OPENROUTER_API_KEY`:**

#### A. Delete Variable yang Salah:
1. Click **Edit** pada variable `OPENROUTER_API_KEY`
2. Click **Delete**
3. Confirm deletion

#### B. Create Secret Baru:
1. Click **Add variable**
2. Type: Pilih **Secret** (bukan Variable)
3. Name: `OPENROUTER_API_KEY`
4. Value: `sk-or-v1-xxxxxxxxxxxxx` (actual API key Anda)
5. Environment: Pilih **Production** dan **Preview**
6. Click **Save**

**Untuk `CF_AI_API_KEY`:**
- Delete variable ini karena redundant
- Code akan menggunakan `OPENROUTER_API_KEY` directly

**Untuk `SERPAPI_KEY`:**
- Jika Anda punya SerpAPI key:
  1. Delete variable `$SERPAPI_KEY`
  2. Create secret baru dengan actual key
- Jika tidak punya, delete aja (optional feature)

---

### Step 4: Hasil Akhir

Setelah setup, Anda seharusnya punya:

**Variables (Visible):**
| Name | Value | Type |
|------|-------|------|
| CF_AI_BASE_URL | https://openrouter.ai/api/v1 | Variable |

**Secrets (Hidden):**
| Name | Type |
|------|------|
| OPENROUTER_API_KEY | Secret |
| SERPAPI_KEY (optional) | Secret |

---

## Option 2: Via Wrangler CLI

Jika Anda prefer command line:

```bash
# 1. Install wrangler (jika belum)
npm install -g wrangler

# 2. Login
wrangler login

# 3. Set secret untuk Pages
wrangler pages secret put OPENROUTER_API_KEY --project-name=nusanexus-trading

# Akan prompt untuk input API key, paste: sk-or-v1-xxxx
# API key akan encrypted dan tersimpan aman

# 4. (Optional) Set SERPAPI_KEY
wrangler pages secret put SERPAPI_KEY --project-name=nusanexus-trading
```

---

## 🔍 Cara Verifikasi Setup Sudah Benar

### 1. Check di Dashboard:
- `OPENROUTER_API_KEY` harus bertipe **Secret**
- Value-nya **tidak terlihat** (good!)
- Jika masih terlihat `$OPENROUTER_API_KEY`, berarti belum di-set

### 2. Test di Application:
```bash
# Deploy atau test local
npm run dev

# Atau check logs
wrangler pages deployment tail --project-name=nusanexus-trading
```

### 3. Check via Code (temporary):
Tambahkan log sementara di `worker/agent.ts`:
```typescript
async onStart(): Promise<void> {
  // Temporary debug log
  console.log('OpenRouter API Key exists:', !!this.env.OPENROUTER_API_KEY);
  console.log('Key length:', this.env.OPENROUTER_API_KEY?.length);
  
  this.chatHandler = new ChatHandler(
    this.env.CF_AI_BASE_URL,
    this.env.OPENROUTER_API_KEY, // ✅ Use this directly
    this.state.model,
    this.env
  );
}
```

---

## 📊 Diagram: Alur Environment Variables

```
┌─────────────────────────────────────────────────────────────┐
│                    wrangler.jsonc                           │
│  (Hanya STRUKTUR, bukan VALUES)                             │
├─────────────────────────────────────────────────────────────┤
│  "vars": {                                                  │
│    "CF_AI_BASE_URL": "https://openrouter.ai/api/v1",      │
│    "OPENROUTER_API_KEY": "$OPENROUTER_API_KEY"  ← Reference│
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
                   Mencari value dari...
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Dashboard                           │
│  (Tempat ACTUAL VALUES disimpan)                            │
├─────────────────────────────────────────────────────────────┤
│  Secrets (Encrypted):                                       │
│  ✅ OPENROUTER_API_KEY = "sk-or-v1-actual-key-here"        │
│                                                             │
│  Variables (Plain):                                         │
│  ✅ CF_AI_BASE_URL = "https://openrouter.ai/api/v1"        │
└─────────────────────────────────────────────────────────────┘
                           ↓
                   Digunakan oleh...
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Worker Runtime                             │
│  (Code berjalan dengan actual values)                       │
├─────────────────────────────────────────────────────────────┤
│  env.OPENROUTER_API_KEY = "sk-or-v1-actual-key-here"       │
│  env.CF_AI_BASE_URL = "https://openrouter.ai/api/v1"       │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Common Mistakes (Kesalahan Umum)

### ❌ SALAH:
```json
// Di Cloudflare Dashboard
OPENROUTER_API_KEY = "$OPENROUTER_API_KEY"
```
**Masalah:** Value-nya cuma string "$OPENROUTER_API_KEY", bukan actual API key.

### ✅ BENAR:
```
// Di Cloudflare Dashboard (Secret)
OPENROUTER_API_KEY = "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxx"
```
**Correct:** Actual API key dari OpenRouter.

---

## 🔐 Cara Mendapatkan OpenRouter API Key

Jika Anda belum punya:

1. **Buka:** https://openrouter.ai/
2. **Sign up** atau **Login**
3. **Go to Keys:** https://openrouter.ai/keys
4. **Create API Key:**
   - Click "Create Key"
   - Name: `NusaNexus Trading`
   - Copy key: `sk-or-v1-xxxxxxxxxxxx`
   - **Save immediately** (tidak bisa dilihat lagi setelah close)
5. **Paste ke Cloudflare** dashboard seperti step di atas

---

## 🧪 Testing

### 1. Test Local Development:

File: `.dev.vars`
```bash
# Local development environment
OPENROUTER_API_KEY=sk-or-v1-your-key-here
CF_AI_BASE_URL=https://openrouter.ai/api/v1
```

Run:
```bash
npm run dev
# atau
wrangler pages dev
```

### 2. Test Production:

After setting secrets di dashboard:
```bash
# Deploy
npm run deploy
# atau
wrangler pages deploy

# Check logs
wrangler pages deployment tail
```

### 3. Test via Browser:

1. Open app: https://your-project.pages.dev
2. Try AI chat feature
3. Check browser console for errors
4. If works → ✅ Setup correct!

---

## 📋 Checklist

Sebelum test, pastikan:

- [ ] Delete variable `OPENROUTER_API_KEY` yang value-nya `$OPENROUTER_API_KEY`
- [ ] Create **Secret** (bukan Variable) dengan nama `OPENROUTER_API_KEY`
- [ ] Paste actual API key dari OpenRouter (starts with `sk-or-v1-`)
- [ ] Apply untuk **Production** dan **Preview** environment
- [ ] Save changes
- [ ] Deploy ulang aplikasi (atau trigger redeploy)
- [ ] Test AI chat feature

---

## 🆘 Troubleshooting

### Problem 1: "API key is undefined"

**Cause:** Secret belum di-set atau nama salah

**Solution:**
```bash
# Check secret exists
wrangler pages secret list --project-name=nusanexus-trading

# Should see:
# OPENROUTER_API_KEY

# If not, set it:
wrangler pages secret put OPENROUTER_API_KEY
```

### Problem 2: "Invalid API key"

**Cause:** API key salah atau expired

**Solution:**
1. Generate new key di OpenRouter dashboard
2. Update secret di Cloudflare
3. Redeploy

### Problem 3: "Still showing $OPENROUTER_API_KEY"

**Cause:** Masih pakai Variable, bukan Secret

**Solution:**
1. Delete the Variable
2. Create Secret instead
3. Redeploy

---

## 🎯 Summary

### Yang SALAH sekarang:
```
Dashboard → Variable → OPENROUTER_API_KEY = "$OPENROUTER_API_KEY"
```
❌ Value-nya cuma reference, bukan actual key

### Yang BENAR seharusnya:
```
Dashboard → Secret → OPENROUTER_API_KEY = "sk-or-v1-xxxxx"
```
✅ Value-nya actual API key dari OpenRouter

### Cara Fix:
1. Delete variable yang salah
2. Create secret baru
3. Paste actual API key
4. Save & deploy

---

## 📚 Additional Resources

- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/platform/environment-variables/)
- [OpenRouter API Keys](https://openrouter.ai/keys)
- [Wrangler Pages Secrets](https://developers.cloudflare.com/workers/wrangler/commands/#secret)

---

**Last Updated:** 12 November 2025  
**Status:** READY TO USE  
**Next Step:** Follow the steps above to set your actual API key!
