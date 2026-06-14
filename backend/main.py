from uuid import uuid4

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.clients import DeepSeekClient, TavilyClient
from backend.data import (
    CHAPTERS,
    CONVERSATION,
    KNOWLEDGE_POINTS,
    MEMORY_ITEMS,
    MEMORY_SUMMARIES,
    MISTAKES,
    QUESTIONS,
    RECENT_CHATS,
    RESEARCH_POINTS,
    RESEARCH_SOURCES,
    SPRINT_ERRORS,
    SPRINT_HOT_POINTS,
    SPRINT_MUST_KNOW,
    SUBJECTS,
    TODAY_TASKS,
    WEAK_POINTS,
)
from backend.schemas import (
    ChatRequest,
    ChatResponse,
    DiagnosisAnswerRequest,
    DiagnosisAnswerResponse,
    HealthResponse,
    PracticeSubmitRequest,
    PracticeSubmitResponse,
    ResearchSearchRequest,
)
from backend.settings import load_settings


settings = load_settings()

app = FastAPI(title="Exam Review Agent API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def find_subject(subject_id: str) -> dict | None:
    return next((subject for subject in SUBJECTS if subject["id"] == subject_id), None)


def find_question(question_id: str) -> dict | None:
    return next((question for question in QUESTIONS if question["id"] == question_id), None)


def fallback_chat(message: str) -> str:
    if "Dijkstra" in message or "最短路径" in message:
        return "Dijkstra 适合非负权的单源最短路径问题。核心是每次确定当前距离最小的点，再用它更新相邻点距离。"
    return "我会先抓住核心概念，再配一道小题帮你确认理解。你可以继续问具体知识点。"


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok", "service": "exam-review-agent-api"}


@app.get("/api/subjects")
def get_subjects():
    return SUBJECTS


@app.get("/api/subjects/{subject_id}")
def get_subject(subject_id: str):
    subject = find_subject(subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject


@app.get("/api/tasks/today")
def get_today_tasks():
    return TODAY_TASKS


@app.get("/api/knowledge-points")
def get_knowledge_points(subjectId: str | None = None):
    if subjectId:
        return [point for point in KNOWLEDGE_POINTS if point["subjectId"] == subjectId]
    return KNOWLEDGE_POINTS


@app.get("/api/weak-points")
def get_weak_points(subjectId: str | None = None):
    if subjectId:
        return [point for point in WEAK_POINTS if point["subjectId"] == subjectId]
    return WEAK_POINTS


@app.get("/api/chats/recent")
def get_recent_chats():
    return RECENT_CHATS


@app.get("/api/chapters")
def get_chapters():
    return CHAPTERS


@app.get("/api/conversation")
def get_conversation():
    return CONVERSATION


@app.get("/api/questions")
def get_questions():
    return QUESTIONS


@app.get("/api/mistakes")
def get_mistakes():
    return MISTAKES


@app.get("/api/memory")
def get_memory():
    return {"items": MEMORY_ITEMS, "summaries": MEMORY_SUMMARIES}


@app.get("/api/sprint")
def get_sprint():
    return {
        "mustKnow": SPRINT_MUST_KNOW,
        "hotPoints": SPRINT_HOT_POINTS,
        "errors": SPRINT_ERRORS,
    }


@app.get("/api/research")
def get_research():
    return {"sources": RESEARCH_SOURCES, "points": RESEARCH_POINTS}


@app.post("/api/practice/submit", response_model=PracticeSubmitResponse)
def submit_practice(payload: PracticeSubmitRequest):
    question = find_question(payload.question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    is_choice = question["type"] in {"选择题", "判断题"}
    correct = payload.answer == question["answer"] if is_choice else len(payload.answer.strip()) > 20
    return {
        "questionId": payload.question_id,
        "correct": correct,
        "answer": payload.answer,
        "expected": question["answer"],
        "analysis": question["analysis"],
    }


@app.post("/api/diagnosis/answer", response_model=DiagnosisAnswerResponse)
def answer_diagnosis(payload: DiagnosisAnswerRequest):
    judged = "存在薄弱点：最短路径" if "Dijkstra" in payload.question else "掌握情况待继续确认"
    return {
        "judged": judged,
        "nextSuggestion": "建议继续复习最短路径的适用条件，并做 2 道负权边辨析题。",
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    content = fallback_chat(payload.message)
    if settings.deepseek_api_key:
        try:
            subject = find_subject(payload.subject_id) if payload.subject_id else None
            system_prompt = "你是一个期末复习教练，回答要短、清楚、适合学生复习。"
            if subject:
                system_prompt += f" 当前科目是{subject['name']}，考试范围是{subject['scope']}。"
            content = DeepSeekClient(
                api_key=settings.deepseek_api_key,
                base_url=settings.deepseek_base_url,
                model=settings.deepseek_model,
            ).chat(system_prompt, payload.message)
        except (httpx.HTTPError, KeyError, IndexError):
            content = fallback_chat(payload.message)
    return {
        "id": f"api-{uuid4().hex[:8]}",
        "role": "assistant",
        "kind": "text",
        "content": content,
    }


@app.post("/api/research/search")
def search_research(payload: ResearchSearchRequest):
    if settings.tavily_api_key:
        try:
            results = TavilyClient(
                api_key=settings.tavily_api_key,
                base_url=settings.tavily_base_url,
            ).search(payload.query)
            return {"query": payload.query, "sources": results}
        except httpx.HTTPError:
            pass
    return {"query": payload.query, "sources": RESEARCH_SOURCES}
