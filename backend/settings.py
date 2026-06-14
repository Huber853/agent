import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    deepseek_api_key: str | None = None
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-v4-flash"
    tavily_api_key: str | None = None
    tavily_base_url: str = "https://api.tavily.com"
    allowed_origins: tuple[str, ...] = ("http://localhost:3000", "http://127.0.0.1:3000")


def load_settings() -> Settings:
    load_env_files()
    origins = os.getenv("BACKEND_CORS_ORIGINS")
    allowed_origins = tuple(origin.strip() for origin in origins.split(",")) if origins else Settings.allowed_origins
    return Settings(
        deepseek_api_key=os.getenv("DEEPSEEK_API_KEY"),
        deepseek_base_url=os.getenv("DEEPSEEK_BASE_URL", Settings.deepseek_base_url),
        deepseek_model=os.getenv("DEEPSEEK_MODEL", Settings.deepseek_model),
        tavily_api_key=os.getenv("TAVILY_API_KEY"),
        tavily_base_url=os.getenv("TAVILY_BASE_URL", Settings.tavily_base_url),
        allowed_origins=allowed_origins,
    )


def load_env_files() -> None:
    if os.getenv("BACKEND_SKIP_ENV_FILE") == "1":
        return
    for path in (Path(".env"), Path("backend/.env")):
        if not path.exists():
            continue
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
