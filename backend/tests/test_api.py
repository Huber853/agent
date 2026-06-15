import os

os.environ["BACKEND_SKIP_ENV_FILE"] = "1"

from fastapi.testclient import TestClient

import backend.main as main_module
import backend.runtime_store as runtime_store
from backend.main import app
from backend.settings import Settings


client = TestClient(app)


def test_health_check_reports_service_name():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "exam-review-agent-api",
    }


def test_subjects_and_detail_are_available():
    response = client.get("/api/subjects")

    assert response.status_code == 200
    subjects = response.json()
    assert len(subjects) == 4
    assert subjects[0]["id"] == "data-structure"
    assert subjects[0]["name"] == "数据结构"

    detail = client.get("/api/subjects/data-structure")
    assert detail.status_code == 200
    assert detail.json()["scope"] == "线性表、栈与队列、树与二叉树、图、查找、排序"


def test_missing_subject_returns_404():
    response = client.get("/api/subjects/not-found")

    assert response.status_code == 404
    assert response.json()["detail"] == "Subject not found"


def test_create_subject_persists_generated_profile(monkeypatch, tmp_path):
    store_path = tmp_path / "subjects.json"
    monkeypatch.setattr(runtime_store, "STORE_PATH", store_path)

    class FakeTool:
        def run(self, **kwargs):
            return {
                "scope": "操作系统概述、进程管理、内存管理",
                "chapters": [
                    {"id": "os-ch1", "title": "第 1 章 操作系统概述", "done": False, "active": True, "items": ["基本概念"]},
                ],
                "knowledgePoints": [
                    {"id": "os-kp1", "title": "进程与线程", "level": "必会", "mastery": 50, "subjectId": ""},
                ],
                "weakPoints": [],
                "recentChats": [],
                "conversation": [],
            }

    monkeypatch.setattr(main_module, "available_tools", lambda ctx: {"subject_profile_generator": FakeTool()})

    response = client.post(
        "/api/subjects",
        json={
            "name": "操作系统",
            "examDate": "2026-07-01",
            "dailyMinutes": 70,
            "base": "一般",
            "goal": "高分",
            "scope": "进程管理、内存管理",
            "questionTypes": ["选择题", "简答题"],
        },
    )

    assert response.status_code == 200
    subject = response.json()["subject"]
    assert subject["name"] == "操作系统"
    assert client.get(f"/api/subjects/{subject['id']}").json()["name"] == "操作系统"
    assert client.get(f"/api/chapters?subjectId={subject['id']}").json()[0]["title"] == "第 1 章 操作系统概述"


def test_conversation_can_be_scoped_to_chapter():
    response = client.get("/api/conversation?subjectId=calculus&chapterId=cal-ch3")

    assert response.status_code == 200
    data = response.json()
    assert "第 3 章 二重积分" in data[0]["content"]
    assert "独立对话" in data[1]["content"]


def test_dashboard_supporting_data_endpoints():
    assert client.get("/api/tasks/today").json()[0]["title"] == "复习「二叉树遍历」并完成 5 道练习"
    assert client.get("/api/knowledge-points").json()[0]["title"] == "线性表与链表操作"
    assert client.get("/api/knowledge-points?subjectId=data-structure").json()[0]["subjectId"] == "data-structure"
    assert client.get("/api/weak-points").json()[0]["level"] == "薄弱"
    assert client.get("/api/chats/recent").json()[0]["title"] == "二叉树为什么要做平衡？"
    assert client.get("/api/chats/recent?subjectId=calculus").json()[0]["subject"] == "高等数学（下）"
    assert client.get("/api/chapters").json()[0]["title"] == "第 1 章 绪论"
    assert client.get("/api/chapters?subjectId=calculus").json()[0]["title"] == "第 1 章 多元函数微分法"
    assert client.get("/api/conversation?subjectId=english").json()[0]["content"].startswith("四级阅读")
    assert client.get("/api/questions").json()[0]["answer"] == "C"
    assert client.get("/api/questions?subjectId=marxism").json()[0]["subject"] == "马克思主义基本原理"
    assert client.get("/api/mistakes").json()[0]["reason"] == "概念不清"
    assert client.get("/api/memory").json()["items"][0]["label"] == "讲解偏好"
    assert client.get("/api/sprint").json()["mustKnow"][0].startswith("Dijkstra")
    assert client.get("/api/research").json()["sources"][0]["site"] == "wikipedia.org"


def test_practice_submit_scores_choice_answers():
    response = client.post(
        "/api/practice/submit",
        json={"questionId": "q1", "answer": "C"},
    )

    assert response.status_code == 200
    assert response.json()["correct"] is True
    assert "堆优化" in response.json()["analysis"]


def test_practice_submit_rejects_unknown_question():
    response = client.post(
        "/api/practice/submit",
        json={"questionId": "missing", "answer": "A"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"


def test_generated_questions_fallback_and_submit_generated_question():
    response = client.post(
        "/api/questions/generate",
        json={"subjectId": "calculus", "count": 2, "existingQuestionIds": []},
    )

    assert response.status_code == 200
    questions = response.json()["questions"]
    assert len(questions) == 2
    assert questions[0]["subject"] == "高等数学（下）"

    submit_response = client.post(
        "/api/practice/submit",
        json={
            "questionId": "ai-test",
            "answer": questions[0]["answer"],
            "expected": questions[0]["answer"],
            "analysis": questions[0]["analysis"],
            "questionType": questions[0]["type"],
        },
    )

    assert submit_response.status_code == 200
    assert submit_response.json()["correct"] is True


def test_generated_questions_passes_requested_difficulty_to_model(monkeypatch):
    captured = {}

    class FakeDeepSeekClient:
        def __init__(self, **kwargs):
            pass

        def chat(self, system_prompt, user_message, max_tokens=1200, history=None, json_mode=False):
            captured["user_message"] = user_message
            return """
            [
              {
                "id": "model-1",
                "type": "选择题",
                "difficulty": "简单",
                "point": "重积分",
                "subject": "高等数学（下）",
                "content": "二重积分换序时首先应判断什么？",
                "options": [{"key": "A", "text": "积分区域"}, {"key": "B", "text": "被积函数符号"}],
                "answer": "A",
                "analysis": "换序必须先画出或描述积分区域，再重新确定上下限。"
              }
            ]
            """

    monkeypatch.setattr(main_module, "settings", Settings(deepseek_api_key="test-key"))
    monkeypatch.setattr(main_module, "DeepSeekClient", FakeDeepSeekClient)

    response = client.post(
        "/api/questions/generate",
        json={
            "subjectId": "calculus",
            "count": 1,
            "difficulty": "困难",
            "existingQuestionIds": [],
        },
    )

    assert response.status_code == 200
    assert response.json()["questions"][0]["difficulty"] == "困难"
    assert "目标难度：困难" in captured["user_message"]


def test_generated_questions_normalizes_model_object_reply(monkeypatch):
    class FakeDeepSeekClient:
        def __init__(self, **kwargs):
            pass

        def chat(self, system_prompt, user_message, max_tokens=1200, history=None, json_mode=False):
            return """
            ```json
            {
              "id": "math_001",
              "type": "single",
              "difficulty": 3,
              "point": 5,
              "subject": "高等数学（下）",
              "content": "求函数 f(x,y)=x^3+y^3-3xy 的极值点。",
              "options": [{"key": "A", "text": "(0,0)是极大值点"}, {"key": "C", "text": "(1,1)是极小值点"}],
              "answer": "C",
              "analysis": "先求驻点，再用二阶判别法。"
            }
            ```
            """

    monkeypatch.setattr(main_module, "settings", Settings(deepseek_api_key="test-key"))
    monkeypatch.setattr(main_module, "DeepSeekClient", FakeDeepSeekClient)

    response = client.post(
        "/api/questions/generate",
        json={
            "subjectId": "calculus",
            "count": 1,
            "difficulty": "困难",
            "focus": "重积分换元",
            "existingQuestionIds": [],
        },
    )

    assert response.status_code == 200
    question = response.json()["questions"][0]
    assert question["id"].startswith("ai-calculus-")
    assert question["type"] == "选择题"
    assert question["difficulty"] == "困难"
    assert question["point"] == "5"


def test_generated_questions_retries_after_malformed_model_reply(monkeypatch):
    calls = {"count": 0}

    class FakeDeepSeekClient:
        def __init__(self, **kwargs):
            pass

        def chat(self, system_prompt, user_message, max_tokens=1200, history=None, json_mode=False):
            calls["count"] += 1
            if calls["count"] == 1:
                return "这不是 JSON"
            return """
            [
              {
                "id": "model-1",
                "type": "选择题",
                "difficulty": "困难",
                "point": "重积分换元",
                "subject": "高等数学（下）",
                "content": "极坐标换元时面积元是什么？",
                "options": [{"key": "A", "text": "drdθ"}, {"key": "B", "text": "rdrdθ"}],
                "answer": "B",
                "analysis": "极坐标面积元需要乘雅可比因子 r。"
              }
            ]
            """

    monkeypatch.setattr(main_module, "settings", Settings(deepseek_api_key="test-key"))
    monkeypatch.setattr(main_module, "DeepSeekClient", FakeDeepSeekClient)

    response = client.post(
        "/api/questions/generate",
        json={
            "subjectId": "calculus",
            "count": 1,
            "difficulty": "困难",
            "focus": "重积分换元",
            "existingQuestionIds": [],
        },
    )

    assert response.status_code == 200
    assert calls["count"] == 2
    assert response.json()["questions"][0]["id"].startswith("ai-calculus-")


def test_generated_questions_filters_existing_content(monkeypatch):
    class FakeDeepSeekClient:
        def __init__(self, **kwargs):
            pass

        def chat(self, system_prompt, user_message, max_tokens=1200, history=None, json_mode=False):
            return """
            {
              "questions": [
                {
                  "id": "dup",
                  "type": "选择题",
                  "difficulty": "中等",
                  "point": "重积分",
                  "subject": "高等数学（下）",
                  "content": "已经出现过的题干",
                  "options": [{"key": "A", "text": "A"}, {"key": "B", "text": "B"}],
                  "answer": "A",
                  "analysis": "重复题"
                },
                {
                  "id": "new",
                  "type": "选择题",
                  "difficulty": "中等",
                  "point": "重积分",
                  "subject": "高等数学（下）",
                  "content": "新的重积分题干",
                  "options": [{"key": "A", "text": "A"}, {"key": "B", "text": "B"}],
                  "answer": "A",
                  "analysis": "新题"
                }
              ]
            }
            """

    monkeypatch.setattr(main_module, "settings", Settings(deepseek_api_key="test-key"))
    monkeypatch.setattr(main_module, "DeepSeekClient", FakeDeepSeekClient)

    response = client.post(
        "/api/questions/generate",
        json={
            "subjectId": "calculus",
            "count": 1,
            "existingQuestionContents": ["已经出现过的题干"],
        },
    )

    assert response.status_code == 200
    assert response.json()["questions"][0]["content"] == "新的重积分题干"


def test_practice_submit_uses_model_to_grade_subjective_generated_answers(monkeypatch):
    class FakeDeepSeekClient:
        def __init__(self, **kwargs):
            pass

        def chat(self, system_prompt, user_message, max_tokens=1200, history=None, json_mode=False):
            return """
            {
              "correct": false,
              "expected": "应说明先确定积分区域，再根据新的积分次序重写上下限。",
              "analysis": "你的回答太笼统，缺少积分区域和上下限重写两个评分点。"
            }
            """

    monkeypatch.setattr(main_module, "settings", Settings(deepseek_api_key="test-key"))
    monkeypatch.setattr(main_module, "DeepSeekClient", FakeDeepSeekClient)

    response = client.post(
        "/api/practice/submit",
        json={
            "questionId": "ai-subjective",
            "answer": "我觉得主要就是把积分顺序换一下，然后算出来。",
            "expected": "应说明先确定积分区域，再根据新的积分次序重写上下限。",
            "analysis": "参考解析",
            "questionType": "简答题",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["correct"] is False
    assert "缺少积分区域" in data["analysis"]


def test_diagnosis_answer_returns_mock_judgement():
    response = client.post(
        "/api/diagnosis/answer",
        json={"question": "Dijkstra 能处理负权边吗？", "answer": "不确定"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["judged"] == "存在薄弱点：最短路径"
    assert "最短路径" in data["nextSuggestion"]


def test_chat_uses_safe_fallback_without_external_key():
    response = client.post(
        "/api/chat",
        json={
            "message": "讲讲 Dijkstra",
            "subjectId": "data-structure",
            "history": [{"role": "user", "content": "我不懂最短路径"}],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "assistant"
    assert data["kind"] == "text"
    assert "Dijkstra" in data["content"]


def test_research_search_uses_safe_fallback_without_external_key():
    response = client.post(
        "/api/research/search",
        json={"query": "Dijkstra 算法"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "Dijkstra 算法"
    assert data["sources"][0]["site"] == "wikipedia.org"
