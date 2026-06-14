from backend.settings import load_env_files


def test_load_env_files_keeps_existing_environment_values(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text("DEEPSEEK_API_KEY=file-key\nTAVILY_API_KEY=file-tavily\n", encoding="utf-8")
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("BACKEND_SKIP_ENV_FILE", raising=False)
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)
    monkeypatch.setenv("DEEPSEEK_API_KEY", "existing-key")

    load_env_files()

    assert "existing-key" == __import__("os").environ["DEEPSEEK_API_KEY"]
    assert "file-tavily" == __import__("os").environ["TAVILY_API_KEY"]
