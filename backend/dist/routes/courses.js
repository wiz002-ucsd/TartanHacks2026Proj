"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../services/database");
const router = (0, express_1.Router)();
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
router.get('/courses', async (req, res) => {
    try {
        console.log('📚 Fetching all courses with upcoming deadlines...');
        const courses = await (0, database_1.getAllCoursesWithUpcomingDeadlines)();
        console.log(`✓ Found ${courses.length} courses`);
        return res.status(200).json({
            success: true,
            courses,
            count: courses.length,
        });
    }
    catch (error) {
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
router.get('/courses/:id', async (req, res) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        if (isNaN(courseId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid course ID',
            });
        }
        console.log(`📚 Fetching course details for ID: ${courseId}`);
        const course = await (0, database_1.getCourseData)(courseId);
        console.log(`✓ Retrieved course: ${course.code}`);
        return res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
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
router.delete('/courses/:id', async (req, res) => {
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
        const { supabase } = await Promise.resolve().then(() => __importStar(require('../services/database')));
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
    }
    catch (error) {
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
exports.default = router;
