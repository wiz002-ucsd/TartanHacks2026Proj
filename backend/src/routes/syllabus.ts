import { Router, Request, Response } from 'express';
import multer from 'multer';
import { extractSyllabusData } from '../services/llm';
import { storeSyllabusData } from '../services/database';
import { extractTextFromPDF, isPDF } from '../services/pdf';

const router = Router();

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF and text files
    if (isPDF(file.mimetype, file.originalname) || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  },
});

/**
 * POST /api/upload-syllabus
 *
 * Accepts syllabus as PDF file OR raw text, extracts structured data via LLM,
 * validates it, and stores it in Supabase.
 *
 * Two ways to use this endpoint:
 *
 * 1. File upload (multipart/form-data):
 *    - Field name: "file"
 *    - Accepted types: PDF, TXT
 *
 * 2. Text input (application/json):
 *    - Body: { "syllabusText": "string" }
 *
 * Response:
 * {
 *   "success": true,
 *   "courseId": number,
 *   "message": "string",
 *   "data": {
 *     "courseName": "string",
 *     "courseCode": "string",
 *     "term": "string",
 *     "eventsCount": number
 *   },
 *   "extractedData": { ... full syllabus data ... }
 * }
 */
router.post('/upload-syllabus', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let syllabusText: string;

    // Determine input source: file upload or text body
    if (req.file) {
      console.log(`📎 Received file: ${req.file.originalname} (${req.file.size} bytes)`);

      // Extract text from PDF
      if (isPDF(req.file.mimetype, req.file.originalname)) {
        console.log('📄 Extracting text from PDF...');
        syllabusText = await extractTextFromPDF(req.file.buffer);
      } else {
        // Text file
        syllabusText = req.file.buffer.toString('utf-8');
      }
    } else {
      // No file uploaded, check for text in body
      const { syllabusText: bodyText } = req.body;

      if (!bodyText || typeof bodyText !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing syllabus data. Provide either a file upload or syllabusText in request body',
        });
      }

      syllabusText = bodyText;
      console.log('📝 Received syllabus text from request body');
    }

    // Validate text length
    if (syllabusText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Syllabus text is too short (minimum 50 characters)',
      });
    }

    console.log(`📄 Processing syllabus text (${syllabusText.length} characters)`);

    // Step 1: Extract structured data using LLM
    console.log('🤖 Calling OpenAI for structured extraction...');
    const extractedData = await extractSyllabusData(syllabusText);

    // Step 2: Store in Supabase (data is already validated by Zod in extractSyllabusData)
    console.log('💾 Storing data in Supabase...');
    const courseId = await storeSyllabusData(extractedData);

    // Step 3: Return success response with full extracted data
    return res.status(201).json({
      success: true,
      courseId,
      message: `Successfully processed syllabus for ${extractedData.course.code}: ${extractedData.course.name}`,
      data: {
        courseName: extractedData.course.name,
        courseCode: extractedData.course.code,
        term: extractedData.course.term,
        units: extractedData.course.units,
        eventsCount: extractedData.events.length,
      },
      extractedData, // Include full extracted data for summary display
    });

  } catch (error) {
    console.error('❌ Error processing syllabus:', error);

    // Handle different error types
    if (error instanceof Error) {
      // Multer file size error
      if (error.message.includes('File too large')) {
        return res.status(413).json({
          success: false,
          error: 'File too large. Maximum size is 10MB',
        });
      }

      // Check if it's a validation error (Zod)
      if (error.name === 'ZodError') {
        return res.status(422).json({
          success: false,
          error: 'Validation failed: LLM output does not match expected schema',
          details: error.message,
        });
      }

      // Generic error response
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Unknown error
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
});

export default router;
