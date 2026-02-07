"""
AI Advisor Module
=================
Takes semantic snapshots and generates intelligent recommendations.
This is where the LLM reasoning happens - OUTSIDE the database.
"""

from typing import Dict, Any
import json
from openai import OpenAI


class AcademicAIAdvisor:
    """Generates AI-powered academic summaries and recommendations."""

    def __init__(self, api_key: str):
        """
        Initialize AI advisor with OpenAI API key.

        Args:
            api_key: OpenAI API key
        """
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o"  # Using GPT-4 Optimized

    def generate_summary(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive academic summary from snapshot.

        Args:
            snapshot: Semantic snapshot from ContextBuilder

        Returns:
            Dictionary containing:
            - summary: Overall workload summary
            - risks: Top 3 risks identified
            - recommendations: Actionable next steps
            - priority_order: Suggested task ordering
        """
        prompt = self._build_prompt(snapshot)

        response = self.client.chat.completions.create(
            model=self.model,
            max_tokens=2000,
            temperature=0.7,
            messages=[
                {
                    "role": "system",
                    "content": self._get_system_prompt()
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}  # Request JSON output
        )

        # Parse structured response
        analysis = self._parse_response(response.choices[0].message.content)

        return analysis

    def _get_system_prompt(self) -> str:
        """Define the AI advisor's role and constraints."""
        return """You are an academic advisor AI assistant helping college students manage their workload.

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

IMPORTANT: You MUST respond with a valid JSON object with these exact fields:
{
  "summary": "2-3 sentence overview of current academic state",
  "risks": [
    "Risk 1: Specific concern with timeline",
    "Risk 2: Another specific concern",
    "Risk 3: Third concern if applicable"
  ],
  "recommendations": [
    "Action 1: Specific, actionable step with deadline",
    "Action 2: Another specific step",
    "Action 3: Additional recommendation"
  ],
  "priority_order": [
    {
      "task": "Specific assignment name",
      "reason": "Why this should be done first",
      "deadline": "Date or 'in X days'"
    }
  ],
  "study_tips": [
    "Tip 1: Specific study strategy for upcoming work",
    "Tip 2: Time management suggestion"
  ]
}

Be student-friendly but professional. Return ONLY valid JSON, no other text."""

    def _build_prompt(self, snapshot: Dict[str, Any]) -> str:
        """
        Build LLM prompt from semantic snapshot.

        The snapshot is already structured - we just need to present it clearly.
        """
        # Format snapshot for readability
        snapshot_json = json.dumps(snapshot, indent=2, default=str)

        prompt = f"""Given this student's academic snapshot, generate a comprehensive analysis.

STUDENT ACADEMIC SNAPSHOT:
{snapshot_json}

Please analyze this data and provide:

1. **Summary**: A clear 2-3 sentence overview of their current workload and academic state

2. **Top 3 Risks**: The most critical concerns (deadline clustering, heavy workload windows, high-stakes exams, etc.)

3. **Actionable Recommendations**: Specific steps they should take in the next 7 days, prioritized by urgency and impact

4. **Priority Order**: The optimal order to tackle their upcoming assignments, with reasoning

5. **Study Tips**: Specific strategies for managing their current workload

Focus on being helpful and actionable. Return your response as a valid JSON object matching the specified format."""

        return prompt

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse LLM response into structured format.

        Args:
            response_text: Raw text response from Claude

        Returns:
            Structured analysis dictionary
        """
        try:
            # Try to parse as JSON first
            # Claude should return JSON based on system prompt
            analysis = json.loads(response_text)
            return analysis
        except json.JSONDecodeError:
            # Fallback: extract JSON from markdown code blocks
            if "```json" in response_text:
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                json_str = response_text[start:end].strip()
                try:
                    return json.loads(json_str)
                except:
                    pass

            # Last resort: return raw text in structured format
            return {
                "summary": response_text[:200],
                "risks": ["Unable to parse structured response"],
                "recommendations": [response_text],
                "priority_order": [],
                "study_tips": []
            }

    def format_for_display(self, analysis: Dict[str, Any]) -> str:
        """
        Format AI analysis for student-friendly display.

        Args:
            analysis: Structured analysis from generate_summary()

        Returns:
            Formatted string suitable for display
        """
        output = []

        # Header
        output.append("=" * 60)
        output.append("📚 YOUR ACADEMIC SUMMARY & RECOMMENDATIONS")
        output.append("=" * 60)
        output.append("")

        # Summary
        output.append("📊 WORKLOAD OVERVIEW")
        output.append("-" * 60)
        output.append(analysis.get("summary", "No summary available"))
        output.append("")

        # Risks
        if analysis.get("risks"):
            output.append("⚠️  TOP RISKS TO WATCH")
            output.append("-" * 60)
            for i, risk in enumerate(analysis["risks"], 1):
                output.append(f"{i}. {risk}")
            output.append("")

        # Recommendations
        if analysis.get("recommendations"):
            output.append("✅ ACTIONABLE RECOMMENDATIONS")
            output.append("-" * 60)
            for i, rec in enumerate(analysis["recommendations"], 1):
                output.append(f"{i}. {rec}")
            output.append("")

        # Priority order
        if analysis.get("priority_order"):
            output.append("🎯 SUGGESTED PRIORITY ORDER")
            output.append("-" * 60)
            for i, item in enumerate(analysis["priority_order"], 1):
                task = item.get("task", "Unknown task")
                reason = item.get("reason", "")
                deadline = item.get("deadline", "")
                output.append(f"{i}. {task}")
                if deadline:
                    output.append(f"   Deadline: {deadline}")
                if reason:
                    output.append(f"   Why: {reason}")
                output.append("")

        # Study tips
        if analysis.get("study_tips"):
            output.append("💡 STUDY TIPS")
            output.append("-" * 60)
            for tip in analysis["study_tips"]:
                output.append(f"• {tip}")
            output.append("")

        # Footer
        output.append("=" * 60)
        output.append("Generated by AI Academic Advisor")
        output.append("=" * 60)

        return "\n".join(output)
