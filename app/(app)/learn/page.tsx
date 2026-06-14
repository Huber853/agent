import { LearnWorkspace } from "@/components/learn/learn-workspace"
import { api } from "@/lib/api"
import { currentSubjectId } from "@/lib/mock-data"

export default async function LearnPage() {
  const [subject, messages, chapters, recentChats, memory] = await Promise.all([
    api.subject(currentSubjectId),
    api.conversation(),
    api.chapters(),
    api.recentChats(),
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
