import os

os.environ["BACKEND_SKIP_ENV_FILE"] = "1"

from fastapi.testclient import TestClient

from backend.main import app


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


def test_dashboard_supporting_data_endpoints():
    assert client.get("/api/tasks/today").json()[0]["title"] == "复习「二叉树遍历」并完成 5 道练习"
    assert client.get("/api/knowledge-points").json()[0]["title"] == "线性表与链表操作"
    assert client.get("/api/knowledge-points?subjectId=data-structure").json()[0]["subjectId"] == "data-structure"
    assert client.get("/api/weak-points").json()[0]["level"] == "薄弱"
    assert client.get("/api/chats/recent").json()[0]["title"] == "二叉树为什么要做平衡？"
    assert client.get("/api/chapters").json()[0]["title"] == "第 1 章 绪论"
    assert client.get("/api/questions").json()[0]["answer"] == "C"
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
        json={"message": "讲讲 Dijkstra", "subjectId": "data-structure"},
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
