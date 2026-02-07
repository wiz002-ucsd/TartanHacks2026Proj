import { Router, Request, Response } from 'express';
import { getAllCoursesWithUpcomingDeadlines, getCourseData } from '../services/database';

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

/**
 * GET /api/courses/:id
 *
 * Retrieves detailed course information by ID
 *
 * Response:
 * {
 *   "success": true,
 *   "course": {
 *     "id": 1,
 *     "name": "...",
 *     "code": "...",
 *     "term": "...",
 *     "units": 3,
 *     "grading_policies": {...},
 *     "events": [...],
 *     "course_policies": {...}
 *   }
 * }
 */
router.get('/courses/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid course ID',
      });
    }

    console.log(`📚 Fetching course details for ID: ${courseId}`);

    const course = await getCourseData(courseId);

    console.log(`✓ Retrieved course: ${course.code}`);

    return res.status(200).json({
      success: true,
      course,
    });

  } catch (error) {
    console.error('❌ Error fetching course:', error);

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

/**
 * DELETE /api/courses/:id
 *
 * Deletes a course and all related data (CASCADE)
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Course deleted successfully"
 * }
 */
router.delete('/courses/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid course ID',
      });
    }

    console.log(`🗑️  Deleting course with ID: ${courseId}`);

    // Import supabase client
    const { supabase } = await import('../services/database');

    // Delete the course (CASCADE will handle related records)
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('❌ Error deleting course:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log(`✓ Successfully deleted course ${courseId}`);

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });

  } catch (error) {
    console.error('❌ Error deleting course:', error);

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
