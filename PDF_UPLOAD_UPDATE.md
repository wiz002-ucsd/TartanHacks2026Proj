# PDF Upload Feature Update

## What's New

The syllabus ingestion pipeline now supports:
1. ✅ **PDF file uploads** - Upload syllabus PDFs directly
2. ✅ **Text extraction from PDFs** - Automatic extraction using `pdf-parse`
3. ✅ **Comprehensive summary display** - Beautiful UI showing all extracted data
4. ✅ **Dual input modes** - Switch between file upload and text paste

---

## New Features

### 1. PDF Upload Support

The backend now accepts PDF files and extracts text automatically.

**Backend Changes:**
- Added `pdf-parse` library for PDF text extraction
- Added `multer` for file upload handling
- Created [pdf.ts](backend/src/services/pdf.ts) service for PDF operations
- Updated [syllabus.ts](backend/src/routes/syllabus.ts) route to accept multipart/form-data

**Key Code:**
```typescript
// Extract text from PDF buffer
const text = await extractTextFromPDF(buffer);

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (isPDF(file.mimetype, file.originalname) || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  },
});
```

### 2. Comprehensive Summary Display

The frontend now displays a beautiful, detailed summary of the extracted data.

**Frontend Changes:**
- Created [SyllabusSummary.tsx](frontend/src/components/SyllabusSummary.tsx) - New summary component
- Updated [SyllabusUpload.tsx](frontend/src/components/SyllabusUpload.tsx) - File upload support
- Updated [types/syllabus.ts](frontend/src/types/syllabus.ts) - Full data types

**Summary Sections:**
1. **Course Information** - Name, code, term, units
2. **Grading Breakdown** - Visual percentage bars for each component
3. **Course Events** - Table of all assignments, tests, projects, quizzes
4. **Course Policies** - Late day policies, GenAI rules

### 3. Dual Input Modes

Users can now choose between:
- **📎 Upload File** - Upload PDF or TXT files
- **📝 Paste Text** - Paste syllabus text directly

---

## Updated API Endpoint

### POST `/api/upload-syllabus`

**Two ways to use:**

#### Option 1: File Upload (multipart/form-data)
```bash
curl -X POST http://localhost:3001/api/upload-syllabus \
  -F "file=@syllabus.pdf"
```

#### Option 2: Text Input (application/json)
```bash
curl -X POST http://localhost:3001/api/upload-syllabus \
  -H "Content-Type: application/json" \
  -d '{"syllabusText": "Course: CS101..."}'
```

**Response (now includes full extracted data):**
```json
{
  "success": true,
  "courseId": 1,
  "message": "Successfully processed syllabus for CS101: Intro to CS",
  "data": {
    "courseName": "Introduction to Computer Science",
    "courseCode": "CS101",
    "term": "Fall 2024",
    "units": 3,
    "eventsCount": 12
  },
  "extractedData": {
    "course": { ... },
    "grading": { ... },
    "events": [ ... ],
    "policies": { ... }
  }
}
```

---

## Installation

### Backend Dependencies

```bash
cd backend
npm install
```

New dependencies added:
- `multer` - File upload middleware
- `pdf-parse` - PDF text extraction
- `@types/multer` - TypeScript types
- `@types/pdf-parse` - TypeScript types

### Frontend (no new dependencies)

The frontend uses only React built-ins (FormData API).

---

## Usage Guide

### 1. Start the Backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3001`

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. Upload a Syllabus

1. Open `http://localhost:5173`
2. Choose input mode:
   - Click **"📎 Upload File"** to upload a PDF
   - Click **"📝 Paste Text"** to paste text directly
3. Select/paste your syllabus
4. Click **"🚀 Analyze Syllabus"**
5. View the comprehensive summary!

---

## Summary Display Features

### Course Information Card
- Course name and code
- Term/semester
- Unit count

### Grading Breakdown (Visual)
- Color-coded percentage bars
- Shows homework, tests, projects, quizzes
- Displays total percentage

### Course Events Table
- Grouped by event type (Homework, Tests, Projects, Quizzes)
- Shows name, release date, due date, weight
- Formatted dates (e.g., "Sep 15, 2024")

### Course Policies
- Late day allowances (total and per assignment)
- GenAI policy (allowed/not allowed + notes)

---

## File Structure Updates

### New Files

```
backend/src/services/pdf.ts          # PDF extraction service
frontend/src/components/SyllabusSummary.tsx  # Summary display component
```

### Modified Files

```
backend/package.json                 # Added multer, pdf-parse
backend/src/routes/syllabus.ts      # Added file upload support
frontend/src/components/SyllabusUpload.tsx  # Added file upload UI
frontend/src/types/syllabus.ts      # Added full data types
```

---

## Error Handling

The system now handles:
- **File size limit** - Max 10MB (413 error)
- **Invalid file types** - Only PDF and TXT allowed (400 error)
- **Empty PDFs** - Detects PDFs with too little text (400 error)
- **PDF parsing errors** - Graceful error messages

---

## Example Screenshots

### Upload Interface
- Mode toggle (File/Text)
- File input with size display
- Analyze button

### Success Summary
- Green success banner
- Course info grid
- Visual grading breakdown
- Events table
- Policies section

---

## Testing

### Test with PDF
```bash
# Create a test PDF or use an existing syllabus
curl -X POST http://localhost:3001/api/upload-syllabus \
  -F "file=@test-syllabus.pdf"
```

### Test with Text
```bash
curl -X POST http://localhost:3001/api/upload-syllabus \
  -H "Content-Type: application/json" \
  -d '{
    "syllabusText": "Course: CS101 - Introduction to Computer Science\nTerm: Fall 2024\nUnits: 3\n\nGrading:\n- Homework: 40%\n- Tests: 30%\n- Project: 20%\n- Quizzes: 10%\n\nAssignments:\n- HW1: Due Sep 15, 2024 (10%)\n- HW2: Due Sep 29, 2024 (10%)\n\nLate Policy: 5 late days total, 2 per assignment\n\nGenAI Policy: ChatGPT allowed for debugging only"
  }'
```

---

## Production Considerations

For production deployment:

1. **File Storage** - Consider storing uploaded PDFs in S3/Cloud Storage
2. **File Validation** - Add virus scanning, size limits per user tier
3. **Rate Limiting** - Limit uploads per user/IP
4. **PDF Quality** - Handle scanned PDFs with OCR (tesseract.js)
5. **Large Files** - Stream large PDFs instead of loading into memory
6. **Caching** - Cache PDF extraction results

---

## Troubleshooting

### "PDF appears to be empty"
- PDF might be scanned (image-based) rather than text-based
- Use OCR tools to extract text from image-based PDFs

### "File too large"
- Max file size is 10MB
- Compress PDF or extract text manually

### "Only PDF and text files allowed"
- Check file extension and MIME type
- Ensure file is actually a PDF (not renamed)

---

## Next Steps

Potential enhancements:
- [ ] OCR support for scanned PDFs
- [ ] Batch upload (multiple syllabi at once)
- [ ] Export to CSV/JSON
- [ ] Calendar integration (Google Calendar, iCal)
- [ ] Email notifications for upcoming deadlines
- [ ] Mobile-responsive design

---

## Summary

✅ PDF upload fully implemented
✅ Automatic text extraction
✅ Beautiful summary display
✅ Dual input modes (file/text)
✅ Comprehensive error handling
✅ Ready for production deployment

The system is now fully functional for PDF syllabus analysis!
