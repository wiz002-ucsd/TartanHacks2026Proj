import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import syllabusRouter from './routes/syllabus';
import coursesRouter from './routes/courses';
import quizzesRouter from './routes/quizzes';
import strategyRouter from './routes/strategy';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: set FRONTEND_URL in production to restrict origins
const corsOrigin: string | boolean = process.env.FRONTEND_URL || true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/syllabus', syllabusRouter);
app.use('/api', coursesRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/strategy', strategyRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
