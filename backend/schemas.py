from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class PracticeSubmitRequest(BaseModel):
    question_id: str = Field(alias="questionId")
    answer: str
    expected: str | None = None
    analysis: str | None = None
    question_type: str | None = Field(default=None, alias="questionType")


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
    history: list[dict[str, str]] = []


class ChatResponse(BaseModel):
    id: str
    role: str
    kind: str
    content: str


class QuestionGenerateRequest(BaseModel):
    subject_id: str | None = Field(default=None, alias="subjectId")
    count: int = 5
    focus: str | None = None
    existing_question_ids: list[str] = Field(default_factory=list, alias="existingQuestionIds")


class QuestionGenerateResponse(BaseModel):
    questions: list[dict]


class ResearchSearchRequest(BaseModel):
    query: str
