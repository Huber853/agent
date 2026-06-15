import json
import re
from uuid import uuid4

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.agent_tools import ToolContext, available_tools
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
    SubjectCreateRequest,
    SubjectCreateResponse,
)
from backend.runtime_store import build_runtime_subject_record, read_runtime_subjects, upsert_runtime_subject
from backend.settings import load_settings


settings = load_settings()
tool_context = ToolContext(settings=settings)

app = FastAPI(title="Exam Review Agent API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def find_subject(subject_id: str) -> dict | None:
    return next((subject for subject in get_all_subjects() if subject["id"] == subject_id), None)


def runtime_records() -> list[dict]:
    return read_runtime_subjects()


def get_all_subjects() -> list[dict]:
    return SUBJECTS + [record["subject"] for record in runtime_records() if isinstance(record.get("subject"), dict)]


def find_runtime_record(subject_id: str | None) -> dict | None:
    if not subject_id:
        return None
    return next((record for record in runtime_records() if record.get("subject", {}).get("id") == subject_id), None)


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
    runtime = find_runtime_record(subject_id)
    if runtime:
        points = [
            point["title"]
            for point in runtime.get("knowledgePoints", []) + runtime.get("weakPoints", [])
            if point.get("title")
        ]
        return list(dict.fromkeys(points))
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
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("[")
        end = cleaned.rfind("]")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start : end + 1]
        data = json.loads(cleaned)
    if isinstance(data, dict):
        if isinstance(data.get("questions"), list):
            data = data["questions"]
        else:
            data = [data]
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array")
    return [item for item in data if isinstance(item, dict)]


def extract_json_object(text: str) -> dict:
    cleaned = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)```", cleaned, flags=re.DOTALL)
    if fenced:
        cleaned = fenced.group(1).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]
    data = json.loads(cleaned)
    if not isinstance(data, dict):
        raise ValueError("Expected a JSON object")
    return data


def normalize_generated_questions(
    raw_questions: list[dict],
    subject: dict,
    count: int,
    target_difficulty: str | None = None,
) -> list[dict]:
    type_map = {
        "single": "选择题",
        "choice": "选择题",
        "multiple_choice": "选择题",
        "true_false": "判断题",
        "judge": "判断题",
        "short": "简答题",
        "short_answer": "简答题",
        "calculation": "计算题",
        "calculate": "计算题",
    }
    difficulty_map = {
        1: "简单",
        2: "中等",
        3: "困难",
        "1": "简单",
        "2": "中等",
        "3": "困难",
        "easy": "简单",
        "medium": "中等",
        "hard": "困难",
    }
    normalized = []
    for index, item in enumerate(raw_questions[:count], start=1):
        raw_type = item.get("type")
        question_type = raw_type if raw_type in {"选择题", "判断题", "简答题", "计算题"} else type_map.get(str(raw_type), "选择题")
        raw_difficulty = item.get("difficulty")
        difficulty = target_difficulty or (
            raw_difficulty if raw_difficulty in {"简单", "中等", "困难"} else difficulty_map.get(raw_difficulty, "中等")
        )
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
                "difficulty": difficulty,
                "point": str(item.get("point") or subject["scope"].split("、")[0]),
                "subject": subject["name"],
                "content": str(item.get("content") or "请根据本章知识点完成本题。"),
                "options": options,
                "answer": str(item.get("answer") or "参考答案见解析"),
                "analysis": str(item.get("analysis") or "请回到知识点定义、适用条件和典型步骤进行分析。"),
            }
        )
    return normalized


def build_local_variant_questions(
    subject: dict,
    count: int,
    target_difficulty: str | None,
    focus: str | None = None,
) -> list[dict]:
    points = subject_points(subject["id"]) or [focus or subject["scope"]]
    question_types = subject.get("questionTypes") or ["选择题", "简答题"]
    variants = []
    for index in range(1, count + 1):
        point = focus or points[(index - 1) % len(points)]
        question_type = question_types[(index - 1) % len(question_types)]
        if question_type in {"选择题", "判断题", "填空题"}:
            options = [
                {"key": "A", "text": f"先判断「{point}」的适用条件，再套步骤"},
                {"key": "B", "text": "只记结论，不需要分析条件"},
                {"key": "C", "text": "遇到所有题都使用同一种方法"},
                {"key": "D", "text": "跳过基础概念直接做综合题"},
            ]
            answer = "A"
            content = f"变式 {index}：复习「{point}」时，下面哪种做法最适合作为期末解题起点？"
        else:
            options = None
            answer = f"围绕「{point}」写出定义/条件、典型步骤、易错点，并配一个小例子。"
            content = f"变式 {index}：请简述「{point}」的核心考法，并说明一个常见失分点。"
        variants.append(
            {
                "id": f"local-{subject['id']}-{uuid4().hex[:8]}-{index}",
                "type": "选择题" if options else "简答题",
                "difficulty": target_difficulty or "中等",
                "point": point,
                "subject": subject["name"],
                "content": content,
                "options": options,
                "answer": answer,
                "analysis": f"这是一道本地兜底变式题。复习「{point}」时，应先明确适用条件，再按步骤解题，最后检查易错点。",
            }
        )
    return variants


def fallback_chat(message: str) -> str:
    if "Dijkstra" in message or "最短路径" in message:
        return "Dijkstra 适合非负权的单源最短路径问题。核心是每次确定当前距离最小的点，再用它更新相邻点距离。\n\n复习时抓三点：1. 不能处理负权边；2. 堆优化复杂度是 O((V+E)logV)；3. 松弛操作就是发现更短路径就更新距离。\n\n小题：如果 A->B=2，A->C=5，B->C=1，那么 A 到 C 的最短距离是多少？答案是 3。"
    return "我会按「核心概念 -> 易错点 -> 例题 -> 记忆清单」来讲。\n\n先抓核心：这个知识点最重要的是知道它解决什么问题、使用条件是什么、考试会怎么变形。\n\n你可以把具体章节或题目发给我，我会继续拆成步骤讲，并给你一两道即时练习。"


def chapter_context(subject_id: str | None, chapter_id: str | None) -> dict | None:
    chapters = get_chapters(subject_id)
    if chapter_id:
        return next((chapter for chapter in chapters if chapter.get("id") == chapter_id), None)
    return None


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok", "service": "exam-review-agent-api"}


@app.get("/api/subjects")
def get_subjects():
    return get_all_subjects()


@app.get("/api/subjects/{subject_id}")
def get_subject(subject_id: str):
    subject = find_subject(subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject


@app.post("/api/subjects", response_model=SubjectCreateResponse)
def create_subject(payload: SubjectCreateRequest):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Subject name is required")

    tools = available_tools(tool_context)
    profile = tools["subject_profile_generator"].run(
        name=payload.name.strip(),
        exam_date=payload.exam_date,
        daily_minutes=payload.daily_minutes,
        base=payload.base,
        goal=payload.goal,
        scope=payload.scope,
        question_types=payload.question_types,
    )
    record = build_runtime_subject_record(
        name=payload.name.strip(),
        exam_date=payload.exam_date,
        daily_minutes=payload.daily_minutes,
        base=payload.base,
        goal=payload.goal,
        scope=payload.scope,
        question_types=payload.question_types,
        profile=profile if isinstance(profile, dict) else {},
    )
    upsert_runtime_subject(record)
    return {
        "subject": record["subject"],
        "chapters": record["chapters"],
        "knowledgePoints": record["knowledgePoints"],
        "weakPoints": record["weakPoints"],
    }


@app.get("/api/tasks/today")
def get_today_tasks():
    return TODAY_TASKS


@app.get("/api/knowledge-points")
def get_knowledge_points(subjectId: str | None = None):
    runtime = find_runtime_record(subjectId)
    if runtime:
        return runtime.get("knowledgePoints", [])
    if subjectId:
        return [point for point in KNOWLEDGE_POINTS if point["subjectId"] == subjectId]
    return KNOWLEDGE_POINTS


@app.get("/api/weak-points")
def get_weak_points(subjectId: str | None = None):
    runtime = find_runtime_record(subjectId)
    if runtime:
        return runtime.get("weakPoints", [])
    if subjectId:
        return [point for point in WEAK_POINTS if point["subjectId"] == subjectId]
    return WEAK_POINTS


@app.get("/api/chats/recent")
def get_recent_chats(subjectId: str | None = None):
    runtime = find_runtime_record(subjectId)
    if runtime:
        return runtime.get("recentChats", [])
    subject_name = find_subject_name(subjectId)
    if subject_name:
        return [chat for chat in RECENT_CHATS if chat["subject"] == subject_name]
    return RECENT_CHATS


@app.get("/api/chapters")
def get_chapters(subjectId: str | None = None):
    runtime = find_runtime_record(subjectId)
    if runtime:
        return runtime.get("chapters", [])
    if subjectId:
        return CHAPTERS_BY_SUBJECT.get(subjectId, CHAPTERS)
    return CHAPTERS


@app.get("/api/conversation")
def get_conversation(subjectId: str | None = None, chapterId: str | None = None):
    subject = find_subject(subjectId) if subjectId else None
    selected_chapter = chapter_context(subjectId, chapterId)
    if selected_chapter:
        chapter_items = "、".join(selected_chapter.get("items") or [])
        return [
            {
                "id": f"{selected_chapter['id']}-user",
                "role": "user",
                "content": f"我想学习{selected_chapter['title']}这一章。",
            },
            {
                "id": f"{selected_chapter['id']}-assistant",
                "role": "assistant",
                "kind": "text",
                "content": (
                    f"这是「{subject['name'] if subject else '当前科目'}」的「{selected_chapter['title']}」独立对话。"
                    f"本章重点包括：{chapter_items or '核心概念、典型题和易错点'}。你可以直接问概念，也可以让我按考试题型出题。"
                ),
            },
        ]
    runtime = find_runtime_record(subjectId)
    if runtime:
        return runtime.get("conversation", [])
    if subjectId:
        return CONVERSATIONS_BY_SUBJECT.get(subjectId, CONVERSATION)
    return CONVERSATION


@app.get("/api/questions")
def get_questions(subjectId: str | None = None):
    subject_name = find_subject_name(subjectId)
    if find_runtime_record(subjectId):
        return []
    if subject_name:
        return [question for question in QUESTIONS if question["subject"] == subject_name]
    return QUESTIONS


@app.post("/api/questions/generate", response_model=QuestionGenerateResponse)
def generate_questions(payload: QuestionGenerateRequest):
    subject = find_subject(payload.subject_id) if payload.subject_id else get_all_subjects()[0]
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")

    count = min(max(payload.count, 1), 10)
    existing = [question for question in QUESTIONS if question["subject"] == subject["name"]]
    existing_content = {content.strip() for content in payload.existing_question_contents if content.strip()}
    target_difficulty = payload.difficulty if payload.difficulty in {"简单", "中等", "困难"} else None
    fallback_questions = [
        {
            **question,
            "id": f"fallback-{question['id']}-{uuid4().hex[:6]}",
            "difficulty": target_difficulty or question["difficulty"],
        }
        for question in existing[:count]
    ]
    if not settings.deepseek_api_key:
        return {"questions": build_local_variant_questions(subject, count, target_difficulty, focus=payload.focus)}

    points = subject_points(subject["id"])
    focus = payload.focus or "、".join(points[:6]) or subject["scope"]
    system_prompt = (
        "你是期末复习出题老师。请严格只输出 JSON 对象，不要 Markdown，不要解释。"
        "对象格式必须是 {\"questions\":[...]}。questions 数组中每个对象必须包含 id、type、difficulty、point、subject、content、options、answer、analysis。"
        "type 只能是 选择题、判断题、简答题、计算题；difficulty 只能是 简单、中等、困难。"
        "选择题 options 使用 [{\"key\":\"A\",\"text\":\"...\"}] 格式，answer 填选项 key。"
        "判断题 options 使用 T/F。简答题或计算题 options 填 null。"
        "analysis 要写清解题步骤和易错点。题目必须围绕当前科目，避免重复已有题。"
    )
    generated: list[dict] = []
    client = DeepSeekClient(
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url,
        model=settings.deepseek_model,
    )
    for attempt in range(1, 4):
        remaining = count - len(generated)
        if remaining <= 0:
            break
        user_message = (
            f"科目：{subject['name']}\n"
            f"考试范围：{subject['scope']}\n"
            f"重点/薄弱点：{focus}\n"
            f"生成数量：{remaining}\n"
            f"目标难度：{target_difficulty or '混合'}\n"
            f"已有题目 id：{', '.join(payload.existing_question_ids[:20])}\n"
            f"这是第 {attempt} 次生成。请严格返回 JSON 对象，questions 里包含 {remaining} 个题目对象。"
            "题目必须适合期末复习，选择题不少于一半，答案和解析都要完整。"
        )
        try:
            content = client.chat(system_prompt, user_message, max_tokens=2600, json_mode=True)
            raw_batch = extract_json_array(content)
            batch = normalize_generated_questions(raw_batch, subject, max(len(raw_batch), remaining), target_difficulty)
            for question in batch:
                if len(generated) >= count:
                    break
                content_key = question.get("content", "").strip()
                if content_key and content_key not in existing_content:
                    generated.append(question)
                    existing_content.add(content_key)
        except (httpx.HTTPError, KeyError, IndexError, ValueError, json.JSONDecodeError):
            continue

    if generated:
        return {"questions": generated[:count]}
    return {"questions": build_local_variant_questions(subject, count, target_difficulty, focus=payload.focus)}


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
    if not is_choice and settings.deepseek_api_key:
        question_content = question["content"] if question else payload.question_content or "AI 生成主观题"
        system_prompt = (
            "你是期末复习题批改老师。请严格只输出 JSON 对象，不要 Markdown，不要解释。"
            "对象必须包含 correct、expected、analysis。"
            "correct 是布尔值；expected 是参考答案；analysis 用中文指出得分点、缺失点和下一步复习建议。"
            "判分要以期末考试为标准：表达不完整但抓住核心可以算对，漏掉关键条件或步骤要算错。"
        )
        user_message = (
            f"题型：{question_type}\n"
            f"题目：{question_content}\n"
            f"参考答案：{expected}\n"
            f"原始解析：{analysis}\n"
            f"学生作答：{payload.answer}\n"
            "请批改这份作答。"
        )
        try:
            judged = extract_json_object(
                DeepSeekClient(
                    api_key=settings.deepseek_api_key,
                    base_url=settings.deepseek_base_url,
                    model=settings.deepseek_model,
                ).chat(system_prompt, user_message, max_tokens=1000, json_mode=True)
            )
            correct = bool(judged.get("correct"))
            expected = str(judged.get("expected") or expected)
            analysis = str(judged.get("analysis") or analysis)
        except (httpx.HTTPError, KeyError, IndexError, ValueError, json.JSONDecodeError):
            pass
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
            runtime = find_runtime_record(subject["id"] if subject else None)
            if runtime:
                chapters = runtime.get("chapters", chapters)
            selected_chapter = chapter_context(subject["id"] if subject else None, payload.chapter_id)
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
            if selected_chapter:
                system_prompt += (
                    f"\n当前独立章节：{selected_chapter.get('title')}"
                    f"\n本章小节：{'、'.join(selected_chapter.get('items') or [])}"
                    "\n回答必须优先围绕当前章节，不要跳到其它章节，除非学生明确要求横向对比。"
                )
            history = payload.history[-8:]
            content = DeepSeekClient(
                api_key=settings.deepseek_api_key,
                base_url=settings.deepseek_base_url,
                model=settings.deepseek_model,
            ).chat(system_prompt, payload.message, max_tokens=2200, history=history)
        except (httpx.HTTPError, KeyError, IndexError, ValueError):
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
