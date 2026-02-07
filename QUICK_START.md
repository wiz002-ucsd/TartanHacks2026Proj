# 🚀 Quick Start Guide

Get the syllabus ingestion pipeline running in 5 minutes.

## Prerequisites

- ✅ Node.js 18+ and npm
- ✅ OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- ✅ Supabase account ([sign up here](https://supabase.com))

---

## Step 1: Database Setup (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database/schema.sql`
6. Paste and click **Run**
7. You should see "Success. No rows returned"
8. Go to **Settings** → **API** and copy:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - `anon` `public` key (starts with `eyJhb...`)

---

## Step 2: Backend Setup (1 minute)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# (use nano, vim, or any text editor)
nano .env
```

**Edit `.env` file:**
```bash
PORT=3001
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...YOUR-KEY-HERE
```

**Start the backend:**
```bash
npm run dev
```

You should see:
```
✓ Server running on http://localhost:3001
✓ Health check: http://localhost:3001/health
✓ API endpoint: http://localhost:3001/api/upload-syllabus
```

---

## Step 3: Frontend Setup (1 minute)

Open a **new terminal window**:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (only needed if backend is not on localhost:3001)
# nano .env

# Start the frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## Step 4: Test It! (1 minute)

1. Open your browser to **http://localhost:5173**
2. You'll see the **Syllabus Upload & Analysis** page
3. Click **"📎 Upload File"** or **"📝 Paste Text"**
4. Try the example below:

### Example Syllabus Text

```
Course: CS 101 - Introduction to Computer Science
Term: Fall 2024
Units: 3

Instructor: Dr. Jane Smith
Email: jane.smith@university.edu

Grading Breakdown:
- Homework: 40%
- Midterm Exam: 25%
- Final Exam: 25%
- Quizzes: 10%

Assignments:
1. Homework 1: Python Basics - Due: September 15, 2024 (10%)
2. Homework 2: Data Structures - Due: September 29, 2024 (10%)
3. Homework 3: Algorithms - Due: October 13, 2024 (10%)
4. Homework 4: Final Project - Due: November 10, 2024 (10%)

Exams:
- Midterm Exam: October 20, 2024 (25%)
- Final Exam: December 15, 2024 (25%)

Late Policy:
Students have 5 late days total for the semester. You may use up to 2 late days per homework assignment.

Generative AI Policy:
ChatGPT and other AI tools are allowed for debugging and understanding concepts, but not for writing complete solutions to homework problems.
```

5. Click **"🚀 Analyze Syllabus"**
6. Wait 5-10 seconds for processing
7. See the beautiful summary! 🎉

---

## What You Should See

### Success Banner
```
✓ Syllabus Analyzed Successfully
Successfully processed syllabus for CS101: Introduction to Computer Science
Database ID: 1
```

### Course Information
- Course Name: Introduction to Computer Science
- Course Code: CS 101
- Term: Fall 2024
- Units: 3

### Grading Breakdown (Visual Bars)
- Homework: 40% (blue bar)
- Tests: 50% (red bar) - combines both exams
- Quizzes: 10% (cyan bar)

### Course Events Table
- 4 homework assignments with dates
- 2 exams with dates

### Course Policies
- Late days: 5 total, 2 per assignment
- GenAI: ✓ Allowed - ChatGPT allowed for debugging and understanding concepts

---

## Troubleshooting

### Backend won't start

**Error:** `Missing Supabase environment variables`
- **Fix:** Make sure `.env` file exists in `backend/` folder with all required variables

**Error:** `OpenAI API key not found`
- **Fix:** Add valid OpenAI API key to `backend/.env`

### Frontend shows "Network error"

**Error:** `Failed to fetch`
- **Fix:** Make sure backend is running on port 3001
- **Check:** Visit http://localhost:3001/health in browser
- **Expected:** `{"status":"ok","timestamp":"..."}`

### PDF upload not working

**Error:** `PDF appears to be empty`
- **Fix:** PDF might be image-based (scanned). Try extracting text manually and pasting it.

**Error:** `File too large`
- **Fix:** Max file size is 10MB. Try compressing the PDF.

---

## Next Steps

### Test with a Real PDF
1. Find a course syllabus PDF
2. Click "📎 Upload File"
3. Select the PDF
4. Click "🚀 Analyze Syllabus"

### View Database
1. Go to Supabase dashboard
2. Click **Table Editor**
3. View `courses`, `events`, `grading_policies`, `course_policies` tables
4. See your extracted data!

### Customize
- Edit LLM prompt in `backend/src/services/llm.ts`
- Customize UI in `frontend/src/components/SyllabusSummary.tsx`
- Add more fields to schema in `database/schema.sql`

---

## Architecture Overview

```
┌─────────────────┐
│  User Browser   │
│  localhost:5173 │
└────────┬────────┘
         │
         │ HTTP POST (multipart/form-data or JSON)
         ↓
┌─────────────────┐
│  Express API    │
│  localhost:3001 │
│  /api/upload-   │
│   syllabus      │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ↓                 ↓
┌──────────────┐  ┌──────────────┐
│   PDF Parse  │  │  OpenAI API  │
│  (pdf-parse) │  │   (GPT-4o)   │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │ Text            │ JSON
       └────────┬────────┘
                │
                ↓
        ┌───────────────┐
        │ Zod Validator │
        └───────┬───────┘
                │
                │ Validated Data
                ↓
        ┌───────────────┐
        │   Supabase    │
        │  PostgreSQL   │
        └───────────────┘
```

---

## File Locations

### Configuration Files
- Backend: `backend/.env`
- Frontend: `frontend/.env`
- Database: Run `database/schema.sql` in Supabase

### Important Files
- Backend API: `backend/src/routes/syllabus.ts`
- LLM Service: `backend/src/services/llm.ts`
- PDF Service: `backend/src/services/pdf.ts`
- Frontend UI: `frontend/src/components/SyllabusUpload.tsx`
- Summary Display: `frontend/src/components/SyllabusSummary.tsx`

---

## Commands Cheatsheet

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
# Run in Supabase SQL Editor:
# Copy-paste contents of database/schema.sql
```

---

## Success! 🎉

You now have a fully functional AI-powered syllabus analyzer!

**What it does:**
- ✅ Accepts PDF or text input
- ✅ Extracts structured course data using GPT-4
- ✅ Validates with strict schema (Zod)
- ✅ Stores in Supabase PostgreSQL
- ✅ Displays beautiful summary

**Ready for:**
- 🎓 Hackathons
- 🚀 Startups
- 📚 Academic projects
- 💼 Portfolio projects

---

## Getting Help

- Check `README.md` for detailed documentation
- Check `PDF_UPLOAD_UPDATE.md` for PDF feature details
- Check `IMPLEMENTATION_SUMMARY.md` for technical details
- Open an issue on GitHub

Happy hacking! 🚀
