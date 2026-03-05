# Testing Patterns

**Analysis Date:** 2026-03-04

## Test Framework

**Runner:**
- No test runner currently configured (Jest, Vitest not installed)
- Dependencies show only development tools: TypeScript, tsx, type definitions
- Testing infrastructure not yet implemented in project

**Assertion Library:**
- Not configured - no testing framework detected

**Run Commands:**
```bash
# Current build/dev commands only:
npm run dev              # Start development server
npm run build            # Compile TypeScript
npm run type-check       # Type checking only
```

## Test File Organization

**Location:**
- No test files detected in source code (search for `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx` returned no results)
- Standard convention would be co-located tests alongside source files

**Naming:**
- Not yet established - would follow `ComponentName.test.tsx` or `ComponentName.spec.tsx` pattern

**Structure:**
```
# Potential structure if testing were implemented:
src/
├── components/
│   ├── Dashboard.tsx
│   ├── Dashboard.test.tsx
│   └── ...
├── services/
│   ├── database.ts
│   ├── database.test.ts
│   └── ...
└── __tests__/           # Alternative: centralized tests
    └── integration/
```

## Current Testing Gap

**What's Not Tested:**
- React components: `Dashboard`, `SyllabusUpload`, `AuthContext`, etc.
- API routes: `/api/upload-syllabus`, `/api/courses`, `/api/ai-advisor`
- Services: LLM extraction (`extractSyllabusData`), database operations (`storeSyllabusData`), PDF parsing
- Validators: Zod schema validation for syllabus data
- Error handling: try-catch blocks throughout codebase have no test coverage

**Code Paths Without Tests:**
- File upload handling and multipart form data processing
- LLM JSON parsing and response validation
- Database transaction flow (5-step insert across multiple tables)
- Navigation flows and authentication context updates
- State management in components (loading, error, success states)

## Manual Testing Patterns Observed

**Frontend Testing (Manual):**
- Console logging used extensively for debugging: `console.log('✓ Data state updated successfully')`
- State transitions logged with emoji indicators
- Error messages printed with `console.error()`
- Example from `Dashboard.tsx`:
  ```typescript
  console.log('🔄 Fetching AI advisor data...');
  console.log('✅ AI advisor data received:', result.snapshot?.student_overview);
  console.error('❌ Error fetching dashboard data:', err);
  ```

**Backend Testing (Manual):**
- Health check endpoint: `GET /health` returns `{ status: 'ok', timestamp }`
- Console logs with status emojis throughout request handling
- Example from `courses.ts`:
  ```typescript
  console.log('📚 Fetching all courses with upcoming deadlines...');
  console.log(`✓ Found ${courses.length} courses`);
  console.error('❌ Error fetching courses:', error);
  ```

## Mocking Needs

**What Needs Mocking:**
- OpenAI API: `openai.chat.completions.create()` in `llm.ts`
- Supabase client: All database operations in `database.ts`
- Express request/response objects in route handlers
- File uploads through multer in route handlers
- Fetch calls in React components

**Mock Data Available:**
- No test fixtures or factories detected
- Type definitions can serve as templates for test data
- Zod schemas provide shape validation for mock data

**Approach If Testing Were Implemented:**
- Mock OpenAI to return predetermined validated JSON
- Mock Supabase with in-memory data store or test DB
- Mock Express req/res with jest mock objects
- Mock fetch globally or per test
- Use TypeScript types to build valid test fixtures

## What Blocks Testing

**Current Blockers:**
1. No test framework installed (Jest, Vitest, Mocha)
2. No assertion library (expect, should, chai)
3. No mocking library (jest.mock, sinon, vi.mock)
4. No test configuration files (jest.config.ts, vitest.config.ts)
5. Environment variables required but not in test context (SUPABASE_URL, OPENAI_API_KEY)
6. No test database or test environment setup

## Type-Based Testing Observations

**Type Safety as Testing Layer:**
- TypeScript strict mode catches type errors at compile time
- Zod schemas provide runtime validation that's test-like: `SyllabusDataSchema.parse(data)`
- Type annotations prevent entire classes of bugs
- Function signatures are explicit contracts

**Example of type safety preventing bugs:**
```typescript
// Type annotation forces correct error handling
if (error instanceof Error) {
  console.error(error.message);  // Safe - .message exists
}
// vs unknown error could cause runtime failure
```

## Validation as Testing

**Runtime Validation:**
- Zod schemas in `validators/syllabus.ts` validate LLM output
- Request validation in routes: `isNaN(courseId)` checks in `GET /courses/:id`
- File type validation in multer filter: `isPDF()` and mime type checks
- Form validation in components: length checks, presence checks before submit

**Example validation pipeline:**
```typescript
// Backend validates LLM output automatically
const validatedData = SyllabusDataSchema.parse(parsedData);  // Throws if invalid
// Frontend validates input before sending
if (syllabusText.trim().length < 50) return error;
```

## Integration Points to Test (If Framework Added)

**API Integration:**
- File upload endpoint with PDF/text files
- LLM extraction with structured JSON response
- Database persistence across 5 related tables
- Course retrieval with joined data

**Component Integration:**
- Navigation between routes with auth protection
- Context provider wrapping app
- State flow: loading → success/error states
- Event handlers triggering API calls

**Data Flow:**
- Upload form → API → Database → List display
- Dashboard component → AI API → Display analysis

## Recommended Testing Strategy

**Priority 1 (Unit Tests):**
- Validators: Test Zod schemas with valid/invalid data
- Utilities: `getUrgencyColor()`, `getLoadColor()` functions
- Type inference: Test type definitions compile correctly

**Priority 2 (Integration Tests):**
- Upload flow: File → Extract → Validate → Store
- Course retrieval: Query → Transform → Return
- Component state: Render → Interact → Update

**Priority 3 (E2E Tests):**
- Complete syllabus upload workflow
- Navigation flows with auth
- Dashboard data display and refresh

---

*Testing analysis: 2026-03-04*
