# Syllabus Ingestion Pipeline

A complete implementation of an AI-powered syllabus ingestion system that extracts structured data from course syllabi using OpenAI's GPT-4 and stores it in Supabase.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ ───> │   Backend   │ ───> │  OpenAI API │ ───> │  Supabase   │
│   (React)   │      │  (Express)  │      │   (GPT-4)   │      │ (Postgres)  │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
     Upload               Validate              Extract             Store
  Syllabus Text         with Zod            Structured Data       in Database
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **LLM**: OpenAI GPT-4o
- **Validation**: Zod
- **Database**: Supabase (PostgreSQL)

## Project Structure

```
TartanHacks2026Proj/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── syllabus.ts          # API endpoint handler
│   │   ├── services/
│   │   │   ├── llm.ts               # OpenAI integration
│   │   │   └── database.ts          # Supabase integration
│   │   ├── validators/
│   │   │   └── syllabus.ts          # Zod schemas
│   │   ├── types/
│   │   │   └── syllabus.ts          # TypeScript types
│   │   └── server.ts                # Express server setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── SyllabusUpload.tsx   # Upload UI component
│   │   ├── types/
│   │   │   └── syllabus.ts          # Frontend types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── database/
│   └── schema.sql                    # Supabase table definitions
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Supabase account and project

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL script to create tables

### 3. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# OPENAI_API_KEY=sk-proj-...
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_ANON_KEY=eyJhb...
# PORT=3001

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env:
# VITE_API_BASE_URL=http://localhost:3001

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## How It Works

### Data Flow

1. **User uploads syllabus** (paste text or upload .txt file)
2. **Frontend sends text** to backend via POST `/api/upload-syllabus`
3. **Backend calls OpenAI API** with structured extraction prompt
4. **GPT-4 extracts data** and returns JSON matching the schema
5. **Zod validates** the LLM output against strict schema
6. **Backend stores data** in Supabase across 4 tables:
   - `courses` (course metadata)
   - `grading_policies` (grade breakdown)
   - `events` (assignments, exams, projects)
   - `course_policies` (late days, GenAI policy)
7. **Frontend displays** success message with extracted data

### Extraction Schema

The LLM extracts the following structured data:

```typescript
{
  course: {
    name: string
    code: string
    term: string
    units: number | null
  }
  grading: {
    homework: number | null     // percentage
    tests: number | null        // percentage
    project: number | null      // percentage
    quizzes: number | null      // percentage
  }
  events: [
    {
      type: "homework" | "test" | "project" | "quiz"
      name: string
      release_date: "YYYY-MM-DD" | null
      due_date: "YYYY-MM-DD" | null
      weight: number | null     // percentage
    }
  ]
  policies: {
    late_days_total: number | null
    late_days_per_hw: number | null
    genai_allowed: boolean | null
    genai_notes: string | null
  }
}
```

## API Endpoints

### POST `/api/upload-syllabus`

Upload and process syllabus text.

**Request:**
```json
{
  "syllabusText": "Course: Introduction to Machine Learning..."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "courseId": 1,
  "message": "Successfully processed syllabus for CS101: Intro to CS",
  "data": {
    "courseName": "Introduction to Computer Science",
    "courseCode": "CS101",
    "term": "Fall 2024",
    "eventsCount": 12
  }
}
```

**Error Response (400/422/500):**
```json
{
  "success": false,
  "error": "Error message here",
  "details": "Optional additional details"
}
```

### GET `/health`

Health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Database Schema

### `courses`
- `id` (BIGSERIAL PRIMARY KEY)
- `name` (TEXT)
- `code` (TEXT)
- `term` (TEXT)
- `units` (INTEGER)
- `created_at` (TIMESTAMPTZ)

### `grading_policies`
- `id` (BIGSERIAL PRIMARY KEY)
- `course_id` (BIGINT FK → courses.id)
- `homework`, `tests`, `project`, `quizzes` (NUMERIC)

### `events`
- `id` (BIGSERIAL PRIMARY KEY)
- `course_id` (BIGINT FK → courses.id)
- `type` (TEXT CHECK: homework/test/project/quiz)
- `name` (TEXT)
- `release_date`, `due_date` (DATE)
- `weight` (NUMERIC)

### `course_policies`
- `id` (BIGSERIAL PRIMARY KEY)
- `course_id` (BIGINT FK → courses.id)
- `late_days_total`, `late_days_per_hw` (INTEGER)
- `genai_allowed` (BOOLEAN)
- `genai_notes` (TEXT)

## Key Design Decisions

### 1. Schema-First Validation
- Strict Zod schemas enforce data quality
- LLM output is validated before storage
- Null values for missing data (no guessing)

### 2. Deterministic LLM Extraction
- Temperature set to 0 for consistency
- JSON mode enabled in OpenAI API
- Detailed system prompt with examples

### 3. Relational Database Design
- Normalized schema with foreign keys
- Cascade deletes for data integrity
- Indexed columns for query performance

### 4. Error Handling
- Comprehensive error messages at each layer
- Failed validations return 422 status
- Network errors return 500 with details

## Production Considerations

When deploying to production, consider:

1. **Authentication**: Add user auth (Supabase Auth, Auth0, etc.)
2. **Rate Limiting**: Implement rate limits on API endpoints
3. **PDF Parsing**: Integrate `pdf-parse` or `pdfjs-dist` for PDF upload
4. **Validation**: Add more robust input validation
5. **Monitoring**: Add logging (Winston, Pino) and error tracking (Sentry)
6. **Caching**: Cache frequent queries to reduce DB load
7. **Testing**: Add unit and integration tests
8. **CORS**: Configure CORS for specific origins
9. **Environment**: Use proper secret management
10. **RLS**: Implement Row Level Security in Supabase

## Testing

### Test the Backend

```bash
# Health check
curl http://localhost:3001/health

# Upload syllabus
curl -X POST http://localhost:3001/api/upload-syllabus \
  -H "Content-Type: application/json" \
  -d '{"syllabusText": "Course: CS101\nGrading: Homework 40%, Tests 60%"}'
```

### Test the Frontend

1. Open `http://localhost:5173`
2. Paste sample syllabus text
3. Click "Upload Syllabus"
4. Verify success message appears

## Troubleshooting

### Backend won't start
- Check that `.env` exists with valid credentials
- Verify OpenAI API key is valid
- Ensure Supabase URL and key are correct

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check CORS is enabled in `server.ts`
- Verify `VITE_API_BASE_URL` in frontend `.env`

### LLM returns invalid JSON
- Check OpenAI API key has GPT-4 access
- Verify system prompt in `backend/src/services/llm.ts`
- Try increasing temperature slightly (0.1-0.2)

### Database insert fails
- Verify database schema is created
- Check foreign key constraints
- Ensure RLS policies allow inserts

## License

MIT

## Contributors

Built for TartanHacks 2026
