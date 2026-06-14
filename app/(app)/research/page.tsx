import { ResearchWorkspace } from "@/components/research/research-workspace"
import { api } from "@/lib/api"

export default async function ResearchPage() {
  const research = await api.research()

  return <ResearchWorkspace initialSources={research.sources} initialPoints={research.points} />
}
