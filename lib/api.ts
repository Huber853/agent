import {
  chapters,
  conversation,
  getSubject as getMockSubject,
  knowledgePoints,
  memoryItems,
  memorySummaries,
  mistakes,
  questions,
  recentChats,
  researchPoints,
  researchSources,
  sprintErrors,
  sprintHotPoints,
  sprintMustKnow,
  subjects,
  todayTasks,
  weakPoints,
  type ChatMessage,
  type KnowledgePoint,
  type Mistake,
  type Question,
  type Subject,
} from "@/lib/mock-data"

export type Task = {
  id: string
  title: string
  subject: string
  done: boolean
  minutes: number
}

export type RecentChat = {
  id: string
  title: string
  subject: string
  time: string
  preview: string
}

export type Chapter = {
  id: string
  title: string
  done: boolean
  active?: boolean
}

export type ResearchData = {
  sources: typeof researchSources
  points: typeof researchPoints
}

export type MemoryData = {
  items: typeof memoryItems
  summaries: typeof memorySummaries
}

export type SprintData = {
  mustKnow: string[]
  hotPoints: typeof sprintHotPoints
  errors: string[]
}

export type PracticeResult = {
  questionId: string
  correct: boolean
  answer: string
  expected: string
  analysis: string
}

export type DiagnosisResult = {
  judged: string
  nextSuggestion: string
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
    })
    if (!response.ok) return fallback
    return (await response.json()) as T
  } catch {
    return fallback
  }
}

export async function postJson<T>(
  path: string,
  body: unknown,
  fallback: T,
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!response.ok) return fallback
    return (await response.json()) as T
  } catch {
    return fallback
  }
}

export const api = {
  subjects: () => getJson<Subject[]>("/api/subjects", subjects),
  subject: (id: string) => getJson<Subject>(`/api/subjects/${id}`, getMockSubject(id)),
  todayTasks: () => getJson<Task[]>("/api/tasks/today", todayTasks),
  weakPoints: (subjectId?: string) =>
    getJson<KnowledgePoint[]>(
      subjectId ? `/api/weak-points?subjectId=${subjectId}` : "/api/weak-points",
      subjectId ? weakPoints.filter((p) => p.subjectId === subjectId) : weakPoints,
    ),
  knowledgePoints: (subjectId?: string) =>
    getJson<KnowledgePoint[]>(
      subjectId
        ? `/api/knowledge-points?subjectId=${subjectId}`
        : "/api/knowledge-points",
      subjectId
        ? knowledgePoints.filter((p) => p.subjectId === subjectId)
        : knowledgePoints,
    ),
  recentChats: () => getJson<RecentChat[]>("/api/chats/recent", recentChats),
  chapters: () => getJson<Chapter[]>("/api/chapters", chapters),
  conversation: () => getJson<ChatMessage[]>("/api/conversation", conversation),
  questions: () => getJson<Question[]>("/api/questions", questions),
  mistakes: () => getJson<Mistake[]>("/api/mistakes", mistakes),
  memory: () =>
    getJson<MemoryData>("/api/memory", {
      items: memoryItems,
      summaries: memorySummaries,
    }),
  sprint: () =>
    getJson<SprintData>("/api/sprint", {
      mustKnow: sprintMustKnow,
      hotPoints: sprintHotPoints,
      errors: sprintErrors,
    }),
  research: () =>
    getJson<ResearchData>("/api/research", {
      sources: researchSources,
      points: researchPoints,
    }),
}

export function fallbackChat(message: string): ChatMessage {
  return {
    id: `fallback-${Date.now()}`,
    role: "assistant",
    kind: "text",
    content:
      message.includes("Dijkstra") || message.includes("最短路径")
        ? "Dijkstra 适合非负权的单源最短路径问题。核心是每次确定当前距离最小的点，再用它更新相邻点距离。"
        : "我会先抓住核心概念，再配一道小题帮你确认理解。你可以继续问具体知识点。",
  }
}
