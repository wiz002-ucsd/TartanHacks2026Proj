import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import syllabusRouter from './routes/syllabus';
import coursesRouter from './routes/courses';
import aiAdvisorRouter from './routes/ai-advisor';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies (increase limit for large syllabi)
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', syllabusRouter);
app.use('/api', coursesRouter);
app.use('/api', aiAdvisorRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ API endpoint: http://localhost:${PORT}/api/upload-syllabus`);
});
