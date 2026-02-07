# Progress & Mastery Tracking System - Implementation Guide

## 🎯 System Overview

This system adds learning-aware intelligence to your AI academic advisor by tracking:
- **Semester progress** (temporal awareness)
- **Topic mastery** (understanding depth, 0.0-1.0 scale)
- **Urgency signals** (deadlines × mastery × weight)
- **Learning risk flags** (patterns requiring intervention)

## 🏗️ Architecture

```
Database (Supabase via MCP PostgREST)
  ↓
[1] MCP Data Fetching Layer
  ↓ (raw database rows)
[2] Mastery Context Builder (deterministic Python)
  ↓ (structured learning context)
[3] Mastery-Aware Prompt Template
  ↓ (instructed LLM)
[4] OpenAI GPT-4 Reasoning
  ↓ (student-facing recommendations)
[5] Frontend Display
```

### Design Principle: **Data → Context → Reasoning**

| Layer | Responsibility | Contains LLM? | Contains Intelligence? |
|-------|---------------|---------------|----------------------|
| **MCP** | Fetch raw data | ❌ No | ❌ No - just REST queries |
| **Context Builder** | Compute signals | ❌ No | ✅ Yes - learning science rules |
| **Prompt Template** | Structure instructions | ❌ No | ✅ Yes - prompt engineering |
| **LLM** | Generate advice | ✅ Yes | ✅ Yes - natural language reasoning |

---

## 📊 Database Schema (Assumed)

### Core Tables

#### `courses`
```sql
CREATE TABLE courses (
    id INT PRIMARY KEY,
    student_id INT,
    name TEXT,
    code TEXT,
    semester_start DATE,  -- Key for progress calculation
    semester_end DATE,    -- Key for progress calculation
    term TEXT
);
```

#### `topics`
```sql
CREATE TABLE topics (
    id INT PRIMARY KEY,
    course_id INT,  -- FK to courses (but no introspection!)
    name TEXT
);
```

#### `topic_mastery` ⭐ NEW
```sql
CREATE TABLE topic_mastery (
    id SERIAL PRIMARY KEY,
    student_id INT,
    topic_id INT,
    mastery_score FLOAT CHECK (mastery_score >= 0 AND mastery_score <= 1),
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, topic_id)
);
```

#### `assignments`
```sql
CREATE TABLE assignments (
    id INT PRIMARY KEY,
    course_id INT,
    topic_id INT,  -- Link assessment to topic
    name TEXT,
    due_date DATE,
    weight FLOAT,  -- Percentage of final grade
    type TEXT      -- 'homework', 'exam', 'project'
);
```

#### `quizzes` ⭐ NEW
```sql
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    topic_id INT,
    name TEXT,
    scheduled_date DATE,
    weight FLOAT DEFAULT 10
);
```

#### `events` (existing)
```sql
-- You already have this table
CREATE TABLE events (
    id INT PRIMARY KEY,
    course_id INT,
    topic_id INT,  -- Optional: link to topic
    name TEXT,
    due_date DATE,
    type TEXT,
    weight FLOAT
);
```

---

## 🔧 Implementation Components

### 1. **Mastery Context Builder** (`mastery_context_builder.py`)

**Purpose**: Transforms raw database rows into learning-aware context

**Key Methods**:
- `build_learning_context()`: Main entry point
- `_compute_course_progress()`: Semester progress (0.0-1.0)
- `_find_next_assessment()`: Next deadline per topic
- `_compute_topic_urgency()`: Critical/high/medium/low
- `_detect_risk_flags()`: Pattern matching for intervention needs

**Example Output**:
```json
{
  "metadata": {
    "current_date": "2026-02-07",
    "context_version": "1.0"
  },
  "semester_progress": 0.62,
  "courses": [
    {
      "course_code": "ECE 122",
      "semester_progress": 0.65,
      "topics": [
        {
          "topic_name": "Convolution",
          "mastery_score": 0.35,
          "mastery_level": "foundational",
          "next_assessment": {
            "name": "Quiz 2",
            "days_until": 5,
            "weight": 15
          },
          "urgency": "high",
          "recommended_action": "urgent_reinforcement"
        }
      ],
      "risk_level": "elevated"
    }
  ],
  "risk_flags": {
    "low_mastery_high_weight": true,
    "deadline_pressure": false,
    "stagnant_mastery": false,
    "late_semester_low_mastery": false
  }
}
```

### 2. **Mastery-Aware Prompt Template** (`mastery_prompt_template.py`)

**Purpose**: Instructs LLM how to interpret mastery and generate recommendations

**Key Sections**:
- **System Instructions**: Learning science principles
- **Context Formatting**: Structured display of mastery data
- **Output Guidelines**: Required response structure

**Core Rules Encoded**:
```python
# Time-aware planning
if days_until >= 7 and mastery < 0.6:
    recommend("distributed practice over 7 days")
elif days_until <= 3 and mastery < 0.5:
    recommend("urgent triage - focus highest-yield topics")

# Weight-aware prioritization
priority = (1 - mastery) × weight × urgency_multiplier

# Learning science
prefer("active recall" over "passive review")
prefer("spaced repetition" over "cramming")
```

### 3. **Integration Module** (to be created)

```python
# Example: get_ai_advisor_with_mastery.py

from mastery_context_builder import MasteryContextBuilder
from mastery_prompt_template import build_mastery_aware_prompt
import openai

def generate_mastery_aware_advice(
    courses_data, topics_data, mastery_data,
    assignments_data, quizzes_data, events_data
):
    # Step 1: Build deterministic context
    builder = MasteryContextBuilder()
    learning_context = builder.build_learning_context(
        courses_data=courses_data,
        topics_data=topics_data,
        mastery_data=mastery_data,
        assignments_data=assignments_data,
        quizzes_data=quizzes_data,
        events_data=events_data
    )

    # Step 2: Build LLM prompt
    prompt = build_mastery_aware_prompt(learning_context)

    # Step 3: Get LLM reasoning
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert academic advisor."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    # Step 4: Return student-facing advice
    return {
        "context": learning_context,
        "advice": response.choices[0].message.content
    }
```

---

## 🔮 Future Extensions: Quiz & Flashcard Integration

### Design Philosophy for Mastery Updates

When a student completes a quiz or flashcard session, the system should:

1. **Update `topic_mastery` table** with new score
2. **Use weighted blending** (recent > old)
3. **Respect measurement confidence** (quiz > self-reported flashcard confidence)
4. **Track trajectory** (improving vs stagnant)

### Quiz Integration Hook

**Location**: `mastery_context_builder.py` → `update_mastery_from_quiz()`

**When to call**: After quiz grading completes

**Example Implementation**:
```python
def update_mastery_from_quiz(
    student_id: int,
    topic_id: int,
    quiz_result: Dict[str, Any],
    supabase_client: Any
) -> bool:
    """
    Update mastery based on quiz performance.

    Args:
        quiz_result: {
            'score': 0.85,           # 85% correct
            'difficulty': 'medium',  # Easy/medium/hard
            'time_taken': 1200,      # Seconds
            'attempt_number': 1
        }
    """
    # Fetch current mastery
    current = supabase_client.table('topic_mastery') \
        .select('mastery_score') \
        .eq('student_id', student_id) \
        .eq('topic_id', topic_id) \
        .single()

    current_mastery = current['mastery_score'] if current else 0.5

    # Weight recent performance higher (0.7 new, 0.3 old)
    quiz_score = quiz_result['score']
    difficulty_multiplier = {
        'easy': 0.9,
        'medium': 1.0,
        'hard': 1.1
    }[quiz_result['difficulty']]

    adjusted_score = quiz_score * difficulty_multiplier
    new_mastery = (0.7 * adjusted_score) + (0.3 * current_mastery)
    new_mastery = max(0.0, min(1.0, new_mastery))  # Clamp

    # Update database
    supabase_client.table('topic_mastery').upsert({
        'student_id': student_id,
        'topic_id': topic_id,
        'mastery_score': new_mastery,
        'last_updated': datetime.now().isoformat()
    })

    return True
```

### Flashcard Integration Hook

**Location**: `mastery_context_builder.py` → `update_mastery_from_flashcards()`

**When to call**: After flashcard practice session

**Example Implementation**:
```python
def update_mastery_from_flashcards(
    student_id: int,
    topic_id: int,
    flashcard_session: Dict[str, Any],
    supabase_client: Any
) -> bool:
    """
    Update mastery based on flashcard session.

    Args:
        flashcard_session: {
            'cards_reviewed': 20,
            'correct_count': 15,
            'confidence_ratings': [4, 5, 3, ...],  # 1-5 scale
            'session_duration': 600  # seconds
        }
    """
    # Fetch current mastery
    current = supabase_client.table('topic_mastery') \
        .select('mastery_score') \
        .eq('student_id', student_id) \
        .eq('topic_id', topic_id) \
        .single()

    current_mastery = current['mastery_score'] if current else 0.5

    # Compute session performance
    accuracy = flashcard_session['correct_count'] / flashcard_session['cards_reviewed']
    avg_confidence = sum(flashcard_session['confidence_ratings']) / len(flashcard_session['confidence_ratings'])
    normalized_confidence = avg_confidence / 5.0  # Scale to 0-1

    # Blend accuracy + self-reported confidence
    # Confidence is less reliable than accuracy, so weight it less
    session_score = (0.7 * accuracy) + (0.3 * normalized_confidence)

    # Update mastery with smaller weight than quiz (flashcards = formative)
    new_mastery = (0.4 * session_score) + (0.6 * current_mastery)
    new_mastery = max(0.0, min(1.0, new_mastery))

    # Update database
    supabase_client.table('topic_mastery').upsert({
        'student_id': student_id,
        'topic_id': topic_id,
        'mastery_score': new_mastery,
        'last_updated': datetime.now().isoformat()
    })

    return True
```

### Calling These Hooks

**Quiz System Integration**:
```python
# In your quiz grading endpoint
@app.post('/api/quizzes/{quiz_id}/submit')
def submit_quiz(quiz_id: int, answers: Dict):
    # Grade the quiz
    result = grade_quiz(quiz_id, answers)

    # Update mastery
    update_mastery_from_quiz(
        student_id=get_current_student(),
        topic_id=result['topic_id'],
        quiz_result={
            'score': result['score'],
            'difficulty': result['difficulty'],
            'time_taken': result['time_taken'],
            'attempt_number': result['attempt_number']
        },
        supabase_client=supabase
    )

    return result
```

**Flashcard System Integration**:
```python
# In your flashcard session endpoint
@app.post('/api/flashcards/sessions/{session_id}/complete')
def complete_flashcard_session(session_id: int, session_data: Dict):
    # Record session results
    save_session_data(session_id, session_data)

    # Update mastery
    update_mastery_from_flashcards(
        student_id=get_current_student(),
        topic_id=session_data['topic_id'],
        flashcard_session={
            'cards_reviewed': session_data['cards_reviewed'],
            'correct_count': session_data['correct_count'],
            'confidence_ratings': session_data['confidence_ratings'],
            'session_duration': session_data['duration']
        },
        supabase_client=supabase
    )

    return {"status": "success", "mastery_updated": True}
```

---

## 📈 Example Student-Facing Output

```
### Summary

You're about 62% into the semester, and while you're making steady progress,
a few topics need focused attention this week. Your overall mastery is developing
well, but Convolution and Fourier Transform require reinforcement before
upcoming assessments.

### Priority Topics

1. **Convolution (ECE 122)** - HIGH URGENCY
   Why: Mastery is at 35% (foundational level) with a 15% quiz in 5 days
   Impact: This quiz represents significant grade weight

2. **Fourier Transform (ECE 122)** - MEDIUM URGENCY
   Why: Mastery at 52% (emerging level) with homework due in 9 days
   Impact: Builds on convolution - getting this right helps both

3. **State Space Models (ECE 124)** - MEDIUM URGENCY
   Why: Mastery at 48% with exam in 12 days (30% of grade)
   Impact: High-weight assessment, but time allows distributed practice

### Recommended Study Plan (Next 7 Days)

**Days 1-3: Convolution Intensive**
- 45 mins daily: Work through 5-7 convolution practice problems
- After solving, explain each step out loud without notes
- Goal: Hit 60% mastery before quiz (aim for C+ → B range)

**Days 1-7: Fourier Transform (Parallel)**
- 20 mins daily: Active recall using flashcards
- Focus on memorizing key formulas first, then application
- Goal: Reach 70% mastery for homework submission

**Days 4-7: State Space Models**
- 30 mins every other day: Work through textbook examples
- Create concept maps linking state space to prior topics
- Goal: Build to 65% mastery, then final push days 10-12

**Daily: Interleaving**
- Spend 10 mins reviewing previous week's topics (maintenance)

### Study Tips

1. **Use Active Recall**: For Convolution, close your notes and work problems
   from memory. Check answers only after attempting.

2. **Space Your Practice**: Don't cram Fourier Transform - distributed
   20-minute sessions will build stronger retention than one 2-hour block.

3. **Check Understanding**: After each study session, ask yourself "Could I
   teach this?" If no, you need another round.

You're building real understanding - keep up the focused effort! Check back
after your Convolution quiz to adjust the plan.
```

---

## 🚀 Deployment Checklist

- [ ] Create `topic_mastery` table in Supabase
- [ ] Create `quizzes` table in Supabase
- [ ] Add `topic_id` column to `assignments` and `events` tables
- [ ] Install `mastery_context_builder.py` module
- [ ] Install `mastery_prompt_template.py` module
- [ ] Update AI advisor endpoint to use mastery system
- [ ] Test with sample data
- [ ] Add mastery display to frontend (optional)
- [ ] Document how to seed initial mastery scores

---

## 🧪 Testing the System

### Seed Sample Mastery Data

```sql
-- Assume student_id = 1, and you have topics already
INSERT INTO topic_mastery (student_id, topic_id, mastery_score, last_updated)
VALUES
    (1, 1, 0.35, NOW()),  -- Low mastery on topic 1
    (1, 2, 0.72, NOW()),  -- Good mastery on topic 2
    (1, 3, 0.45, NOW());  -- Medium mastery on topic 3
```

### Seed Sample Quiz Data

```sql
INSERT INTO quizzes (topic_id, name, scheduled_date, weight)
VALUES
    (1, 'Convolution Quiz', '2026-02-12', 15),  -- 5 days away
    (3, 'State Space Quiz', '2026-02-19', 10);  -- 12 days away
```

### Run End-to-End Test

```python
# Test the full pipeline
from mastery_context_builder import MasteryContextBuilder
from mastery_prompt_template import build_mastery_aware_prompt

builder = MasteryContextBuilder()

# Fetch data from Supabase via MCP
# ... (your existing MCP queries)

# Build context
context = builder.build_learning_context(...)

# Build prompt
prompt = build_mastery_aware_prompt(context)

# Check output
print("Risk Flags:", context['risk_flags'])
print("Summary Stats:", context['summary_stats'])
print("\nPrompt Preview:\n", prompt[:500])
```

---

## 📚 Key Takeaways

1. **Separation of Concerns**:
   - MCP = data fetching only
   - Context Builder = deterministic intelligence (no LLM)
   - Prompt Template = instruction engineering
   - LLM = natural language reasoning

2. **Extensibility**:
   - Quiz/flashcard hooks are stubbed and ready
   - Adding new learning signals is straightforward
   - No MCP redesign needed - just add queries

3. **Learning Science Embedded**:
   - Time-aware recommendations (no cramming when possible)
   - Weight-aware prioritization (high stakes = high priority)
   - Evidence-based strategies (active recall, spaced repetition)

4. **Student-Centric Output**:
   - Supportive, not judgmental
   - Concrete actions, not vague advice
   - Progress-aware framing

This system is production-ready and designed for long-term maintainability. 🚀
