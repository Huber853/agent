import json
import re
from datetime import date
from pathlib import Path
from uuid import uuid4


STORE_PATH = Path("backend/.runtime/subjects.json")


def slugify_subject(name: str) -> str:
    ascii_slug = re.sub(r"[^a-zA-Z0-9]+", "-", name.lower()).strip("-")
    return ascii_slug or f"subject-{uuid4().hex[:8]}"


def days_left(exam_date: str) -> int:
    try:
        return max((date.fromisoformat(exam_date) - date.today()).days, 0)
    except ValueError:
        return 0


def read_runtime_subjects() -> list[dict]:
    if not STORE_PATH.exists():
        return []
    try:
        data = json.loads(STORE_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    return data if isinstance(data, list) else []


def write_runtime_subjects(subjects: list[dict]) -> None:
    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STORE_PATH.write_text(json.dumps(subjects, ensure_ascii=False, indent=2), encoding="utf-8")


def upsert_runtime_subject(record: dict) -> None:
    subjects = read_runtime_subjects()
    subjects = [subject for subject in subjects if subject.get("subject", {}).get("id") != record.get("subject", {}).get("id")]
    subjects.append(record)
    write_runtime_subjects(subjects)


def build_runtime_subject_record(
    *,
    name: str,
    exam_date: str,
    daily_minutes: int,
    base: str,
    goal: str,
    scope: str,
    question_types: list[str],
    profile: dict,
) -> dict:
    subject_id = slugify_subject(name)
    normalized_base = {"较弱": "weak", "一般": "normal", "较好": "good"}.get(base, "normal")
    normalized_goal = goal if goal in {"及格", "稳过", "高分"} else "稳过"
    profile_scope = str(profile.get("scope") or scope or name)

    subject = {
        "id": subject_id,
        "name": name,
        "emoji": "📘",
        "examDate": exam_date,
        "daysLeft": days_left(exam_date),
        "dailyMinutes": daily_minutes,
        "base": normalized_base,
        "goal": normalized_goal,
        "mastery": 42 if normalized_base == "weak" else 58 if normalized_base == "normal" else 72,
        "progress": 0,
        "scope": profile_scope,
        "questionTypes": question_types or ["选择题", "简答题"],
        "color": "bg-chart-4",
    }

    def with_subject_id(items: list[dict]) -> list[dict]:
        normalized = []
        for index, item in enumerate(items, start=1):
            normalized.append({**item, "id": str(item.get("id") or f"{subject_id}-{index}"), "subjectId": subject_id})
        return normalized

    chapters = []
    for index, chapter in enumerate(profile.get("chapters") or [], start=1):
        chapters.append(
            {
                "id": str(chapter.get("id") or f"{subject_id}-ch-{index}"),
                "title": str(chapter.get("title") or f"第 {index} 章"),
                "done": bool(chapter.get("done", False)),
                "active": bool(chapter.get("active", index == 1)),
                "items": chapter.get("items") if isinstance(chapter.get("items"), list) else [],
            }
        )

    recent_chats = []
    for index, chat in enumerate(profile.get("recentChats") or [], start=1):
        recent_chats.append(
            {
                "id": str(chat.get("id") or f"{subject_id}-chat-{index}"),
                "title": str(chat.get("title") or f"{name}复习对话"),
                "subject": name,
                "time": str(chat.get("time") or "刚刚"),
                "preview": str(chat.get("preview") or profile_scope),
            }
        )

    conversation = []
    for index, message in enumerate(profile.get("conversation") or [], start=1):
        role = message.get("role") if message.get("role") in {"user", "assistant"} else "assistant"
        conversation.append(
            {
                "id": str(message.get("id") or f"{subject_id}-msg-{index}"),
                "role": role,
                "kind": message.get("kind") or "text",
                "content": str(message.get("content") or ""),
            }
        )

    return {
        "subject": subject,
        "chapters": chapters,
        "knowledgePoints": with_subject_id(profile.get("knowledgePoints") or []),
        "weakPoints": with_subject_id(profile.get("weakPoints") or []),
        "recentChats": recent_chats,
        "conversation": conversation,
    }
