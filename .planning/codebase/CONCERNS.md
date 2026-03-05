# Codebase Concerns

**Analysis Date:** 2026-03-04

## Security Concerns

**Overly Permissive CORS:**
- Issue: `app.use(cors())` with no configuration allows requests from any origin
- Files: `backend/src/server.ts` (line 15)
- Impact: API endpoints accessible from any website, potential for unauthorized data access
- Recommendations: Configure CORS whitelist with specific frontend origins (e.g., `cors({ origin: 'https://yourdomain.com' })`)

**Client-Side Authentication Vulnerability:**
- Issue: Authentication state stored as simple boolean in localStorage (`sunzi_auth` flag) with no backend validation
- Files: `frontend/src/contexts/AuthContext.tsx` (lines 12-13, 17)
- Impact: Users can manually set `localStorage.sunzi_auth = 'true'` to bypass all authentication. No backend session verification exists.
- Recommendations: Implement proper token-based auth (JWT) with backend validation on protected endpoints. Verify auth state before serving user data.

**No Input Sanitization on PDF Text:**
- Issue: PDF text extracted via `pdf-parse` is passed directly to OpenAI without sanitization
- Files: `backend/src/routes/syllabus.ts` (line 65), `backend/src/services/pdf.ts` (line 23)
- Impact: Malicious PDFs could inject prompts into LLM requests, potentially manipulating extraction output
- Recommendations: Sanitize extracted text, validate format, check for suspicious patterns before LLM processing

**API Key Exposure Risk:**
- Issue: OpenAI API key loaded from environment variable with no validation that it exists before use
- Files: `backend/src/services/llm.ts` (line 8)
- Impact: If env var is missing, error message may leak API details. No graceful failure handling.
- Recommendations: Validate API keys at startup, return generic errors to clients

**No Rate Limiting:**
- Issue: `/api/upload-syllabus` endpoint accepts requests with no rate limiting
- Files: `backend/src/routes/syllabus.ts` (line 54)
- Impact: Attackers can spam endpoint to exhaust OpenAI quota and incur costs
- Recommendations: Add rate limiting middleware (e.g., express-rate-limit) with per-IP or per-user limits

**Unencrypted Database Credentials:**
- Issue: Supabase credentials (URL, anon key) are in environment variables but may be logged
- Files: `backend/src/services/database.ts` (lines 6-7)
- Impact: Credentials visible in console logs if debugging is enabled
- Recommendations: Never log env vars. Use role-based keys with minimal permissions.

## Performance Bottlenecks

**Sequential Database Inserts Without Transaction:**
- Issue: Database operations in `storeSyllabusData` are sequential (Step 1, 2, 3, 4, 5) without transaction wrapping
- Files: `backend/src/services/database.ts` (lines 28-139)
- Impact: If step 3 or 4 fails after course insert (step 1), orphaned course records remain in database. No atomicity.
- Improvement path: Wrap all inserts in a transaction or implement rollback logic

**N+1 Query in Course Listing:**
- Issue: `getAllCoursesWithUpcomingDeadlines` fetches all courses, then maps with individual event queries
- Files: `backend/src/services/database.ts` (lines 212-220)
- Impact: For 10 courses = 11 database queries (1 for courses + 10 for events). Scales poorly.
- Improvement path: Use Supabase joins: `.select('*, events(name, type, due_date, release_date)')` to fetch in single query

**Large Component Files:**
- Issue: Frontend components exceed 1000 lines with inline styles
- Files:
  - `frontend/src/LandingPage.tsx` (1180 lines)
  - `frontend/src/components/Dashboard.tsx` (972 lines)
  - `frontend/src/components/CourseDetail.tsx` (955 lines)
- Impact: Hard to test, maintain, and navigate. All styling is procedural.
- Improvement path: Extract inline styles to CSS modules or styled-components. Break components into smaller pieces.

**Inefficient Date Calculations:**
- Issue: `getUrgencyColor` and `formatDate` in Home.tsx recalculate same dates for every course on every render
- Files: `frontend/src/components/Home.tsx` (lines 50-87)
- Impact: Unnecessary DOM updates and calculations on each render
- Improvement path: Memoize date calculations, use `useMemo` hook

**No Caching of Syllabus Extraction:**
- Issue: PDF-to-text extraction happens on every upload with no deduplication check
- Files: `backend/src/routes/syllabus.ts` (line 65)
- Impact: Uploading same PDF twice triggers two full LLM calls and database inserts
- Improvement path: Hash PDF content, check if already exists before processing

## Test Coverage Gaps

**No Automated Tests:**
- Issue: No test files in frontend or backend source directories
- Files: None (gap)
- Risk: Regressions go undetected. Auth bypass or data validation failures won't be caught.
- Priority: High - at minimum, add tests for:
  - LLM extraction validation (does Zod schema catch malformed responses?)
  - Database transaction failures
  - Auth context behavior

**No E2E Test Coverage:**
- Issue: Full upload-to-display flow never tested end-to-end
- Files: None (gap)
- Risk: Frontend expecting different response format from backend than backend sends (response.success mismatches)
- Priority: Medium - test upload workflow and course listing displays

**Untested Error Paths:**
- Issue: Error handlers in syllabus.ts return different response structures but never tested
- Files: `backend/src/routes/syllabus.ts` (lines 118-151)
- Risk: Some error cases may return `{success: false, error: ...}` while others return different shapes
- Priority: Medium - test all error branches

## Fragile Areas

**Auth Context Missing Error Handling:**
- Files: `frontend/src/contexts/AuthContext.tsx`
- Why fragile: `useAuth()` throws if called outside provider, but no Provider wrapping verification
- Safe modification: Add dev-time warning for missing provider. Test all useAuth calls are within Provider scope.
- Test coverage: None - hook behavior untested

**Python Script Integration Fragile:**
- Issue: AI advisor endpoint spawns Python process with hardcoded path
- Files: `backend/src/routes/ai-advisor.ts` (line 21)
- Why fragile: If Python script path changes or Python3 not installed, endpoint fails silently and returns mock data
- Safe modification: Check Python path exists at startup. Test script execution separately from Express.
- Test coverage: None - subprocess spawning untested

**Supabase Table Structure Unknown:**
- Issue: Database service assumes tables exist with specific schema but schema file not in codebase
- Files: `backend/src/services/database.ts`, `backend/database/` (not shown)
- Why fragile: If columns renamed or table structure changes, inserts fail with cryptic errors
- Safe modification: Add TypeScript types for each table. Document expected schema.

**Manual File Input Reset:**
- Issue: File input cleared by DOM manipulation instead of React state
- Files: `frontend/src/components/SyllabusUpload.tsx` (line 75-76)
- Why fragile: `document.getElementById()` is brittle if id changes. Manual DOM manipulation in React is error-prone.
- Safe modification: Use ref (`useRef`) to access input element instead of getElementById

**Date String Format Assumptions:**
- Issue: Code assumes due_date is always YYYY-MM-DD string (never validated)
- Files: `frontend/src/components/Home.tsx` (line 51), `backend/src/services/llm.ts` (line 78)
- Why fragile: If LLM returns malformed date, UI breaks when parsing
- Safe modification: Add date validation in Zod schema (regex pattern), use date parsing library like date-fns

## Known Issues

**LLM Extraction Unreliability:**
- Issue: GPT-4 sometimes ignores JSON_OBJECT constraint or returns nested structure mismatch
- Files: `backend/src/services/llm.ts` (lines 95-108)
- Symptoms: Validation errors on extraction, manual syllabus text input sometimes succeeds where PDF fails
- Root cause: LLM temperature set to 0 but json_object mode not always enforced
- Workaround: Users can retry upload or use text mode instead of file upload
- Recommendation: Add retry logic with exponential backoff, add secondary validation step

**Ambiguous Event Weight Calculation:**
- Issue: Prompt instructs LLM to calculate individual event weights if not specified, but logic is vague
- Files: `backend/src/services/llm.ts` (line 69)
- Symptoms: Different syllabi with same structure may have inconsistent weight calculations
- Root cause: Prompt relies on LLM reasoning rather than deterministic algorithm
- Workaround: None - users must verify extracted weights match syllabus
- Recommendation: Simplify prompt, add validation that event weights sum correctly

**Missing Courses on Dashboard:**
- Issue: `getAllCoursesWithUpcomingDeadlines` returns empty array if any course has no events
- Files: `backend/src/services/database.ts` (line 226)
- Symptoms: Some uploaded courses don't appear in course list, only courses with future deadlines show
- Root cause: `gte('due_date', today)` filters out past/no deadlines - but courses should still display
- Workaround: Upload course with at least one future event
- Recommendation: Return all courses regardless of events, show "No upcoming deadlines" state

**Window History Mutation:**
- Issue: Home.tsx calls `window.history.replaceState({}, '')` to clear location state
- Files: `frontend/src/components/Home.tsx` (line 24)
- Symptoms: Browser back button behavior changes unexpectedly
- Root cause: Direct window history manipulation in React component
- Workaround: Reload page to reset state
- Recommendation: Use React Router's state management instead of window history

## Missing Critical Features

**No Data Persistence Verification:**
- Issue: Supabase connection tested at startup, but no verification that tables exist
- Problem: Missing tables will cause runtime errors instead of failing at startup
- Blocks: Cannot reliably know if database is properly configured

**No Fallback for LLM Service Outages:**
- Issue: If OpenAI API is down, entire upload endpoint fails
- Problem: No caching, no fallback parsing, no graceful degradation
- Blocks: Service unavailable when OpenAI is down (even if temporarily)

**No User Session Management:**
- Issue: No concept of user identity or session tracking
- Problem: All uploads mixed together; cannot show "My Courses" per user
- Blocks: Multi-user deployments not possible

**No Duplicate Course Detection:**
- Issue: Uploading same syllabus twice creates two separate course records
- Problem: User confusion, database bloat
- Blocks: Data cleanup becomes manual process

## Scaling Limits

**Single-Server Architecture:**
- Current capacity: Handles sequential uploads to one backend instance
- Limit: Concurrent upload requests block each other on LLM API calls (not parallelized)
- Scaling path: Implement job queue (e.g., Bull, RQ) for async LLM extraction, separate worker processes

**LLM API Rate Limits:**
- Current capacity: Depends on OpenAI tier (likely 3-5 requests/min)
- Limit: Exceeding quota causes 429 errors; all subsequent uploads fail
- Scaling path: Implement queue, set rate limits in client, add cost monitoring

**Database Query Scaling:**
- Current capacity: N+1 query pattern works fine for <100 courses
- Limit: With 1000+ courses, single query fetches all, then makes 1000 individual event queries
- Scaling path: Use database joins/views to fetch in single query

**Frontend Bundle Size:**
- Current issue: No production build analysis. Large inline styles replicated across components.
- Limit: With lazy loading of pages, could optimize by ~30-40% by extracting styles
- Scaling path: Use CSS modules or tailwind instead of inline styles

## Dependencies at Risk

**pdf-parse v1.1.1:**
- Risk: Package last updated 2021, not actively maintained
- Impact: Security fixes and Node.js compatibility issues may not be addressed
- Migration plan: Switch to `pdfjs-dist` (Mozilla PDF.js) which is actively maintained, or `pdf-lib` for more control

**OpenAI SDK v4.20.1:**
- Risk: Pinned to specific version. If critical bug found, requires manual update.
- Impact: Security vulnerabilities or breaking API changes caught late
- Migration plan: Update to latest major version on schedule (e.g., quarterly), monitor changelog

**Supabase Client v2.39.0:**
- Risk: Supabase API may change. No abstraction layer between code and client.
- Impact: Breaking changes require code updates across multiple files
- Migration plan: Create service layer wrapper (e.g., `databaseService.ts`) that abstracts Supabase, easier to refactor

## Database Concerns

**No Cascading Deletes Configured:**
- Issue: DELETE on courses endpoint assumes CASCADE is configured
- Files: `backend/src/routes/courses.ts` (line 222-225)
- Risk: If CASCADE not enabled, orphaned grading_policies, events, lectures remain
- Recommendation: Add database migration to verify CASCADE is enabled; add tests for delete behavior

**No Indexes on Common Queries:**
- Issue: Queries on `course_id`, `due_date` likely slow without indexes
- Files: `backend/src/services/database.ts` (lines 217-220)
- Risk: Database query time grows with data volume
- Recommendation: Add indexes: `CREATE INDEX idx_events_course_due ON events(course_id, due_date)`

**Lectures Table Unknown Schema:**
- Issue: `lectures` table expected but schema/structure not documented
- Files: `backend/src/services/database.ts` (lines 96-117)
- Risk: If topics column type is wrong (string vs array), inserts fail
- Recommendation: Document all table schemas in codebase, add TypeScript types for each

---

*Concerns audit: 2026-03-04*
