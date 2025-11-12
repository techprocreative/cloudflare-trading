# ⚡ QUICK FIX: Set OpenRouter API Key

**5 Minutes Setup** ⏱️

---

## 🎯 Problem

Anda lihat di Cloudflare Dashboard:
```
OPENROUTER_API_KEY = "$OPENROUTER_API_KEY"
```

❌ **Ini SALAH!** Value-nya cuma reference, bukan actual key.

---

## ✅ Solution (Pilih salah satu)

### Option A: Via Cloudflare Dashboard (Easier)

1. **Buka:** https://dash.cloudflare.com
2. **Pilih project:** nusanexus-trading
3. **Go to:** Settings → Environment Variables
4. **Delete variable:** `OPENROUTER_API_KEY` yang value-nya `$OPENROUTER_API_KEY`
5. **Click:** "Add variable"
6. **Set:**
   - Type: **Secret** (bukan Variable!)
   - Name: `OPENROUTER_API_KEY`
   - Value: `sk-or-v1-xxxxxxxxxxxxx` (paste actual key dari OpenRouter)
   - Environment: Production & Preview
7. **Click:** Save
8. **Redeploy** aplikasi (atau wait for auto-deploy)

---

### Option B: Via Command Line (Faster)

```bash
# 1. Login
wrangler login

# 2. Set secret
wrangler pages secret put OPENROUTER_API_KEY --project-name=nusanexus-trading

# 3. Paste actual key when prompted:
# sk-or-v1-xxxxxxxxxxxxx

# 4. Done! Auto-apply on next deployment
```

---

## 🔐 Cara Dapat OpenRouter API Key

1. **Buka:** https://openrouter.ai/keys
2. **Login** atau Sign up
3. **Click:** "Create Key"
4. **Copy:** `sk-or-v1-xxxxxxxxxxxxx`
5. **Save immediately!** (tidak bisa dilihat lagi)

---

## ✅ Verify Setup Benar

### Check Dashboard:
- `OPENROUTER_API_KEY` bertipe **Secret** ✅
- Value **tidak terlihat** (hidden) ✅
- Jika masih terlihat `$OPENROUTER_API_KEY` → belum benar ❌

### Test Application:
1. Deploy/redeploy
2. Open app
3. Try AI chat
4. If works → ✅ Done!

---

## 📊 Before vs After

### ❌ BEFORE (WRONG):
```
Dashboard → Variables
├─ OPENROUTER_API_KEY = "$OPENROUTER_API_KEY"  ← Reference only
└─ CF_AI_API_KEY = "$OPENROUTER_API_KEY"       ← Redundant
```

### ✅ AFTER (CORRECT):
```
Dashboard → Variables
└─ CF_AI_BASE_URL = "https://openrouter.ai/api/v1"

Dashboard → Secrets
└─ OPENROUTER_API_KEY = "sk-or-v1-xxxx"  ← Actual key (hidden)
```

---

## 🆘 Still Not Working?

Check `CLOUDFLARE_ENV_SETUP_GUIDE.md` untuk detailed guide.

---

**Time needed:** 5 minutes  
**Difficulty:** Easy  
**Cost:** Free (OpenRouter has free tier)
