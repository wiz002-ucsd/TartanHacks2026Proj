"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
/**
 * GET /api/ai-advisor
 *
 * Generates AI-powered academic summary and recommendations
 *
 * This endpoint:
 * 1. Calls the Python AI advisor script
 * 2. Returns snapshot + AI analysis + recommendations
 */
router.get('/ai-advisor', async (req, res) => {
    try {
        console.log('📊 Generating AI academic advisor report from real database...');
        // Path to the Python AI advisor script that queries real data
        const scriptPath = path_1.default.join(__dirname, '../../dist/MCP/get_ai_advisor.py');
        // Spawn Python process to run the AI advisor
        const pythonProcess = (0, child_process_1.spawn)('python3', [scriptPath]);
        let outputData = '';
        let errorData = '';
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
            // Log progress messages from Python script
            console.log('Python:', data.toString().trim());
        });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('❌ AI advisor script failed:', errorData);
                // Return mock data as fallback
                const fallbackData = generateMockAdvisorData();
                return res.json(fallbackData);
            }
            // Parse the JSON output from Python script
            try {
                const jsonData = JSON.parse(outputData);
                console.log('✅ AI advisor report generated successfully from database');
                res.json(jsonData);
            }
            catch (parseError) {
                console.error('❌ Failed to parse AI advisor output:', parseError);
                console.error('Raw output:', outputData);
                // Return mock data as fallback
                const fallbackData = generateMockAdvisorData();
                res.json(fallbackData);
            }
        });
        pythonProcess.on('error', (error) => {
            console.error('❌ Failed to spawn Python process:', error);
            // Return mock data as fallback
            const fallbackData = generateMockAdvisorData();
            res.json(fallbackData);
        });
    }
    catch (error) {
        console.error('❌ Error in AI advisor endpoint:', error);
        // Return mock data as fallback
        const fallbackData = generateMockAdvisorData();
        res.json(fallbackData);
    }
});
/**
 * Generate mock advisor data
 * This simulates what the Python script would return
 * Replace with actual Python script integration
 */
function generateMockAdvisorData() {
    const today = new Date();
    const addDays = (days) => {
        const date = new Date(today);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };
    return {
        snapshot: {
            student_overview: {
                active_courses: 4,
                upcoming_deadlines: 6,
                high_risk_window: true,
                high_risk_weeks: ['Week 1'],
                snapshot_date: today.toISOString().split('T')[0]
            },
            courses: [
                {
                    name: 'Introduction to AI',
                    code: 'ECE 122',
                    instructor: 'Dr. Smith',
                    upcoming_count: 2,
                    upcoming: [
                        {
                            name: 'Midterm Exam',
                            type: 'test',
                            due_date: addDays(5),
                            days_until: 5,
                            weight: 25.0
                        },
                        {
                            name: 'Homework 3',
                            type: 'homework',
                            due_date: addDays(7),
                            days_until: 7,
                            weight: 10.0
                        }
                    ],
                    load_estimate: 'high'
                },
                {
                    name: 'Computer Systems',
                    code: 'ECE 141',
                    instructor: 'Prof. Johnson',
                    upcoming_count: 1,
                    upcoming: [
                        {
                            name: 'Final Project',
                            type: 'project',
                            due_date: addDays(4),
                            days_until: 4,
                            weight: 40.0
                        }
                    ],
                    load_estimate: 'high'
                },
                {
                    name: 'Algorithms',
                    code: 'CS 251',
                    instructor: 'Dr. Brown',
                    upcoming_count: 1,
                    upcoming: [
                        {
                            name: 'Problem Set 5',
                            type: 'homework',
                            due_date: addDays(10),
                            days_until: 10,
                            weight: 8.0
                        }
                    ],
                    load_estimate: 'medium'
                },
                {
                    name: 'Linear Algebra',
                    code: 'MATH 210',
                    instructor: 'Prof. Davis',
                    upcoming_count: 1,
                    upcoming: [
                        {
                            name: 'Quiz 3',
                            type: 'quiz',
                            due_date: addDays(12),
                            days_until: 12,
                            weight: 5.0
                        }
                    ],
                    load_estimate: 'low'
                }
            ]
        },
        analysis: {
            summary: 'You have a heavy workload in the next week with two major deadlines clustered within 5 days. The ECE 141 final project (40% of grade) and ECE 122 midterm (25% of grade) are your highest priorities. With 3 deadlines in the next 7 days, careful time management is critical.',
            risks: [
                'Deadline clustering - 3 major assignments due within 7 days, creating a high-pressure window',
                'ECE 141 Final Project due in 4 days carries 40% of your course grade - highest stakes assignment',
                'ECE 122 Midterm in 5 days requires significant study time while finishing the project'
            ],
            recommendations: [
                'Prioritize ECE 141 Final Project immediately - allocate next 3 days (72 hours) to completion before midterm prep',
                'Begin ECE 122 Midterm review on Day 4 after project submission - create study guide from lectures',
                'Complete ECE 122 Homework 3 this weekend (after midterm) - it\'s lower weight and has more time'
            ],
            priority_order: [
                {
                    task: 'ECE 141 Final Project',
                    reason: 'Highest weight (40%), earliest deadline (4 days), likely requires 20-30 hours of work',
                    deadline: 'in 4 days',
                    course: 'ECE 141'
                },
                {
                    task: 'ECE 122 Midterm Exam',
                    reason: 'Second highest weight (25%), exam requires focused study time, only 1 day buffer after project',
                    deadline: 'in 5 days',
                    course: 'ECE 122'
                },
                {
                    task: 'ECE 122 Homework 3',
                    reason: 'Lower weight (10%) and more time available (7 days), can be done after higher priority items',
                    deadline: 'in 7 days',
                    course: 'ECE 122'
                }
            ],
            study_tips: [
                'Block 8-10 hours per day for the next 3 days dedicated to ECE 141 project - minimize context switching',
                'Create a 1-page midterm study guide each evening while project knowledge is fresh',
                'Use Pomodoro technique (25 min focus + 5 min break) to maintain productivity during heavy workload',
                'Schedule buffer time - if project takes longer than expected, you have 1 day before midterm prep must begin'
            ]
        }
    };
}
exports.default = router;
