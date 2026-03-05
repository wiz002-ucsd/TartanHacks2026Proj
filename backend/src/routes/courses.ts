import { Router, Request, Response } from 'express';
import { getAllCoursesForUser, getCourseWithTopics, getMasteryForUser, deleteCourse, DEV_USER_ID } from '../services/database';

const router = Router();

/** GET /api/courses — all courses for the current user with deadlines */
router.get('/courses', async (_req: Request, res: Response) => {
  try {
    const courses = await getAllCoursesForUser(DEV_USER_ID);
    return res.status(200).json({ success: true, courses, count: courses?.length ?? 0 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
});

/** GET /api/courses/:id — single course with topics + mastery + deadlines */
router.get('/courses/:id', async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.id, 10);
  if (isNaN(courseId)) {
    return res.status(400).json({ success: false, error: 'Invalid course ID' });
  }
  try {
    const [course, masteryRows] = await Promise.all([
      getCourseWithTopics(courseId),
      getMasteryForUser(DEV_USER_ID),
    ]);
    const masteryMap = new Map(masteryRows.map((m) => [m.global_topic_id, m.mastery_score as number]));
    const courseWithMastery = {
      ...course,
      course_topics: (course?.course_topics ?? []).map((t: { global_topic_id: number; [key: string]: unknown }) => ({
        ...t,
        mastery_score: masteryMap.get(t.global_topic_id) ?? 0,
      })),
    };
    return res.status(200).json({ success: true, course: courseWithMastery });
  } catch (error) {
    console.error('Error fetching course:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
});

/** DELETE /api/courses/:id — delete course + cascade */
router.delete('/courses/:id', async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.id, 10);
  if (isNaN(courseId)) {
    return res.status(400).json({ success: false, error: 'Invalid course ID' });
  }
  try {
    await deleteCourse(courseId);
    return res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
});

export default router;
