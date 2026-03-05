import { Router, Request, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { extractSyllabus } from '../services/syllabusExtractor';
import { normalizeTopics } from '../services/topicNormalization';
import { createCourse, insertCourseTopics, insertDeadlines, DEV_USER_ID } from '../services/database';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    const isTxt = file.mimetype === 'text/plain' || file.originalname.toLowerCase().endsWith('.txt');
    if (isPdf || isTxt) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  },
});

/**
 * POST /api/syllabus/upload
 *
 * Accepts syllabus as multipart PDF/TXT file OR JSON { syllabusText: string }.
 * Extracts structured data, normalizes topics globally, stores everything in DB.
 *
 * Response: { success, courseId, course_name, topic_count, deadline_count }
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let syllabusText: string;

    if (req.file) {
      const isPdf = req.file.mimetype === 'application/pdf' ||
        req.file.originalname.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        const pdfData = await pdfParse(req.file.buffer);
        syllabusText = pdfData.text.trim();
      } else {
        syllabusText = req.file.buffer.toString('utf-8');
      }
    } else {
      const { syllabusText: bodyText } = req.body;
      if (!bodyText || typeof bodyText !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Provide either a file upload or syllabusText in the request body',
        });
      }
      syllabusText = bodyText;
    }

    if (syllabusText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Syllabus text is too short (minimum 50 characters)',
      });
    }

    // 1. Extract structured data via OpenAI
    const extraction = await extractSyllabus(syllabusText);

    // 2. Create course record
    const courseId = await createCourse(
      DEV_USER_ID,
      extraction.course_name,
      extraction.course_code ?? null,
      extraction.semester ?? 'Unknown Semester'
    );

    // 3. Normalize topics against global topic graph
    const normalizedTopics = await normalizeTopics(extraction.topics);

    // 4. Deduplicate by global_topic_id (two syllabus topics may map to the same canonical topic)
    const seen = new Set<number>();
    const uniqueTopics = normalizedTopics.filter((t) => {
      if (seen.has(t.global_topic_id)) return false;
      seen.add(t.global_topic_id);
      return true;
    });

    // 5. Link topics to course
    await insertCourseTopics(courseId, uniqueTopics);

    // 5. Insert deadlines
    await insertDeadlines(courseId, extraction.deadlines);

    return res.status(201).json({
      success: true,
      courseId,
      course_name: extraction.course_name,
      topic_count: uniqueTopics.length,
      deadline_count: extraction.deadlines.length,
    });

  } catch (error) {
    console.error('Error processing syllabus:', error);
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        return res.status(413).json({ success: false, error: 'File too large. Max 10MB.' });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: 'Unexpected error' });
  }
});

export default router;
