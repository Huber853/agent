import httpx


class DeepSeekClient:
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.deepseek.com",
        model: str = "deepseek-v4-flash",
        http_client: httpx.Client | None = None,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.http_client = http_client or httpx.Client(timeout=20)

    def chat(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 1200,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(
                {
                    "role": message.get("role", "user"),
                    "content": message.get("content", ""),
                }
                for message in history
                if message.get("role") in {"user", "assistant"} and message.get("content")
            )
        messages.append({"role": "user", "content": user_message})
        response = self.http_client.post(
            f"{self.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": self.model,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": max_tokens,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


class TavilyClient:
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.tavily.com",
        http_client: httpx.Client | None = None,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.http_client = http_client or httpx.Client(timeout=20)

    def search(self, query: str) -> list[dict[str, str]]:
        response = self.http_client.post(
            f"{self.base_url}/search",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "query": query,
                "search_depth": "basic",
                "max_results": 5,
            },
        )
        response.raise_for_status()
        return response.json().get("results", [])
