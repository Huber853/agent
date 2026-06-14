from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class PracticeSubmitRequest(BaseModel):
    question_id: str = Field(alias="questionId")
    answer: str


class PracticeSubmitResponse(BaseModel):
    question_id: str = Field(alias="questionId")
    correct: bool
    answer: str
    expected: str
    analysis: str


class DiagnosisAnswerRequest(BaseModel):
    question: str
    answer: str


class DiagnosisAnswerResponse(BaseModel):
    judged: str
    next_suggestion: str = Field(alias="nextSuggestion")


class ChatRequest(BaseModel):
    message: str
    subject_id: str | None = Field(default=None, alias="subjectId")


class ChatResponse(BaseModel):
    id: str
    role: str
    kind: str
    content: str


class ResearchSearchRequest(BaseModel):
    query: str
