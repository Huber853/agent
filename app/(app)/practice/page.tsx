import { PageHeader } from "@/components/page-header"
import { PracticeRunner } from "@/components/practice/practice-runner"
import { api } from "@/lib/api"

export default async function PracticePage({
  searchParams,
}: {
  searchParams?: Promise<{ subjectId?: string }>
}) {
  const subjectId = (await searchParams)?.subjectId
  const questions = await api.questions(subjectId)

  return (
    <>
      <PageHeader
        title="智能练习"
        description="AI 根据你的薄弱点出题，作答后实时批改并讲解，错题自动归档。"
      />
      <PracticeRunner questions={questions} subjectId={subjectId} />
    </>
  )
}
