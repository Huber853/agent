import json
import re
from uuid import uuid4

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.clients import DeepSeekClient, TavilyClient
from backend.data import (
    CHAPTERS,
    CHAPTERS_BY_SUBJECT,
    CONVERSATION,
    CONVERSATIONS_BY_SUBJECT,
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
    QuestionGenerateRequest,
    QuestionGenerateResponse,
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


def find_subject_name(subject_id: str | None) -> str | None:
    if not subject_id:
        return None
    subject = find_subject(subject_id)
    return subject["name"] if subject else None


def find_question(question_id: str) -> dict | None:
    return next((question for question in QUESTIONS if question["id"] == question_id), None)


def subject_points(subject_id: str | None) -> list[str]:
    if not subject_id:
        return []
    points = [
        point["title"]
        for point in KNOWLEDGE_POINTS + WEAK_POINTS
        if point.get("subjectId") == subject_id
    ]
    return list(dict.fromkeys(points))


def extract_json_array(text: str) -> list[dict]:
    cleaned = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)```", cleaned, flags=re.DOTALL)
    if fenced:
        cleaned = fenced.group(1).strip()
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]
    data = json.loads(cleaned)
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array")
    return [item for item in data if isinstance(item, dict)]


def normalize_generated_questions(raw_questions: list[dict], subject: dict, count: int) -> list[dict]:
    normalized = []
    for index, item in enumerate(raw_questions[:count], start=1):
        question_type = item.get("type") if item.get("type") in {"选择题", "判断题", "简答题", "计算题"} else "选择题"
        options = item.get("options") if isinstance(item.get("options"), list) else None
        if question_type in {"选择题", "判断题"} and not options:
            options = [
                {"key": "A", "text": "正确"},
                {"key": "B", "text": "错误"},
            ]
        normalized.append(
            {
                "id": f"ai-{subject['id']}-{uuid4().hex[:8]}-{index}",
                "type": question_type,
                "difficulty": item.get("difficulty") if item.get("difficulty") in {"简单", "中等", "困难"} else "中等",
                "point": str(item.get("point") or subject["scope"].split("、")[0]),
                "subject": subject["name"],
                "content": str(item.get("content") or "请根据本章知识点完成本题。"),
                "options": options,
                "answer": str(item.get("answer") or "参考答案见解析"),
                "analysis": str(item.get("analysis") or "请回到知识点定义、适用条件和典型步骤进行分析。"),
            }
        )
    return normalized


def fallback_chat(message: str) -> str:
    if "Dijkstra" in message or "最短路径" in message:
        return "Dijkstra 适合非负权的单源最短路径问题。核心是每次确定当前距离最小的点，再用它更新相邻点距离。\n\n复习时抓三点：1. 不能处理负权边；2. 堆优化复杂度是 O((V+E)logV)；3. 松弛操作就是发现更短路径就更新距离。\n\n小题：如果 A->B=2，A->C=5，B->C=1，那么 A 到 C 的最短距离是多少？答案是 3。"
    return "我会按「核心概念 -> 易错点 -> 例题 -> 记忆清单」来讲。\n\n先抓核心：这个知识点最重要的是知道它解决什么问题、使用条件是什么、考试会怎么变形。\n\n你可以把具体章节或题目发给我，我会继续拆成步骤讲，并给你一两道即时练习。"


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
def get_recent_chats(subjectId: str | None = None):
    subject_name = find_subject_name(subjectId)
    if subject_name:
        return [chat for chat in RECENT_CHATS if chat["subject"] == subject_name]
    return RECENT_CHATS


@app.get("/api/chapters")
def get_chapters(subjectId: str | None = None):
    if subjectId:
        return CHAPTERS_BY_SUBJECT.get(subjectId, CHAPTERS)
    return CHAPTERS


@app.get("/api/conversation")
def get_conversation(subjectId: str | None = None):
    if subjectId:
        return CONVERSATIONS_BY_SUBJECT.get(subjectId, CONVERSATION)
    return CONVERSATION


@app.get("/api/questions")
def get_questions(subjectId: str | None = None):
    subject_name = find_subject_name(subjectId)
    if subject_name:
        return [question for question in QUESTIONS if question["subject"] == subject_name]
    return QUESTIONS


@app.post("/api/questions/generate", response_model=QuestionGenerateResponse)
def generate_questions(payload: QuestionGenerateRequest):
    subject = find_subject(payload.subject_id) if payload.subject_id else SUBJECTS[0]
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")

    count = min(max(payload.count, 1), 10)
    existing = [question for question in QUESTIONS if question["subject"] == subject["name"]]
    fallback_questions = [
        {
            **question,
            "id": f"fallback-{question['id']}-{uuid4().hex[:6]}",
        }
        for question in existing[:count]
    ]
    if not settings.deepseek_api_key:
        return {"questions": fallback_questions}

    points = subject_points(subject["id"])
    focus = payload.focus or "、".join(points[:6]) or subject["scope"]
    system_prompt = (
        "你是期末复习出题老师。请严格只输出 JSON 数组，不要 Markdown，不要解释。"
        "数组中每个对象必须包含 id、type、difficulty、point、subject、content、options、answer、analysis。"
        "type 只能是 选择题、判断题、简答题、计算题；difficulty 只能是 简单、中等、困难。"
        "选择题 options 使用 [{\"key\":\"A\",\"text\":\"...\"}] 格式，answer 填选项 key。"
        "判断题 options 使用 T/F。简答题或计算题 options 填 null。"
        "analysis 要写清解题步骤和易错点。题目必须围绕当前科目，避免重复已有题。"
    )
    user_message = (
        f"科目：{subject['name']}\n"
        f"考试范围：{subject['scope']}\n"
        f"重点/薄弱点：{focus}\n"
        f"生成数量：{count}\n"
        f"已有题目 id：{', '.join(payload.existing_question_ids[:20])}\n"
        "请生成一组适合期末复习的混合题，选择题不少于一半。"
    )
    try:
        content = DeepSeekClient(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
            model=settings.deepseek_model,
        ).chat(system_prompt, user_message, max_tokens=2400)
        generated = normalize_generated_questions(extract_json_array(content), subject, count)
        return {"questions": generated or fallback_questions}
    except (httpx.HTTPError, KeyError, IndexError, ValueError, json.JSONDecodeError):
        return {"questions": fallback_questions}


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
    if question is None and not payload.expected:
        raise HTTPException(status_code=404, detail="Question not found")
    question_type = question["type"] if question else (payload.question_type or "简答题")
    expected = question["answer"] if question else payload.expected or ""
    analysis = question["analysis"] if question else payload.analysis or "这道题来自 AI 生成题组，请对照参考答案整理错因。"
    is_choice = question_type in {"选择题", "判断题"}
    correct = payload.answer == expected if is_choice else len(payload.answer.strip()) > 20
    return {
        "questionId": payload.question_id,
        "correct": correct,
        "answer": payload.answer,
        "expected": expected,
        "analysis": analysis,
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
            weak_titles = subject_points(subject["id"] if subject else None)[:8]
            chapters = CHAPTERS_BY_SUBJECT.get(subject["id"], CHAPTERS) if subject else CHAPTERS
            chapter_titles = [chapter["title"] for chapter in chapters[:8]]
            system_prompt = (
                "你是一个非常认真、具体、会带学生提分的期末复习教练。"
                "必须用中文回答，禁止空泛鼓励，禁止只给一句结论。"
                "你要根据学生当前科目、复习范围、薄弱点和前文对话来回答。"
                "每次回答都要有可复习价值，优先使用下面结构：\n"
                "1. 先判断学生卡在哪里；\n"
                "2. 用通俗话解释核心概念；\n"
                "3. 给考试会怎么考；\n"
                "4. 列出 2-4 个解题步骤或记忆点；\n"
                "5. 给 1 道即时小题，随后直接给答案和解析；\n"
                "6. 最后给下一步建议或追问学生一个具体问题。"
                "如果学生说“出几道题”，请直接给 3 道题，包含答案和解析。"
                "如果学生说“不懂”或“换种方式”，请换一个类比或更慢的步骤讲。"
            )
            if subject:
                system_prompt += (
                    f"\n当前科目：{subject['name']}"
                    f"\n考试范围：{subject['scope']}"
                    f"\n章节：{'、'.join(chapter_titles)}"
                    f"\n重点/薄弱点：{'、'.join(weak_titles)}"
                )
            history = payload.history[-8:]
            content = DeepSeekClient(
                api_key=settings.deepseek_api_key,
                base_url=settings.deepseek_base_url,
                model=settings.deepseek_model,
            ).chat(system_prompt, payload.message, max_tokens=2200, history=history)
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
