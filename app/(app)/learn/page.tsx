import { LearnWorkspace } from "@/components/learn/learn-workspace"
import { api } from "@/lib/api"
import { currentSubjectId } from "@/lib/mock-data"

export default async function LearnPage({
  searchParams,
}: {
  searchParams?: Promise<{ subjectId?: string; chapterId?: string }>
}) {
  const params = await searchParams
  const subjectId = params?.subjectId ?? currentSubjectId
  const chapterId = params?.chapterId
  const [subject, messages, chapters, recentChats, memory] = await Promise.all([
    api.subject(subjectId),
    api.conversationForChapter(subjectId, chapterId),
    api.chapters(subjectId),
    api.recentChats(subjectId),
    api.memory(),
  ])

  return (
    <LearnWorkspace
      subject={subject}
      initialMessages={messages}
      chapters={chapters}
      selectedChapterId={chapterId}
      recentChats={recentChats}
      memoryItems={memory.items}
    />
  )
}
