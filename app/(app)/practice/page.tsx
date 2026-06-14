import { PageHeader } from "@/components/page-header"
import { PracticeRunner } from "@/components/practice/practice-runner"
import { api } from "@/lib/api"

export default async function PracticePage() {
  const questions = await api.questions()

  return (
    <>
      <PageHeader
        title="智能练习"
        description="AI 根据你的薄弱点出题，作答后实时批改并讲解，错题自动归档。"
      />
      <PracticeRunner questions={questions} />
    </>
  )
}
