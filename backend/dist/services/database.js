"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.storeSyllabusData = storeSyllabusData;
exports.getCourseData = getCourseData;
exports.getAllCoursesWithUpcomingDeadlines = getAllCoursesWithUpcomingDeadlines;
require("dotenv/config"); // Load environment variables first
const supabase_js_1 = require("@supabase/supabase-js");
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
/**
 * Stores validated syllabus data into Supabase database
 *
 * This function performs a transactional insert across 4 tables:
 * 1. courses
 * 2. grading_policies
 * 3. events (multiple rows)
 * 4. course_policies
 *
 * @param data - Validated syllabus data from LLM
 * @returns The created course ID
 * @throws Error if any database operation fails
 */
async function storeSyllabusData(data) {
    try {
        // Step 1: Insert course record
        const { data: courseData, error: courseError } = await exports.supabase
            .from('courses')
            .insert({
            name: data.course.name,
            code: data.course.code,
            term: data.course.term,
            units: data.course.units,
        })
            .select('id')
            .single();
        if (courseError || !courseData) {
            console.error('Failed to insert course:', courseError);
            throw new Error(`Database error: ${courseError?.message || 'Unknown error'}`);
        }
        const courseId = courseData.id;
        console.log(`✓ Inserted course with ID: ${courseId}`);
        // Step 2: Insert grading policy
        const { error: gradingError } = await exports.supabase
            .from('grading_policies')
            .insert({
            course_id: courseId,
            homework: data.grading.homework,
            tests: data.grading.tests,
            project: data.grading.project,
            quizzes: data.grading.quizzes,
        });
        if (gradingError) {
            console.error('Failed to insert grading policy:', gradingError);
            throw new Error(`Database error: ${gradingError.message}`);
        }
        console.log('✓ Inserted grading policy');
        // Step 3: Insert events (if any exist)
        if (data.events.length > 0) {
            const eventsToInsert = data.events.map((event) => ({
                course_id: courseId,
                type: event.type,
                name: event.name,
                release_date: event.release_date,
                due_date: event.due_date,
                weight: event.weight,
            }));
            const { error: eventsError } = await exports.supabase
                .from('events')
                .insert(eventsToInsert);
            if (eventsError) {
                console.error('Failed to insert events:', eventsError);
                throw new Error(`Database error: ${eventsError.message}`);
            }
            console.log(`✓ Inserted ${data.events.length} events`);
        }
        else {
            console.log('No events to insert');
        }
        // Step 4: Insert lectures (if any exist)
        if (data.lectures.length > 0) {
            const lecturesToInsert = data.lectures.map((lecture) => ({
                course_id: courseId,
                lecture_number: lecture.lecture_number,
                title: lecture.title,
                date: lecture.date,
                topics: lecture.topics,
                description: lecture.description,
            }));
            const { error: lecturesError } = await exports.supabase
                .from('lectures')
                .insert(lecturesToInsert);
            if (lecturesError) {
                console.error('Failed to insert lectures:', lecturesError);
                throw new Error(`Database error: ${lecturesError.message}`);
            }
            console.log(`✓ Inserted ${data.lectures.length} lectures`);
        }
        else {
            console.log('No lectures to insert');
        }
        // Step 5: Insert course policies
        const { error: policiesError } = await exports.supabase
            .from('course_policies')
            .insert({
            course_id: courseId,
            late_days_total: data.policies.late_days_total,
            late_days_per_hw: data.policies.late_days_per_hw,
            genai_allowed: data.policies.genai_allowed,
            genai_notes: data.policies.genai_notes,
        });
        if (policiesError) {
            console.error('Failed to insert policies:', policiesError);
            throw new Error(`Database error: ${policiesError.message}`);
        }
        console.log('✓ Inserted course policies');
        console.log(`✓ Successfully stored all syllabus data for course ID: ${courseId}`);
        return courseId;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Database storage failed:', error.message);
            throw new Error(`Failed to store syllabus data: ${error.message}`);
        }
        throw error;
    }
}
/**
 * Retrieves full course data including all related tables
 *
 * @param courseId - The course ID to fetch
 * @returns Complete course data with grading, events, and policies
 */
async function getCourseData(courseId) {
    const { data: course, error: courseError } = await exports.supabase
        .from('courses')
        .select(`
      *,
      grading_policies(*),
      events(*),
      lectures(*),
      course_policies(*)
    `)
        .eq('id', courseId)
        .single();
    if (courseError) {
        throw new Error(`Failed to fetch course: ${courseError.message}`);
    }
    return course;
}
/**
 * Retrieves all courses with their next upcoming deadline
 *
 * @returns Array of courses with basic info and next upcoming event
 */
async function getAllCoursesWithUpcomingDeadlines() {
    try {
        // Fetch all courses
        const { data: courses, error: coursesError } = await exports.supabase
            .from('courses')
            .select('id, name, code, term')
            .order('created_at', { ascending: false });
        if (coursesError) {
            throw new Error(`Failed to fetch courses: ${coursesError.message}`);
        }
        if (!courses || courses.length === 0) {
            return [];
        }
        // For each course, find the next upcoming deadline
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const coursesWithDeadlines = await Promise.all(courses.map(async (course) => {
            // Get all future events for this course, ordered by due_date
            const { data: events, error: eventsError } = await exports.supabase
                .from('events')
                .select('name, type, due_date, release_date')
                .eq('course_id', course.id)
                .gte('due_date', today) // Only future events
                .order('due_date', { ascending: true })
                .limit(1); // Get only the next upcoming one
            if (eventsError) {
                console.error(`Error fetching events for course ${course.id}:`, eventsError);
            }
            const nextEvent = events && events.length > 0 ? events[0] : null;
            return {
                id: course.id,
                name: course.name,
                code: course.code,
                term: course.term,
                nextDeadline: nextEvent ? {
                    name: nextEvent.name,
                    type: nextEvent.type,
                    dueDate: nextEvent.due_date,
                    releaseDate: nextEvent.release_date,
                } : null,
            };
        }));
        return coursesWithDeadlines;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Failed to fetch courses with deadlines:', error.message);
            throw new Error(`Failed to fetch courses: ${error.message}`);
        }
        throw error;
    }
}
