"""
AI Router - Handles AI-powered project analysis and brief expansion
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json

from services.openrouter import OpenRouterService, ClaudeDirectService
from services.claude_code_ssh import ClaudeCodeSSHService

router = APIRouter()


class ExpandBriefRequest(BaseModel):
    brief: str
    model: str = "anthropic/claude-sonnet-4"
    provider: str = "openrouter"
    server_id: Optional[str] = None


class ExpandBriefResponse(BaseModel):
    tech_stack: str
    standards: str
    context: str
    quirks: str
    suggested_agents: list[str]
    suggested_mcp: list[str]
    analysis: str  # Initial AI analysis of the brief


class AIMessage(BaseModel):
    role: str
    content: str


class AIChatRequest(BaseModel):
    messages: list[AIMessage]
    brief: str
    project_context: Optional[dict] = None
    model: str = "anthropic/claude-sonnet-4"
    provider: str = "openrouter"
    server_id: Optional[str] = None
    mode: str = "refine"  # "refine" or "prp"


def get_api_key(
    x_openrouter_key: Optional[str] = Header(None),
    x_claude_key: Optional[str] = Header(None)
) -> dict:
    """Extract API keys from headers - BYOK model"""
    return {
        "openrouter": x_openrouter_key,
        "claude": x_claude_key
    }


def get_service(provider: str, api_keys: dict, server_id: Optional[str] = None):
    """Get the appropriate AI service based on provider"""
    if provider == "claude_code_ssh":
        if not server_id:
            raise HTTPException(
                status_code=400,
                detail="server_id required for claude_code_ssh provider. Connect to a VPS with Claude Code installed."
            )
        return ClaudeCodeSSHService(server_id)
    elif provider == "claude_direct":
        if not api_keys.get("claude"):
            raise HTTPException(
                status_code=401,
                detail="Claude API key required. Add X-Claude-Key header."
            )
        return ClaudeDirectService(api_keys["claude"])
    else:
        if not api_keys.get("openrouter"):
            raise HTTPException(
                status_code=401,
                detail="OpenRouter API key required. Add X-OpenRouter-Key header."
            )
        return OpenRouterService(api_keys["openrouter"])


EXPAND_BRIEF_SYSTEM_PROMPT = """You are a project analysis assistant for HubLLM, a platform that helps developers set up AI-powered development environments.

Your task is to analyze the user's project brief and generate structured project configuration.

Based on the brief, you must return a JSON object with these fields:
- tech_stack: Recommended technologies (e.g., "React, Node.js, PostgreSQL, Redis")
- standards: Code standards and conventions (e.g., "TypeScript strict mode, ESLint, Prettier, JSDoc comments")
- context: Project context summary for AI assistants (2-3 sentences describing what the project is and its key features)
- quirks: Any special considerations or technical quirks the AI should know about
- suggested_agents: Array of suggested agent types from ["code-reviewer", "security-audit", "test-writer", "api-designer", "ui-designer", "documentation"]
- suggested_mcp: Array of suggested MCP servers from ["github", "slack", "google-drive", "postgresql", "redis", "docker"]
- analysis: A brief analysis message (2-3 paragraphs) explaining your recommendations and asking follow-up questions

IMPORTANT: Your response must be valid JSON. Do not include any text before or after the JSON object."""


CHAT_SYSTEM_PROMPT = """You are a helpful project planning assistant for HubLLM. You're helping the user refine their project requirements.

The user's original project brief is:
{brief}

{context}

Help them clarify requirements, suggest improvements, and answer questions about their project setup. Be concise and helpful.

When the user asks to update the project context or you have enough information, include a JSON block at the end of your response like this:

```json
{{
  "update": {{
    "tech_stack": "updated value or null to keep existing",
    "standards": "updated value or null to keep existing",
    "context": "updated value or null to keep existing",
    "quirks": "updated value or null to keep existing"
  }}
}}
```

Only include fields that need updating. If no updates are needed, don't include the JSON block."""


PRP_SYSTEM_PROMPT = """You are a PRP (Product Requirements Prompt) generation assistant. You create comprehensive implementation blueprints that an AI coding agent can use to build projects.

The user's project brief is:
{brief}

{context}

## Your Workflow

Follow this 3-phase process. Do NOT skip phases or rush ahead.

### Phase 1: User Calibration (do this FIRST)

Ask these questions in a friendly, conversational way. Present as numbered multiple choice. Always include "Not sure — you decide" as an option.

1. **Experience level**: How would you rate your software engineering knowledge? (1-3: new, 4-6: basics, 7-10: experienced)
2. **Terminal comfort**: Are you comfortable using the terminal/command line? (Yes / Somewhat / Learning / No)
3. **Operating system**: What's your main OS? (Mac / Windows / Linux / Not sure)
4. **Tech stack preference**: Do you want to choose the tech stack, or should I pick? (You decide / Show options / I have preferences / I want to specify everything)

Wait for answers before proceeding.

**Communication style rules based on experience:**
- **1-3 (beginner)**: Explain every concept. Say "click the Terminal tab at the bottom" not "open terminal." Avoid jargon.
- **4-6 (intermediate)**: Brief explanations. Define technical terms on first use.
- **7-10 (experienced)**: Be concise. Use technical terms freely. Focus on architecture decisions.

### Phase 2: Project Discovery (adaptive)

Based on the brief and user answers, ask about gaps:
- Give 3-4 multiple choice options per question
- Always include "Not sure — you decide" and "Let's chat more about this"
- Track "you decide" count — if 2-3 in a row, stop technical questions and say "Got it — I'll make the technical decisions and focus on what you want the app to DO."

Key areas: Platform, Auth, Database, Integrations, Users, Deployment, Design.

**Default to free and open-source solutions.** When suggesting paid services, say so explicitly and offer free alternatives.

### Phase 3: Generate PRP

After all questions are answered, output the complete PRP as a single markdown document in the chat. Format it with these sections:

## FEATURE
- What to build — specific functionality and requirements
- User stories with acceptance criteria

## PHASES
- Phase 1: Foundation (project setup, data models, basic API, auth)
- Phase 2: Core Features (main functionality, integrations)
- Phase 3: Polish (UX, edge cases, performance)

Each phase has tasks with deliverables, files, and test requirements.

## TECH STACK
- Frontend framework + why
- Backend framework + why
- Database + why
- Key libraries + why

## EXAMPLES
Code patterns to follow (project structure, component patterns, API patterns).

## DOCUMENTATION
- Dependencies to install
- Environment variables needed

## OTHER CONSIDERATIONS
- Edge cases, security, performance, accessibility, mobile responsiveness

Output the full PRP in the chat so the user can download it."""


@router.post("/expand-brief")
async def expand_brief(
    request: ExpandBriefRequest,
    api_keys: dict = Depends(get_api_key)
):
    """
    Analyze a project brief and generate project configuration

    This endpoint takes a plain-language project description and returns
    structured configuration including tech stack, standards, and suggested
    agents/MCP servers.
    """
    if not request.brief.strip():
        raise HTTPException(status_code=400, detail="Brief cannot be empty")

    service = get_service(request.provider, api_keys, server_id=request.server_id)

    messages = [
        {"role": "system", "content": EXPAND_BRIEF_SYSTEM_PROMPT},
        {"role": "user", "content": f"Please analyze this project brief and generate the configuration:\n\n{request.brief}"}
    ]

    try:
        if request.provider == "claude_code_ssh":
            # SSH service returns AsyncGenerator — collect all chunks
            generator = await service.chat(
                messages=messages,
                model=request.model,
                temperature=0.7,
                max_tokens=2048,
                stream=True
            )
            chunks = []
            async for chunk in generator:
                chunks.append(chunk)
            content = "".join(chunks)
        else:
            response = await service.chat(
                messages=messages,
                model=request.model,
                temperature=0.7,
                max_tokens=2048,
                stream=False
            )

            # Extract content based on provider
            if request.provider == "claude_direct":
                content = response["content"][0]["text"]
            else:
                content = response["choices"][0]["message"]["content"]

        # Parse the JSON response
        try:
            # Try to find JSON in the response
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]

            result = json.loads(content.strip())

            return ExpandBriefResponse(
                tech_stack=result.get("tech_stack", ""),
                standards=result.get("standards", ""),
                context=result.get("context", ""),
                quirks=result.get("quirks", ""),
                suggested_agents=result.get("suggested_agents", []),
                suggested_mcp=result.get("suggested_mcp", []),
                analysis=result.get("analysis", "")
            )
        except json.JSONDecodeError:
            # If we can't parse JSON, return a default response with the raw analysis
            return ExpandBriefResponse(
                tech_stack="",
                standards="",
                context="",
                quirks="",
                suggested_agents=["code-reviewer"],
                suggested_mcp=["github"],
                analysis=content
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/chat")
async def ai_chat(
    request: AIChatRequest,
    api_keys: dict = Depends(get_api_key)
):
    """
    Continue a conversation about the project brief

    Returns a streaming response for real-time chat experience.
    """
    service = get_service(request.provider, api_keys, server_id=request.server_id)

    # Build context string if available
    context_str = ""
    if request.project_context:
        context_str = f"""
Current project configuration:
- Tech Stack: {request.project_context.get('tech_stack', 'Not set')}
- Standards: {request.project_context.get('standards', 'Not set')}
- Context: {request.project_context.get('context', 'Not set')}
- Quirks: {request.project_context.get('quirks', 'Not set')}
"""

    if request.mode == "prp":
        system_prompt = PRP_SYSTEM_PROMPT.format(
            brief=request.brief,
            context=context_str
        )
    else:
        system_prompt = CHAT_SYSTEM_PROMPT.format(
            brief=request.brief,
            context=context_str
        )

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend([{"role": m.role, "content": m.content} for m in request.messages])

    try:
        return StreamingResponse(
            stream_chat_response(service, messages, request.model),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


async def stream_chat_response(service, messages: list, model: str):
    """Generator for streaming chat responses"""
    try:
        async for chunk in await service.chat(
            messages=messages,
            model=model,
            temperature=0.7,
            max_tokens=2048,
            stream=True
        ):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
