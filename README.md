# ScamShield

> Protecting Malaysians from digital scams, one message at a time.

Built for **PROJECT 2030 — MyAI Future Hackathon** by **GDG On Campus UTM**.  
**Team**: HyperArc | **Track**: 5 — Secure Digital (FinTech & Security)

---

## What It Does

Paste a suspicious message, link, phone number, or screenshot — ScamShield's AI analyzes it in seconds and returns:

- **Risk verdict**: Safe / Suspicious / High Risk
- **Scam type**: Macau Scam, APK Phishing, Job Scam, Investment Scam, etc.
- **Confidence score** + specific red flags detected
- **Step-by-step action guide** (including NSRC hotline 997)
- **Bilingual**: English & Bahasa Malaysia

No account required. Mobile-first. Zero friction.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 19 + TypeScript + Tailwind CSS v4 |
| AI Engine | Gemini 2.0 Flash (`@google/genai`) |
| Orchestration | Firebase Genkit (3-agent pipeline — coming) |
| Knowledge Base | Vertex AI Search RAG — PDRM, BNM, MCMC data |
| Database | Firestore — scam logs + analytics |
| Deployment | Cloud Run |

---

## AI Architecture

```
User Input (text / URL / phone / screenshot)
        │
        ▼
Agent 1 — Input Classifier     (Gemini 2.0 Flash)
        │   Determines scam category
        ▼
Agent 2 — Scam Pattern Matcher (Vertex AI Search RAG)
        │   Cross-references PDRM, BNM, MCMC databases
        ▼
Agent 3 — Response Generator   (Gemini 2.0 Flash)
        │   Structured verdict + personalized action guide
        ▼
Verdict Card → Firestore log → Dashboard analytics
```

> AI code generated with assistance from Claude (Anthropic). All AI outputs reviewed and tested.

---

## Run Locally

**Prerequisites**: Node.js 18+, Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

```bash
# 1. Clone
git clone https://github.com/Matneffff/scamshield.git
cd scamshield

# 2. Install
npm install

# 3. Set API key
cp .env.example .env
# Edit .env and set GEMINI_API_KEY="your-key-here"

# 4. Run
npm run dev
# → http://localhost:3000
```

---

## Features

- [x] Text / URL / Phone Number / Screenshot input tabs
- [x] Real Gemini 2.0 Flash AI analysis (Malaysian scam context)
- [x] Bilingual EN / BM interface
- [x] Scam Trend Dashboard (analytics overview)
- [x] Anonymous community scam reporting
- [ ] Genkit 3-agent pipeline
- [ ] Vertex AI Search RAG (PDRM + BNM + MCMC data)
- [ ] Cloud Run deployment

---

## Malaysian Scam Context

ScamShield is trained to detect scams common in Malaysia:
- **Macau Scam** — impersonating PDRM/BNM, demanding urgent transfers
- **APK Phishing** — fake delivery SMS with malicious APK download
- **Job Scam** — fake part-time jobs requiring upfront "registration fees"
- **Investment Scam** — too-good-to-be-true returns, Ponzi schemes
- **Love Scam** — long-term emotional manipulation for money
- **LHDN/PDRM Impersonation** — fake tax/police notices

**Report scams**: NSRC hotline **997** | [PDRM](https://pdrm.gov.my) | [BNM](https://bnm.gov.my) | [MCMC](https://mcmc.gov.my)

---

## Team HyperArc

PROJECT 2030 — MyAI Future Hackathon | GDG On Campus UTM | April 2026
