from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class PracticeSubmitRequest(BaseModel):
    question_id: str = Field(alias="questionId")
    answer: str
    question_content: str | None = Field(default=None, alias="questionContent")
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
    chapter_id: str | None = Field(default=None, alias="chapterId")
    history: list[dict[str, str]] = []


class ChatResponse(BaseModel):
    id: str
    role: str
    kind: str
    content: str


class QuestionGenerateRequest(BaseModel):
    subject_id: str | None = Field(default=None, alias="subjectId")
    count: int = 5
    difficulty: str | None = None
    focus: str | None = None
    existing_question_ids: list[str] = Field(default_factory=list, alias="existingQuestionIds")
    existing_question_contents: list[str] = Field(default_factory=list, alias="existingQuestionContents")


class QuestionGenerateResponse(BaseModel):
    questions: list[dict]


class ResearchSearchRequest(BaseModel):
    query: str


class SubjectCreateRequest(BaseModel):
    name: str
    exam_date: str = Field(alias="examDate")
    daily_minutes: int = Field(default=60, alias="dailyMinutes")
    base: str = "一般"
    goal: str = "稳过"
    scope: str = ""
    question_types: list[str] = Field(default_factory=list, alias="questionTypes")


class SubjectCreateResponse(BaseModel):
    subject: dict
    chapters: list[dict]
    knowledge_points: list[dict] = Field(alias="knowledgePoints")
    weak_points: list[dict] = Field(alias="weakPoints")
