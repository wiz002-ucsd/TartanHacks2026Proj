# Mastery Tracking System - Quick Start

## 🎯 What This System Does

Adds **learning-aware intelligence** to your AI advisor by tracking:
- ✅ Semester progress (how far into term)
- ✅ Topic mastery (0.0-1.0 understanding depth)
- ✅ Urgency detection (deadline × mastery × weight)
- ✅ Risk flagging (patterns needing intervention)

## 📦 What's Included

| File | Purpose | Contains LLM? |
|------|---------|---------------|
| `mastery_context_builder.py` | Deterministic context assembly | ❌ No |
| `mastery_prompt_template.py` | LLM instruction template | ❌ No |
| `example_mastery_integration.py` | End-to-end integration demo | ✅ Yes (calls LLM) |
| `MASTERY_SYSTEM_GUIDE.md` | Complete documentation | N/A |
| `QUICK_START.md` | This file | N/A |

## ⚡ Quick Integration (3 Steps)

### Step 1: Database Setup

Add these tables to Supabase:

```sql
-- Store mastery scores per topic
CREATE TABLE topic_mastery (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    topic_id INT NOT NULL,
    mastery_score FLOAT CHECK (mastery_score >= 0 AND mastery_score <= 1),
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, topic_id)
);

-- Track quizzes per topic
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL,
    name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    weight FLOAT DEFAULT 10
);

-- Link topics to courses
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    name TEXT NOT NULL
);

-- Add topic_id to existing assignments/events
ALTER TABLE assignments ADD COLUMN topic_id INT;
ALTER TABLE events ADD COLUMN topic_id INT;
```

### Step 2: Integrate Into Your AI Advisor

Replace your existing `get_ai_advisor.py` logic with:

```python
from mastery_context_builder import MasteryContextBuilder
from mastery_prompt_template import build_mastery_aware_prompt

async def get_ai_advisor_response():
    # 1. Fetch data via MCP (existing pattern)
    courses_data = await query_supabase("courses")
    topics_data = await query_supabase("topics")
    mastery_data = await query_supabase("topic_mastery")  # NEW
    assignments_data = await query_supabase("assignments")
    quizzes_data = await query_supabase("quizzes")  # NEW
    events_data = await query_supabase("events")

    # 2. Build learning context (deterministic)
    builder = MasteryContextBuilder()
    context = builder.build_learning_context(
        courses_data=courses_data,
        topics_data=topics_data,
        mastery_data=mastery_data,
        assignments_data=assignments_data,
        quizzes_data=quizzes_data,
        events_data=events_data
    )

    # 3. Build mastery-aware prompt
    prompt = build_mastery_aware_prompt(context)

    # 4. Get LLM response
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

    return {
        "context": context,
        "advice": response.choices[0].message.content
    }
```

### Step 3: Seed Initial Mastery Data

```sql
-- Seed with default 0.5 mastery for all topics
INSERT INTO topic_mastery (student_id, topic_id, mastery_score)
SELECT 1 AS student_id, id AS topic_id, 0.5 AS mastery_score
FROM topics;

-- Or manually set specific mastery levels
INSERT INTO topic_mastery (student_id, topic_id, mastery_score)
VALUES
    (1, 1, 0.35),  -- Low mastery
    (1, 2, 0.72),  -- Good mastery
    (1, 3, 0.45);  -- Medium mastery
```

## 🧪 Test It

```bash
cd /Users/williamzhang/startups/TartanHacks2026Proj/backend/dist/MCP
python3 example_mastery_integration.py
```

Expected output:
```
STEP 1: DATA FETCHING via MCP
  → Querying courses...
  → Querying topics...
  → Querying topic_mastery...
  ✅ Data fetched: 3 courses, 12 topics, 12 mastery records

STEP 2: CONTEXT ASSEMBLY
  🧠 Building learning-aware context...
  ✅ Context built:
     - Semester progress: 62%
     - Total topics: 12
     - Average mastery: 0.58
     - Critical topics: 2

STEP 3: PROMPT ENGINEERING
  📝 Building mastery-aware LLM prompt...
  ✅ Prompt built (4521 characters)

STEP 4: LLM REASONING
  🤖 Sending to OpenAI GPT-4...
  ✅ AI response generated

STEP 5: STUDENT-FACING OUTPUT
  [Your personalized study plan here]
```

## 🔮 Future: Add Quiz/Flashcard Updates

When you build quiz or flashcard features, call these hooks:

```python
from mastery_context_builder import (
    update_mastery_from_quiz,
    update_mastery_from_flashcards
)

# After quiz completion
update_mastery_from_quiz(
    student_id=1,
    topic_id=5,
    quiz_result={'score': 0.85, 'difficulty': 'medium'},
    supabase_client=supabase
)

# After flashcard session
update_mastery_from_flashcards(
    student_id=1,
    topic_id=5,
    flashcard_session={
        'cards_reviewed': 20,
        'correct_count': 15,
        'confidence_ratings': [4, 5, 3, 4, 5, ...]
    },
    supabase_client=supabase
)
```

## 📊 Architecture Recap

```
┌─────────────────────────────────────────────────────────────┐
│ Student Request: "What should I study?"                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ [1] MCP Layer (PostgREST via Dedalus)                      │
│     → Query courses, topics, mastery, assignments, etc.     │
│     → Returns raw database rows                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ (raw data)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ [2] Context Builder (mastery_context_builder.py)           │
│     → Compute semester progress                             │
│     → Calculate topic urgency                               │
│     → Detect risk patterns                                  │
│     → NO LLM CALLS                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ (structured context)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ [3] Prompt Template (mastery_prompt_template.py)           │
│     → Encode learning science rules                         │
│     → Format context for LLM                                │
│     → Define output structure                               │
│     → NO LLM CALLS                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ (instructed prompt)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ [4] LLM Reasoning (OpenAI GPT-4)                           │
│     → Interpret mastery levels                              │
│     → Generate personalized recommendations                 │
│     → Create study schedule                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ (natural language advice)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ [5] Student-Facing Output                                   │
│     → Supportive, actionable study plan                     │
│     → Priority topics with reasoning                        │
│     → Specific learning strategies                          │
└─────────────────────────────────────────────────────────────┘
```

## 🎓 Key Design Principles

1. **Separation of Concerns**: Data fetching ≠ Intelligence ≠ Reasoning
2. **No MCP Redesign**: MCP remains a simple data layer
3. **Deterministic Context**: All learning logic is explicit, not hidden in prompts
4. **Future-Proof**: Quiz/flashcard hooks ready for implementation
5. **Learning Science**: Time-aware, weight-aware, evidence-based recommendations

## 📚 Full Documentation

See `MASTERY_SYSTEM_GUIDE.md` for:
- Complete database schema
- Detailed API examples
- Quiz/flashcard integration patterns
- Testing procedures
- Deployment checklist

---

**Questions?** Review `example_mastery_integration.py` for a working end-to-end example.

**Ready to deploy?** Follow the 3-step integration above and test with sample data.

🚀 **Your AI advisor is now learning-science powered!**
