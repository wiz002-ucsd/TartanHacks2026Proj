"""
API Integration Example
=======================
Shows how to expose the AI Academic Advisor as a REST API endpoint.

This can be integrated into your existing Flask/FastAPI backend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
from dotenv import load_dotenv

from dedalus_labs import AsyncDedalus, DedalusRunner
from connection import supabase_mcp_secrets
from context_builder import AcademicContextBuilder
from ai_advisor import AcademicAIAdvisor

load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="AI Academic Advisor API")

# Add CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Response models
class SnapshotResponse(BaseModel):
    """Student academic snapshot."""
    student_overview: dict
    courses: list
    risk_analysis: dict
    timeline: dict


class AnalysisResponse(BaseModel):
    """AI-generated analysis and recommendations."""
    summary: str
    risks: list[str]
    recommendations: list[str]
    priority_order: list[dict]
    study_tips: list[str]


class FullReportResponse(BaseModel):
    """Complete report with snapshot + analysis."""
    snapshot: SnapshotResponse
    analysis: AnalysisResponse
    formatted_output: str


# Initialize global clients (done once at startup)
dedalus_client = None
mcp_runner = None
context_builder = None
ai_advisor = None


@app.on_event("startup")
async def startup_event():
    """Initialize MCP and AI clients on server startup."""
    global dedalus_client, mcp_runner, context_builder, ai_advisor

    # Initialize Dedalus MCP client
    dedalus_client = AsyncDedalus(
        api_key=os.getenv("DEDALUS_API_KEY"),
        base_url=os.getenv("DEDALUS_API_URL"),
        as_base_url=os.getenv("DEDALUS_AS_URL"),
    )
    mcp_runner = DedalusRunner(dedalus_client)

    # Initialize context builder
    context_builder = AcademicContextBuilder(
        mcp_runner=mcp_runner,
        credentials=[supabase_mcp_secrets]
    )

    # Initialize AI advisor
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        ai_advisor = AcademicAIAdvisor(api_key=openai_key)

    print("✅ AI Academic Advisor API initialized")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "AI Academic Advisor API",
        "version": "1.0.0"
    }


@app.get("/api/snapshot", response_model=SnapshotResponse)
async def get_snapshot():
    """
    Get student academic snapshot (data only, no AI).

    Returns:
        SnapshotResponse: Structured academic data
    """
    if not context_builder:
        raise HTTPException(status_code=503, detail="Service not initialized")

    try:
        snapshot = await context_builder.build_student_snapshot()
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build snapshot: {str(e)}")


@app.get("/api/analysis", response_model=AnalysisResponse)
async def get_analysis():
    """
    Get AI-generated analysis and recommendations.

    This endpoint:
    1. Builds student snapshot from MCP
    2. Sends to Claude for analysis
    3. Returns structured recommendations

    Returns:
        AnalysisResponse: AI-generated insights
    """
    if not context_builder or not ai_advisor:
        raise HTTPException(status_code=503, detail="Service not initialized")

    try:
        # Step 1: Build snapshot
        snapshot = await context_builder.build_student_snapshot()

        # Step 2: Generate AI analysis
        analysis = ai_advisor.generate_summary(snapshot)

        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(e)}")


@app.get("/api/report", response_model=FullReportResponse)
async def get_full_report():
    """
    Get complete report: snapshot + AI analysis + formatted output.

    This is the main endpoint for the frontend to call.

    Returns:
        FullReportResponse: Complete academic report
    """
    if not context_builder or not ai_advisor:
        raise HTTPException(status_code=503, detail="Service not initialized")

    try:
        # Build snapshot
        snapshot = await context_builder.build_student_snapshot()

        # Generate AI analysis
        analysis = ai_advisor.generate_summary(snapshot)

        # Format for display
        formatted = ai_advisor.format_for_display(analysis)

        return {
            "snapshot": snapshot,
            "analysis": analysis,
            "formatted_output": formatted
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@app.get("/api/mcp/test")
async def test_mcp_connection():
    """
    Test MCP connection by querying courses.

    Useful for debugging and health checks.

    Returns:
        dict: MCP response
    """
    if not mcp_runner:
        raise HTTPException(status_code=503, detail="MCP runner not initialized")

    try:
        response = await mcp_runner.run(
            input="Get the first 3 courses from the courses table. Show name and code.",
            model="anthropic/claude-sonnet-4-20250514",
            mcp_servers=["williamzhang121/mysupabase-mcp"],
            credentials=[supabase_mcp_secrets],
        )

        return {
            "status": "success",
            "output": response.final_output,
            "tools_called": len(response.mcp_results) if hasattr(response, 'mcp_results') else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MCP query failed: {str(e)}")


# Run with: uvicorn api_example:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
