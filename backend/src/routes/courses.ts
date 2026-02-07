import { Router, Request, Response } from 'express';
import { getAllCoursesWithUpcomingDeadlines } from '../services/database';

const router = Router();

/**
 * GET /api/courses
 *
 * Retrieves all courses with their next upcoming deadline
 *
 * Response:
 * {
 *   "success": true,
 *   "courses": [
 *     {
 *       "id": 1,
 *       "name": "Introduction to Computer Science",
 *       "code": "CS101",
 *       "term": "Fall 2024",
 *       "nextDeadline": {
 *         "name": "Homework 1",
 *         "type": "homework",
 *         "dueDate": "2024-09-15",
 *         "releaseDate": "2024-09-08"
 *       }
 *     }
 *   ]
 * }
 */
router.get('/courses', async (req: Request, res: Response) => {
  try {
    console.log('📚 Fetching all courses with upcoming deadlines...');

    const courses = await getAllCoursesWithUpcomingDeadlines();

    console.log(`✓ Found ${courses.length} courses`);

    return res.status(200).json({
      success: true,
      courses,
      count: courses.length,
    });

  } catch (error) {
    console.error('❌ Error fetching courses:', error);

    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
});

export default router;
