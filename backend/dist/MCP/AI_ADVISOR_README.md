# AI Academic Advisor - Technical Documentation

## 🎯 Overview

This implements an **AI Context Assembly Layer** that generates intelligent academic summaries and recommendations for students.

### Architecture

```
MCP (PostgREST)
  ↓
Context Builder (Python)
  ↓
LLM Reasoning (GPT-4)
  ↓
Student Summary & Recommendations
```

**Key Principle**:
> Databases store facts. Intelligence lives above them.

## 📐 Design Constraints (Strictly Followed)

✅ **What we DO**:
- Query MCP using PostgREST (table queries only)
- Assemble semantic snapshots in code
- Send snapshots to LLM for analysis
- Generate actionable recommendations

❌ **What we DON'T do**:
- Direct Postgres access
- Schema introspection
- `information_schema` queries
- System table access
- "Summarize the database" queries
- Change MCP configuration

## 🧱 System Components

### 1. Context Builder (`context_builder.py`)

**Purpose**: Query MCP and assemble semantic snapshots

**Key Functions**:
- `get_all_courses()` - Fetch all courses
- `get_upcoming_events(days=14)` - Fetch deadlines in next N days
- `get_grading_breakdown()` - Fetch grading policies
- `get_course_policies()` - Fetch late day policies, AI usage rules
- `build_student_snapshot()` - Assemble complete semantic snapshot

**Example MCP Queries Used**:

```python
# Query 1: Get all courses
"Get all courses from the courses table. Return all columns."
# Translates to: SELECT * FROM courses

# Query 2: Get upcoming events
"Get all events from the events table where due_date is between
'2026-02-07' and '2026-02-21'. Order by due_date ascending."
# Translates to: SELECT * FROM events WHERE due_date BETWEEN ... ORDER BY due_date

# Query 3: Get grading policies
"Get all grading policies from the grading_policies table.
Include course_id, category, and weight."
# Translates to: SELECT course_id, category, weight FROM grading_policies

# Query 4: Get course policies
"Get all course policies from the course_policies table."
# Translates to: SELECT * FROM course_policies
```

**Semantic Snapshot Structure**:

```json
{
  "student_overview": {
    "active_courses": 4,
    "upcoming_deadlines": 6,
    "high_risk_window": true,
    "high_risk_weeks": ["Week 1"],
    "snapshot_date": "2026-02-07"
  },
  "courses": [
    {
      "name": "Introduction to AI",
      "code": "ECE 122",
      "instructor": "Dr. Smith",
      "upcoming_count": 2,
      "upcoming": [
        {
          "name": "Midterm Exam",
          "type": "test",
          "due_date": "2026-02-12",
          "days_until": 5,
          "weight": 25.0
        }
      ],
      "load_estimate": "high"
    }
  ],
  "risk_analysis": {
    "deadline_clustering": true,
    "clustered_weeks": {
      "Week 0": 3
    },
    "highest_priority": [
      {
        "name": "ECE 141 Final Project",
        "type": "project",
        "days_until": 4,
        "weight": 40.0
      }
    ]
  },
  "timeline": {
    "next_7_days": [...],
    "next_14_days": [...]
  }
}
```

### 2. AI Advisor (`ai_advisor.py`)

**Purpose**: Generate intelligent summaries using LLM

**Key Functions**:
- `generate_summary(snapshot)` - Send snapshot to GPT-4 for analysis
- `format_for_display(analysis)` - Format output for students

**LLM Prompt Template**:

```
System Prompt:
--------------
You are an academic advisor AI assistant helping college students manage their workload.

Your role:
- Analyze academic snapshots to identify risks and opportunities
- Provide actionable, specific recommendations
- Prioritize tasks based on deadlines, weights, and difficulty
- Warn about deadline clustering and overload
- Suggest study strategies and time management tips

Guidelines:
- Be concise but supportive
- Focus on the next 7-14 days
- Prioritize high-weight assignments
- Account for difficulty (exams > projects > homework)
- Consider late day policies when relevant
- Be realistic about time constraints

Output format: JSON with summary, risks, recommendations, priority_order, study_tips


User Prompt:
------------
Given this student's academic snapshot, generate a comprehensive analysis.

STUDENT ACADEMIC SNAPSHOT:
{snapshot_json}

Please analyze this data and provide:
1. Summary: 2-3 sentence overview of workload
2. Top 3 Risks: Critical concerns (clustering, heavy windows, high-stakes exams)
3. Actionable Recommendations: Specific steps for next 7 days
4. Priority Order: Optimal task ordering with reasoning
5. Study Tips: Strategies for managing current workload
```

**AI Response Structure**:

```json
{
  "summary": "You have a heavy workload in the next week...",
  "risks": [
    "Risk 1: Deadline clustering - 3 assignments in 7 days",
    "Risk 2: High-stakes project worth 40% due in 4 days",
    "Risk 3: Midterm conflicts with project deadline"
  ],
  "recommendations": [
    "Action 1: Prioritize ECE 141 Final Project - allocate next 3 days",
    "Action 2: Begin midterm review on Day 4 after project submission",
    "Action 3: Complete lower-weight homework after midterm"
  ],
  "priority_order": [
    {
      "task": "ECE 141 Final Project",
      "reason": "Highest weight (40%), earliest deadline, needs 20-30 hours",
      "deadline": "in 4 days"
    }
  ],
  "study_tips": [
    "Block 8-10 hours per day for next 3 days on project",
    "Use Pomodoro technique to maintain productivity"
  ]
}
```

### 3. Demo Script (`demo_ai_advisor.py`)

**Purpose**: End-to-end demonstration for judges

**Flow**:
1. Initialize MCP connection
2. Query MCP for academic data
3. Assemble semantic snapshot
4. Generate AI recommendations
5. Display student-friendly output
6. Show technical details

## 🚀 Usage

### Prerequisites

```bash
# Install dependencies
pip install dedalus-labs openai python-dotenv

# Set environment variables in .env
DEDALUS_API_KEY=your_dedalus_key
DEDALUS_API_URL=https://api.dedaluslabs.ai/v1
DEDALUS_AS_URL=https://as.dedaluslabs.ai
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_SECRET_KEY=your_supabase_service_key
```

### Run Demo

```bash
cd backend/dist/MCP
python demo_ai_advisor.py
```

### Use in Your Code

```python
from context_builder import AcademicContextBuilder
from ai_advisor import AcademicAIAdvisor

# Initialize
builder = AcademicContextBuilder(mcp_runner, credentials)
advisor = AcademicAIAdvisor(openai_api_key)

# Generate recommendations
snapshot = await builder.build_student_snapshot()
analysis = advisor.generate_summary(snapshot)
formatted = advisor.format_for_display(analysis)

print(formatted)
```

## 📊 Example Output

```
============================================================
📚 YOUR ACADEMIC SUMMARY & RECOMMENDATIONS
============================================================

📊 WORKLOAD OVERVIEW
------------------------------------------------------------
You have a heavy workload in the next week with two major
deadlines clustered within 5 days. The ECE 141 final project
(40% of grade) and ECE 122 midterm (25% of grade) are your
highest priorities.

⚠️  TOP RISKS TO WATCH
------------------------------------------------------------
1. Risk 1: Deadline clustering - 3 major assignments due
   within 7 days, creating a high-pressure window
2. Risk 2: ECE 141 Final Project due in 4 days carries 40%
   of your course grade - highest stakes assignment
3. Risk 3: ECE 122 Midterm in 5 days requires significant
   study time while finishing the project

✅ ACTIONABLE RECOMMENDATIONS
------------------------------------------------------------
1. Action 1: Prioritize ECE 141 Final Project immediately -
   allocate next 3 days (72 hours) to completion
2. Action 2: Begin ECE 122 Midterm review on Day 4 after
   project submission
3. Action 3: Complete ECE 122 Homework 3 this weekend -
   lower weight and more time available

🎯 SUGGESTED PRIORITY ORDER
------------------------------------------------------------
1. ECE 141 Final Project
   Deadline: in 4 days
   Why: Highest weight (40%), earliest deadline, needs 20-30 hours

2. ECE 122 Midterm Exam
   Deadline: in 5 days
   Why: Second highest weight (25%), exam requires focused study

3. ECE 122 Homework 3
   Deadline: in 7 days
   Why: Lower weight (10%), can be done after higher priorities

💡 STUDY TIPS
------------------------------------------------------------
• Block 8-10 hours per day for next 3 days on ECE 141 project
• Create 1-page midterm study guide each evening
• Use Pomodoro technique (25 min focus + 5 min break)
• Schedule buffer time in case project takes longer

============================================================
🤖 Generated by AI Academic Advisor
============================================================
```

## 🏗️ Architecture Deep Dive

### Layer 1: MCP (Data Source)

- **Role**: Provide read-only access to Supabase via PostgREST
- **Capabilities**: Table queries, exposed RPCs
- **Limitations**: No schema introspection, no system tables
- **Configuration**: Unchanged from existing setup

### Layer 2: Context Builder (Data Aggregation)

- **Role**: Query MCP and structure data semantically
- **Logic**:
  - Deterministic analysis (deadline clustering, load estimation)
  - No LLM calls
  - Pure data transformation
- **Output**: JSON snapshot ready for LLM

### Layer 3: LLM (Intelligence)

- **Role**: Analyze snapshot and generate recommendations
- **Model**: GPT-4 Optimized (gpt-4o)
- **Input**: Structured snapshot (not raw database)
- **Output**: Actionable advice, risks, priorities

### Layer 4: Display (User Interface)

- **Role**: Format AI analysis for students
- **Features**: Color coding, urgency indicators, clear sections
- **Audience**: Students and judges

## 🎓 Key Innovations

1. **Semantic Snapshots**: Transform raw data into meaningful context before LLM sees it

2. **Deadline Clustering Detection**: Automatically identify high-risk weeks with 3+ deadlines

3. **Load Estimation**: Classify course load (high/medium/low) based on upcoming events

4. **Priority Ordering**: LLM suggests optimal task sequence based on:
   - Deadlines (urgency)
   - Weights (impact)
   - Effort estimates (feasibility)

5. **Actionable Recommendations**: Specific steps with timelines, not vague advice

## 🔒 Security & Best Practices

- ✅ MCP credentials encrypted via DAuth
- ✅ No raw database access
- ✅ Read-only queries (PostgREST)
- ✅ API keys in environment variables
- ✅ Input validation on MCP responses
- ✅ Error handling with fallbacks

## 📈 Future Enhancements

- **Student-Specific Data**: Add `student_id` filter to queries
- **Historical Analysis**: Track progress over time
- **Calendar Integration**: Sync with Google Calendar
- **Study Group Suggestions**: Match students with similar courses
- **Difficulty Prediction**: ML model to estimate assignment difficulty
- **Time Tracking**: Actual vs estimated time on assignments

## 🎯 For Judges

**What makes this innovative:**

1. **Clean Architecture**: Separation of concerns (data ↔ logic ↔ intelligence)
2. **LLM-Ready Design**: Structured snapshots enable better AI reasoning
3. **Production-Ready**: Error handling, logging, extensible design
4. **Student-Centric**: Focus on actionable insights, not raw data
5. **Respects Constraints**: Works within MCP/PostgREST limitations

**Technical Highlights:**

- Async/await for parallel MCP queries
- Deterministic risk analysis (no AI needed for clustering detection)
- JSON schema validation for LLM responses
- Graceful degradation when API keys unavailable

**Demo Value:**

- Shows complete pipeline: data → context → intelligence → display
- Real MCP queries (not mocked)
- Judge-friendly output with technical details
- Easy to extend and customize

## 📝 Files Summary

| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `context_builder.py` | Query MCP & build snapshots | ~300 | Async queries, semantic structuring |
| `ai_advisor.py` | LLM integration | ~250 | Prompt templates, JSON parsing |
| `demo_ai_advisor.py` | End-to-end demo | ~400 | Complete flow, mock data fallback |
| `AI_ADVISOR_README.md` | Documentation | - | Architecture, usage, examples |

## 🚀 Quick Start Checklist

- [ ] Install dependencies: `pip install dedalus-labs anthropic python-dotenv`
- [ ] Set up `.env` file with API keys
- [ ] Verify MCP connection: `python main.py`
- [ ] Run demo: `python demo_ai_advisor.py`
- [ ] Review output and technical details
- [ ] Customize for your use case

---

**Philosophy**: Databases store facts. Intelligence lives above them.

This implementation embodies that principle.
