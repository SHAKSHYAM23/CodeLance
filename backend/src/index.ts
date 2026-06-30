import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { register } from './lib/metrics';
import logger from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import authRouter     from './routes/auth';
import documentRouter from './routes/document';
import chatRouter     from './routes/chat';

// Import workers so they start listening on boot
import './workers/ingestion.worker';
import './workers/embedding.worker';

const app  = express();
const PORT = parseInt(process.env.PORT || '8000');

// ── Security middleware ──────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Required for cookies to work cross-origin
  methods:     ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Parsing middleware ───────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Passport (no session — stateless JWT via cookie) ────────────
app.use(passport.initialize());

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/document', documentRouter);
app.use('/api/chat',     chatRouter);

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
  });
});


app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// ── Global error handler (must be last) ─────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`CodeAtlas backend running`, {
    port:     PORT,
    env:      process.env.NODE_ENV,
    frontend: process.env.FRONTEND_URL,
  });
});

export default app;