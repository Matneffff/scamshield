import { z } from 'genkit';
import { ai } from '../genkit.js';

// ─── Schemas ────────────────────────────────────────────────────────────────

export const AnalyzeInputSchema = z.object({
  inputType: z.enum(['text', 'url', 'phone', 'image']),
  content: z.string().min(1),
  language: z.enum(['en', 'bm']).default('en'),
  imageBase64: z.string().optional(),
  imageMimeType: z.string().optional(),
});

export const AnalyzeOutputSchema = z.object({
  level: z.enum(['safe', 'suspicious', 'danger']),
  title: z.string(),
  scamType: z.string(),
  confidence: z.string(),
  description: z.string(),
  flags: z.array(z.string()),
  actions: z.array(
    z.object({
      step: z.union([z.number(), z.string()]),
      title: z.string(),
      desc: z.string(),
    })
  ),
  // Metadata from the pipeline
  pipeline: z.object({
    classifiedAs: z.string(),
    ragMatches: z.array(z.string()),
    agentsUsed: z.array(z.string()),
  }),
});

// ─── Agent 1: Input Classifier ───────────────────────────────────────────────
// Determines scam category + signals from raw input

const classifyInput = ai.defineTool(
  {
    name: 'classifyInput',
    description: 'Classifies the input and extracts scam signals',
    inputSchema: z.object({
      inputType: z.string(),
      content: z.string(),
      imageBase64: z.string().optional(),
      imageMimeType: z.string().optional(),
    }),
    outputSchema: z.object({
      category: z.string(),
      signals: z.array(z.string()),
      urgencyScore: z.number().min(0).max(10),
      initialRisk: z.enum(['low', 'medium', 'high']),
      imageDescription: z.string().optional(),
    }),
  },
  async ({ inputType, content, imageBase64, imageMimeType }) => {
    const jsonSchema = `Return ONLY valid JSON (no markdown):
{
  "category": "one of: macau_scam | apk_phishing | job_scam | investment_scam | love_scam | parcel_scam | bank_impersonation | lhdn_scam | pdrm_impersonation | unknown",
  "signals": ["signal1", "signal2"],
  "urgencyScore": 0-10,
  "initialRisk": "low | medium | high",
  "imageDescription": "brief description of what the screenshot shows (image inputs only)"
}`;

    let generateInput;

    if (inputType === 'image' && imageBase64) {
      // Multimodal: image + text prompt
      generateInput = {
        model: 'googleai/gemini-2.5-flash',
        messages: [{
          role: 'user' as const,
          content: [
            {
              media: {
                url: `data:${imageMimeType ?? 'image/jpeg'};base64,${imageBase64}`,
                contentType: imageMimeType ?? 'image/jpeg',
              },
            },
            {
              text: `You are Agent 1 (Input Classifier) of the ScamShield pipeline.

Analyze this screenshot for Malaysian scam signals. Look for: suspicious messages, fake websites, phishing UI, scam offers, impersonation of PDRM/BNM/MCMC, APK download prompts, urgency tactics, requests for money or personal info.

${jsonSchema}`,
            },
          ],
        }],
      };
    } else {
      generateInput = {
        model: 'googleai/gemini-2.5-flash' as const,
        prompt: `You are Agent 1 (Input Classifier) of the ScamShield pipeline.

Analyze this ${inputType} input for Malaysian scam signals.

Input: "${content}"

${jsonSchema}`,
      };
    }

    const { text } = await ai.generate(generateInput);
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  }
);

// ─── Agent 2: Scam Pattern Matcher ───────────────────────────────────────────
// Cross-references known Malaysian scam patterns (RAG stub — replace with Vertex AI Search)

const matchScamPatterns = ai.defineTool(
  {
    name: 'matchScamPatterns',
    description: 'Matches input against known Malaysian scam patterns database',
    inputSchema: z.object({
      category: z.string(),
      signals: z.array(z.string()),
      content: z.string(),
    }),
    outputSchema: z.object({
      matches: z.array(z.string()),
      confidence: z.number().min(0).max(100),
      knownPatternHit: z.boolean(),
    }),
  },
  async ({ category, signals, content }) => {
    // TODO: Replace with Vertex AI Search RAG query against PDRM/BNM/MCMC corpus
    // const results = await vertexAiSearch.query({ datastore: DATASTORE_ID, query: content });

    const prompt = `You are Agent 2 (Scam Pattern Matcher) of the ScamShield pipeline.

You have access to Malaysian scam pattern databases from PDRM, BNM, and MCMC.

Category detected: ${category}
Signals found: ${signals.join(', ')}
Original input: "${content}"

Known Malaysian scam patterns to cross-reference:
- Macau Scam: PDRM/BNM impersonation, frozen account threats, urgent transfer to "safe" account
- APK Phishing: PosLaju/customs fake SMS, APK download link, parcel tracking scam
- Job Scam: part-time job offer, RM/day commission, upfront registration fee
- Investment Scam: guaranteed high returns, crypto/forex, "exclusive" group
- Love Scam: online relationship, financial emergency, overseas partner
- LHDN Scam: tax arrears, immediate payment or arrest
- Bank Impersonation: account suspended, verify OTP, call "bank officer"

Return ONLY valid JSON (no markdown):
{
  "matches": ["pattern match 1", "pattern match 2"],
  "confidence": 0-100,
  "knownPatternHit": true | false
}`;

    const { text } = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt });
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  }
);

// ─── Agent 3: Response Generator ─────────────────────────────────────────────
// Combines classifier + matcher results into structured verdict card

const generateVerdict = ai.defineTool(
  {
    name: 'generateVerdict',
    description: 'Generates the final structured verdict card and action guide',
    inputSchema: z.object({
      category: z.string(),
      signals: z.array(z.string()),
      matches: z.array(z.string()),
      confidence: z.number(),
      initialRisk: z.string(),
      content: z.string(),
      language: z.string(),
    }),
    outputSchema: z.object({
      level: z.enum(['safe', 'suspicious', 'danger']),
      title: z.string(),
      scamType: z.string(),
      confidence: z.string(),
      description: z.string(),
      flags: z.array(z.string()),
      actions: z.array(
        z.object({
          step: z.union([z.number(), z.string()]),
          title: z.string(),
          desc: z.string(),
        })
      ),
    }),
  },
  async ({ category, signals, matches, confidence, initialRisk, content, language }) => {
    const isBM = language === 'bm';
    const prompt = `You are Agent 3 (Response Generator) of the ScamShield pipeline.

Pipeline results:
- Category: ${category}
- Risk signals: ${signals.join(', ')}
- Pattern matches: ${matches.join(', ')}
- Confidence score: ${confidence}%
- Initial risk: ${initialRisk}
- Original input: "${content}"

Generate a final verdict card ${isBM ? 'in Bahasa Malaysia' : 'in English'}.

Rules:
- level "danger" → high confidence (>70%) or clear scam pattern hit → 3 actions, last action MUST mention NSRC 997
- level "suspicious" → medium confidence (40-70%) or some signals → 2 actions
- level "safe" → no pattern match, low confidence (<40%) → 1 action with step "✓"

Return ONLY valid JSON (no markdown):
{
  "level": "safe | suspicious | danger",
  "title": "VERDICT IN ALL CAPS (4-6 words)",
  "scamType": "Human-readable scam type or 'None Detected'",
  "confidence": "e.g. 94%",
  "description": "2 sentences specific to this input.",
  "flags": ["specific flag 1", "specific flag 2"],
  "actions": [
    { "step": 1, "title": "Action title.", "desc": "Action detail." }
  ]
}`;

    const { text } = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt });
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  }
);

// ─── Main Flow ────────────────────────────────────────────────────────────────

export const analyzeScamFlow = ai.defineFlow(
  {
    name: 'analyzeScam',
    inputSchema: AnalyzeInputSchema,
    outputSchema: AnalyzeOutputSchema,
  },
  async ({ inputType, content, language, imageBase64, imageMimeType }) => {
    // Agent 1 — Classify (multimodal for images)
    const classification = await classifyInput({ inputType, content, imageBase64, imageMimeType });

    // Use image description for downstream agents if available
    const textContent = classification.imageDescription
      ? `[Screenshot: ${classification.imageDescription}]`
      : content;

    // Agent 2 — Match patterns
    const patternMatch = await matchScamPatterns({
      category: classification.category,
      signals: classification.signals,
      content: textContent,
    });

    // Agent 3 — Generate verdict
    const verdict = await generateVerdict({
      category: classification.category,
      signals: classification.signals,
      matches: patternMatch.matches,
      confidence: patternMatch.confidence,
      initialRisk: classification.initialRisk,
      content: textContent,
      language,
    });

    return {
      ...verdict,
      pipeline: {
        classifiedAs: classification.category,
        ragMatches: patternMatch.matches,
        agentsUsed: ['Input Classifier', 'Scam Pattern Matcher', 'Response Generator'],
      },
    };
  }
);
