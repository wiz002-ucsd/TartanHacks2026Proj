"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSyllabusData = extractSyllabusData;
require("dotenv/config"); // Load environment variables first
const openai_1 = __importDefault(require("openai"));
const syllabus_1 = require("../validators/syllabus");
// Initialize OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// System prompt for structured extraction
const SYSTEM_PROMPT = `You are a precise academic document parser. Your task is to extract structured information from course syllabi.

CRITICAL RULES:
1. Return ONLY valid JSON - no explanations, no markdown, no commentary
2. Follow the exact schema provided
3. Use null for any missing data - never guess or infer
4. For dates, use YYYY-MM-DD format or null
5. For percentages, use numbers (e.g., 30 for 30%, not 0.3)
6. Event types must be: "homework", "test", "project", or "quiz"

SCHEMA:
{
  "course": {
    "name": "string",
    "code": "string",
    "term": "string",
    "units": "number | null"
  },
  "grading": {
    "homework": "number | null",
    "tests": "number | null",
    "project": "number | null",
    "quizzes": "number | null"
  },
  "events": [
    {
      "type": "homework | test | project | quiz",
      "name": "string",
      "release_date": "YYYY-MM-DD | null",
      "due_date": "YYYY-MM-DD | null",
      "weight": "number | null"
    }
  ],
  "policies": {
    "late_days_total": "number | null",
    "late_days_per_hw": "number | null",
    "genai_allowed": "boolean | null",
    "genai_notes": "string | null"
  },
  "lectures": [
    {
      "lecture_number": "number",
      "title": "string",
      "date": "YYYY-MM-DD | null",
      "topics": ["string"],
      "description": "string | null"
    }
  ]
}

EXTRACTION GUIDELINES:
- "grading" percentages are CATEGORY-LEVEL weights (e.g., "Homework: 40%" means all homework combined)
- "grading" percentages should sum to 100 (or close to it)
- Extract all assignments, exams, projects, and quizzes as "events"
- For each "event", the "weight" field is the INDIVIDUAL weight as a percentage of final grade
  * If syllabus says "Assignment 1: 5%", use weight: 5
  * If syllabus says "Midterm 1: 20%", use weight: 20
  * If individual weights aren't specified, calculate the weight of each event by dividing the category-level weight by the number of assignments of that category
  * DO NOT use the category weight for individual events
- For "genai_allowed", look for keywords like "ChatGPT", "AI tools", "generative AI"
- For "late_days_total", look for phrases like "X late days for the semester"
- For "late_days_per_hw", look for "Y late days per assignment"
- Extract lecture schedule/calendar if available in syllabus
- For each lecture, extract: number, title, date, topics covered, description
- "topics" should be an array of key topics/concepts covered in that lecture
- If lecture schedule is not detailed, return empty array

Return the JSON object immediately.`;
/**
 * Extracts structured syllabus data from raw text using OpenAI GPT-4
 *
 * @param syllabusText - Raw text extracted from syllabus PDF or pasted by user
 * @returns Validated SyllabusData object
 * @throws Error if LLM fails, returns invalid JSON, or validation fails
 */
async function extractSyllabusData(syllabusText) {
    try {
        // Call OpenAI API with structured extraction prompt
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', // Use GPT-4 for best accuracy
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: `Extract structured data from this syllabus:\n\n${syllabusText}`,
                },
            ],
            temperature: 0, // Deterministic output
            response_format: { type: 'json_object' }, // Force JSON response
        });
        // Extract the response content
        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
            throw new Error('OpenAI returned empty response');
        }
        // Parse JSON
        let parsedData;
        try {
            parsedData = JSON.parse(responseContent);
        }
        catch (parseError) {
            console.error('Failed to parse LLM response as JSON:', responseContent);
            throw new Error('LLM returned invalid JSON');
        }
        // Validate against Zod schema
        const validatedData = syllabus_1.SyllabusDataSchema.parse(parsedData);
        console.log('✓ Successfully extracted and validated syllabus data');
        return validatedData;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('LLM extraction failed:', error.message);
            throw new Error(`Failed to extract syllabus data: ${error.message}`);
        }
        throw error;
    }
}
