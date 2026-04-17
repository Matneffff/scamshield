import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import { analyzeScamFlow, AnalyzeInputSchema } from './flows/analyzeScam.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ScamShield Genkit Backend', agents: 3 });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const parsed = AnalyzeInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Invalid request body', details: parsed.error.issues },
      });
    }

    const result = await analyzeScamFlow(parsed.data);
    return res.json(result);
  } catch (err) {
    console.error('[/api/analyze] error:', err);
    return res.status(500).json({
      error: { code: 'ANALYSIS_FAILED', message: 'Analysis pipeline failed. Please try again.' },
    });
  }
});

app.listen(PORT, () => {
  console.log(`ScamShield backend running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});
