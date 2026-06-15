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
        self.http_client = http_client or httpx.Client(timeout=60)

    def chat(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 1200,
        history: list[dict[str, str]] | None = None,
        json_mode: bool = False,
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
        body = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": max_tokens,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}
        response = self.http_client.post(
            f"{self.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json=body,
        )
        response.raise_for_status()
        data = response.json()
        message = data["choices"][0]["message"]
        content = message.get("content") or message.get("reasoning_content") or ""
        if not content.strip():
            raise ValueError("DeepSeek returned empty content")
        return content


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
