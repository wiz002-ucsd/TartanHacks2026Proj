"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyllabusDataSchema = exports.LectureSchema = exports.PoliciesSchema = exports.EventSchema = exports.EventTypeSchema = exports.GradingSchema = exports.CourseSchema = void 0;
const zod_1 = require("zod");
// Zod schemas for strict validation of LLM output
exports.CourseSchema = zod_1.z.object({
    name: zod_1.z.string(),
    code: zod_1.z.string(),
    term: zod_1.z.string(),
    units: zod_1.z.number().nullable(),
});
exports.GradingSchema = zod_1.z.object({
    homework: zod_1.z.number().nullable(),
    tests: zod_1.z.number().nullable(),
    project: zod_1.z.number().nullable(),
    quizzes: zod_1.z.number().nullable(),
});
exports.EventTypeSchema = zod_1.z.enum(['homework', 'test', 'project', 'quiz']);
exports.EventSchema = zod_1.z.object({
    type: exports.EventTypeSchema,
    name: zod_1.z.string(),
    release_date: zod_1.z.string().nullable(), // YYYY-MM-DD or null
    due_date: zod_1.z.string().nullable(), // YYYY-MM-DD or null
    weight: zod_1.z.number().nullable(),
});
exports.PoliciesSchema = zod_1.z.object({
    late_days_total: zod_1.z.number().nullable(),
    late_days_per_hw: zod_1.z.number().nullable(),
    genai_allowed: zod_1.z.boolean().nullable(),
    genai_notes: zod_1.z.string().nullable(),
});
exports.LectureSchema = zod_1.z.object({
    lecture_number: zod_1.z.number(),
    title: zod_1.z.string(),
    date: zod_1.z.string().nullable(), // YYYY-MM-DD or null
    topics: zod_1.z.array(zod_1.z.string()),
    description: zod_1.z.string().nullable(),
});
exports.SyllabusDataSchema = zod_1.z.object({
    course: exports.CourseSchema,
    grading: exports.GradingSchema,
    events: zod_1.z.array(exports.EventSchema),
    policies: exports.PoliciesSchema,
    lectures: zod_1.z.array(exports.LectureSchema),
});
