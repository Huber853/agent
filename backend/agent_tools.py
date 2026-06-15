import json
import re
from dataclasses import dataclass
from typing import Callable

import httpx

from backend.clients import DeepSeekClient, TavilyClient
from backend.settings import Settings


@dataclass(frozen=True)
class ToolContext:
    settings: Settings


@dataclass(frozen=True)
class AgentTool:
    name: str
    description: str
    run: Callable[..., object]


def clean_json_object(text: str) -> dict:
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
        raise ValueError("Expected JSON object")
    return data


def search_web(ctx: ToolContext, query: str) -> list[dict]:
    if not ctx.settings.tavily_api_key:
        return []
    try:
        return TavilyClient(
            api_key=ctx.settings.tavily_api_key,
            base_url=ctx.settings.tavily_base_url,
        ).search(query)
    except httpx.HTTPError:
        return []


def generate_subject_profile(
    ctx: ToolContext,
    *,
    name: str,
    exam_date: str,
    daily_minutes: int,
    base: str,
    goal: str,
    scope: str,
    question_types: list[str],
) -> dict:
    sources = search_web(ctx, f"{name} 期末考试 复习大纲 知识点 题型")
    source_context = "\n".join(
        f"- {item.get('title', '')}: {item.get('content') or item.get('summary') or ''}"
        for item in sources[:5]
    )
    fallback_scope = scope or f"{name}核心概念、常考题型、重点章节"
    if not ctx.settings.deepseek_api_key:
        return build_fallback_subject_profile(name, fallback_scope, question_types)

    system_prompt = (
        "你是期末复习课程规划 Agent。请严格只输出 JSON 对象，不要 Markdown。"
        "对象包含 scope、chapters、knowledgePoints、weakPoints、recentChats、conversation。"
        "chapters 是数组，每项包含 id、title、done、active、items。"
        "knowledgePoints 和 weakPoints 每项包含 id、title、level、mastery、subjectId。"
        "recentChats 每项包含 id、title、subject、time、preview。"
        "conversation 每项包含 id、role、kind、content。"
    )
    user_message = (
        f"科目：{name}\n"
        f"考试日期：{exam_date}\n"
        f"每天复习分钟：{daily_minutes}\n"
        f"基础：{base}\n"
        f"目标：{goal}\n"
        f"用户填写范围：{fallback_scope}\n"
        f"题型：{', '.join(question_types)}\n"
        f"联网资料：\n{source_context or '暂无联网资料'}\n"
        "请生成适合该科目的复习目录、知识点、薄弱点和开场对话。"
    )
    try:
        content = DeepSeekClient(
            api_key=ctx.settings.deepseek_api_key,
            base_url=ctx.settings.deepseek_base_url,
            model=ctx.settings.deepseek_model,
        ).chat(system_prompt, user_message, max_tokens=2600, json_mode=True)
        profile = clean_json_object(content)
        return profile
    except (httpx.HTTPError, KeyError, IndexError, ValueError, json.JSONDecodeError):
        return build_fallback_subject_profile(name, fallback_scope, question_types)


def build_fallback_subject_profile(name: str, scope: str, question_types: list[str]) -> dict:
    raw_points = [part.strip() for part in re.split(r"[、,，;；\n]", scope) if part.strip()]
    points = raw_points[:6] or [f"{name}核心概念", f"{name}常考题型", f"{name}综合应用"]
    chapters = [
        {
            "id": f"ch-{index}",
            "title": f"第 {index} 章 {point}",
            "done": index == 1,
            "active": index == 1,
            "items": [point, "基础概念", "典型题"],
        }
        for index, point in enumerate(points, start=1)
    ]
    knowledge_points = [
        {
            "id": f"kp-{index}",
            "title": point,
            "level": "常考" if index % 2 else "必会",
            "mastery": max(35, 70 - index * 5),
            "subjectId": "",
        }
        for index, point in enumerate(points, start=1)
    ]
    weak_points = [
        {
            "id": f"weak-{index}",
            "title": point,
            "level": "薄弱",
            "mastery": max(25, 50 - index * 4),
            "subjectId": "",
        }
        for index, point in enumerate(points[-2:] or points, start=1)
    ]
    return {
        "scope": scope,
        "chapters": chapters,
        "knowledgePoints": knowledge_points,
        "weakPoints": weak_points,
        "recentChats": [
            {
                "id": "chat-1",
                "title": f"{name}怎么开始复习？",
                "subject": name,
                "time": "刚刚",
                "preview": f"先按{points[0]}建立框架，再做题校验。",
            }
        ],
        "conversation": [
            {"id": "intro-user", "role": "user", "content": f"帮我规划{name}的期末复习。"},
            {
                "id": "intro-assistant",
                "role": "assistant",
                "kind": "text",
                "content": f"这门课可以先从「{points[0]}」开始，按章节建立框架，再用{question_types[0] if question_types else '练习题'}检查掌握情况。",
            },
        ],
    }


def available_tools(ctx: ToolContext) -> dict[str, AgentTool]:
    return {
        "web_search": AgentTool(
            name="web_search",
            description="Use Tavily to collect public study outline and reference material.",
            run=lambda query: search_web(ctx, query),
        ),
        "subject_profile_generator": AgentTool(
            name="subject_profile_generator",
            description="Use DeepSeek plus web context to generate subject chapters and knowledge points.",
            run=lambda **kwargs: generate_subject_profile(ctx, **kwargs),
        ),
    }
