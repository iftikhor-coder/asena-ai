# 🤖 ASENA AI — O'rnatish Qo'llanmasi

Groq API bilan ishlaydigan ko'p tilli AI chatbot. ChatGPT uslubidagi interfeys.

## ✨ Xususiyatlar (Bosqich 1)

- ⚡ Groq API orqali ultra-tez javoblar (Llama 3.3 70B)
- 🌍 Har qanday tilda gapiradi (O'zbek, English, Русский, العربية...)
- 🎙 Ovozli kirish (Web Speech API)
- 📡 Real-time streaming javoblar
- 🎨 Dark, premium dizayn
- 📱 Mobil qurilmalarga moslashgan

## 🚀 Ishga tushirish

### 1. Groq API kalitini oling (BEPUL)
[console.groq.com](https://console.groq.com) → Sign Up → API Keys → Create key

### 2. O'rnating

```bash
# Loyihani klonlang
git clone https://github.com/sizning-username/asena-ai.git
cd asena-ai

# Paketlarni o'rnating
npm install

# Environment faylini yarating
cp .env.example .env.local

# .env.local ni oching va API kalitni kiriting:
# GROQ_API_KEY=gsk_...
```

### 3. Ishga tushiring

```bash
npm run dev
# → http://localhost:3000
```

## 🌐 Vercel ga deploy qilish

```bash
# Vercel CLI o'rnating
npm i -g vercel

# Deploy qiling
vercel

# Environment variable qo'shing
vercel env add GROQ_API_KEY
```

Yoki [vercel.com](https://vercel.com) → Import Project → Environment Variables ga `GROQ_API_KEY` qo'shing.

## 📂 Portfolio bilan integratsiya

`portfolio-button.tsx` faylini `iftikhor.vercel.app` portfolio loyihasiga qo'shing:

```tsx
// app/layout.tsx yoki app/page.tsx
import AsenaAIButton from '@/components/AsenaAIButton'

// JSX ichida:
<AsenaAIButton />
```

`ASENA_AI_URL` ni o'zingizning deploy qilingan URL ga o'zgartiring.

## 🗺 Keyingi bosqichlar

| Bosqich | Xususiyat |
|---------|-----------|
| Bosqich 2 | Google OAuth + suhbat tarixi (Supabase) |
| Bosqich 3 | Fayl yuklash + rasm tahlili |
| Bosqich 4 | Rasm generatsiya (Pollinations.ai) |

## 🛠 Texnologiyalar

- **Framework**: Next.js 14 (App Router)
- **AI**: Groq SDK (Llama 3.3 70B)
- **Styling**: Tailwind CSS
- **Fonts**: Syne + Plus Jakarta Sans
- **Deploy**: Vercel

---

Muammo bo'lsa: nayimoviftikhor19921992@gmail.com
