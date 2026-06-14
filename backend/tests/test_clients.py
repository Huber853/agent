import httpx
import json

from backend.clients import DeepSeekClient, TavilyClient


class FakeTransport(httpx.BaseTransport):
    def __init__(self, payload):
        self.payload = payload
        self.requests = []

    def handle_request(self, request):
        self.requests.append(request)
        return httpx.Response(200, json=self.payload, request=request)


def test_deepseek_client_posts_openai_compatible_chat_request():
    transport = FakeTransport(
        {
            "choices": [
                {
                    "message": {
                        "content": "这是来自模型的讲解。",
                    }
                }
            ]
        }
    )
    client = DeepSeekClient(
        api_key="test-key",
        base_url="https://api.deepseek.com",
        http_client=httpx.Client(transport=transport),
    )

    result = client.chat(
        "系统提示",
        "用户问题",
        history=[{"role": "assistant", "content": "上一轮回答"}],
    )

    assert result == "这是来自模型的讲解。"
    request = transport.requests[0]
    assert request.url == "https://api.deepseek.com/chat/completions"
    assert request.headers["authorization"] == "Bearer test-key"
    body = json.loads(request.content)
    assert body["model"] == "deepseek-v4-flash"
    assert body["max_tokens"] == 1200
    assert body["messages"][1] == {"role": "assistant", "content": "上一轮回答"}


def test_tavily_client_posts_search_request():
    transport = FakeTransport(
        {
            "results": [
                {
                    "title": "Dijkstra",
                    "url": "https://example.com/dijkstra",
                    "content": "short summary",
                }
            ]
        }
    )
    client = TavilyClient(
        api_key="test-key",
        base_url="https://api.tavily.com",
        http_client=httpx.Client(transport=transport),
    )

    results = client.search("Dijkstra")

    assert results == [
        {
            "title": "Dijkstra",
            "url": "https://example.com/dijkstra",
            "content": "short summary",
        }
    ]
    request = transport.requests[0]
    assert request.url == "https://api.tavily.com/search"
    assert request.headers["authorization"] == "Bearer test-key"
    assert b"Dijkstra" in request.content
