import { LearnWorkspace } from "@/components/learn/learn-workspace"
import { api } from "@/lib/api"
import { currentSubjectId } from "@/lib/mock-data"

export default async function LearnPage({
  searchParams,
}: {
  searchParams?: Promise<{ subjectId?: string }>
}) {
  const subjectId = (await searchParams)?.subjectId ?? currentSubjectId
  const [subject, messages, chapters, recentChats, memory] = await Promise.all([
    api.subject(subjectId),
    api.conversation(subjectId),
    api.chapters(subjectId),
    api.recentChats(subjectId),
    api.memory(),
  ])

  return (
    <LearnWorkspace
      subject={subject}
      initialMessages={messages}
      chapters={chapters}
      recentChats={recentChats}
      memoryItems={memory.items}
    />
  )
}
