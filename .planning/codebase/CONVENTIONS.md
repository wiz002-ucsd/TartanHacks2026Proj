# Coding Conventions

**Analysis Date:** 2026-03-04

## Naming Patterns

**Files:**
- PascalCase for React components: `Dashboard.tsx`, `AuthContext.tsx`, `SyllabusUpload.tsx`
- camelCase for utilities and services: `database.ts`, `llm.ts`, `pdf.ts`, `theme.ts`
- camelCase for route files: `syllabus.ts`, `courses.ts`, `ai-advisor.ts`
- camelCase for type definition files: `syllabus.ts` (in types directory)
- camelCase for validator files: `syllabus.ts` (in validators directory)

**Functions:**
- camelCase for all function names (React components, async functions, helper functions)
- Async functions named clearly with verb-first pattern: `extractSyllabusData()`, `storeSyllabusData()`, `getCourseData()`
- Event handlers use `handle` prefix: `handleFileChange()`, `handleSubmit()`, `fetchDashboardData()`
- Getter functions use `get` prefix: `getUrgencyColor()`, `getLoadColor()`

**Variables:**
- camelCase for all variables and constants
- State variables use React hooks pattern: `const [data, setData] = useState()`
- Boolean variables prefixed with `is`: `isLoading`, `isMounted`, `isAuthenticated`
- Configuration constants in camelCase: `API_BASE_URL`, `VITE_API_BASE_URL`
- Local constants use camelCase: `today`, `courseId`, `syllabusText`

**Types:**
- PascalCase for interface names: `AuthContextType`, `UpcomingTask`, `Course`, `AIAnalysis`, `DashboardData`
- PascalCase for type names: `UploadResponse`, `SyllabusData`
- Enum members use UPPER_SNAKE_CASE in Zod: `EventTypeSchema` defines enum values like `'homework'`, `'test'`, `'project'`, `'quiz'`

## Code Style

**Formatting:**
- TypeScript strict mode enabled: `"strict": true` in tsconfig.json
- Unused locals and parameters flagged: `"noUnusedLocals": true`, `"noUnusedParameters": true`
- No fallthrough in switch statements: `"noFallthroughCasesInSwitch": true`
- ES2020 target compilation
- Line length: No explicit limit observed, but components stay under 1000 lines

**Linting:**
- No .eslintrc or .prettierrc configuration detected
- Default TypeScript strict checks enforced via tsconfig.json
- Manual consistency observed in actual code (2-space indentation, semi-colons used)

## Import Organization

**Order:**
1. External dependencies (React, libraries): `import React from 'react'`, `import { useState } from 'react'`
2. Framework/library imports: `import { Routes, Route } from 'react-router-dom'`, `import { createContext } from 'react'`
3. Internal imports from `src/`: `import { useAuth } from './contexts/AuthContext'`, `import AppLayout from './components/AppLayout'`
4. Type imports: `import type { UploadResponse } from '../types/syllabus'`
5. Relative imports by proximity: closest to root-relative, then relative paths

**Path Aliases:**
- No path aliases detected in tsconfig.json (using relative paths instead)
- Relative path pattern: `../` for going up, `./` for same directory
- Import.meta.env used for environment variables: `import.meta.env.VITE_API_BASE_URL`

## Error Handling

**Patterns:**
- Try-catch blocks for async operations with specific error type checking: `if (error instanceof Error)`
- Error type guards used consistently: check if error is Error class before accessing `.message`
- Graceful fallback for unknown errors: catches and provides default error message
- Console logging with status indicators before/after operations
- HTTP error responses return `{ success: false, error: message }` structure
- Validation errors handled separately from runtime errors in routes
- Zod validation errors caught and reported with `{ name: 'ZodError' }` check

**Example patterns observed:**
```typescript
// Backend route pattern
try {
  // Operation
  return res.status(201).json({ success: true, data });
} catch (error) {
  console.error('Error:', error);
  if (error instanceof Error) {
    return res.status(500).json({ success: false, error: error.message });
  }
  return res.status(500).json({ success: false, error: 'Unknown error' });
}

// Frontend pattern
try {
  const data = await fetch(...);
  setData(data);
} catch (err) {
  console.error('Error:', err);
  setError(err instanceof Error ? err.message : 'Unknown error occurred');
} finally {
  setLoading(false);
}
```

## Logging

**Framework:** `console` only - no external logging library

**Patterns:**
- Status indicators using emojis: `📎`, `📄`, `🤖`, `💾`, `✓`, `❌`, `🔄`, `🧠`, `⚠️`
- Descriptive log messages with context: `console.log('📄 Extracting text from PDF...')`
- Error logging with `console.error()` prefixed with `❌`
- Success logging with `console.log()` prefixed with `✓`
- Debug logging during data flow: `console.log('AI advisor data received:', result.snapshot?.student_overview)`
- Frontend component lifecycle logging: when data loads, when errors occur, when state updates

## Comments

**When to Comment:**
- Large blocks of inline styles in React components (no comments observed - style objects are self-documenting)
- Complex business logic: extraction prompts, validation rules
- API documentation: JSDoc comments on endpoint handlers

**JSDoc/TSDoc:**
- Used extensively on backend route handlers for API documentation
- Documents request/response structures with examples
- Function parameter and return type documentation
- System prompts documented with CRITICAL RULES and SCHEMA sections

**Example observed:**
```typescript
/**
 * POST /api/upload-syllabus
 *
 * Accepts syllabus as PDF file OR raw text, extracts structured data via LLM,
 * validates it, and stores it in Supabase.
 *
 * Response: { success, courseId, message, data, extractedData }
 */
```

## Function Design

**Size:**
- Functions generally kept under 200 lines
- Large components (e.g., Dashboard.tsx) exceed this due to inline JSX and styling
- Utility functions are compact (under 50 lines typically)

**Parameters:**
- Type annotations required: `(data: SyllabusData) => Promise<number>`
- Optional parameters using `?`: `(file?: File)`
- Destructuring used for component props: `{ children }, { isAuthenticated }`
- No rest parameters observed; instead, explicit parameters typed

**Return Values:**
- Explicit return types on async functions: `async function extractSyllabusData(...): Promise<SyllabusData>`
- Routes return Express Response objects
- Components return JSX.Element (implicit through React)
- Helper functions return typed values: `getUrgencyColor(): string`

## Module Design

**Exports:**
- Default exports used for main components and route handlers: `export default function App()`, `export default router`
- Named exports for types: `export type UploadResponse = ...`
- Named exports for utilities: `export async function getCourseData(...)`
- Context hooks exported as named functions: `export function useAuth()`

**Barrel Files:**
- No barrel files observed (no `index.ts` re-exports in component directories)
- Each component imported directly from its file: `import Dashboard from './components/Dashboard'`
- Route handlers imported individually: `import syllabusRouter from './routes/syllabus'`

## Type System

**Type Definitions:**
- Interface keyword used for object shapes: `interface AuthContextType`, `interface DashboardData`
- Zod schemas for runtime validation: `CourseSchema`, `SyllabusDataSchema`
- Type inference from Zod: `export type ValidatedSyllabusData = z.infer<typeof SyllabusDataSchema>`
- Generic types used: `useState<DashboardData | null>(null)`, `setError<string | null>(null)`

---

*Convention analysis: 2026-03-04*
