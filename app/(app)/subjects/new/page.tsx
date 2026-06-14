import { PageHeader } from "@/components/page-header"
import { NewSubjectForm } from "@/components/subjects/new-subject-form"

export default function NewSubjectPage() {
  return (
    <>
      <PageHeader title="新建科目" description="3 步开启一门课的 AI 复习" />
      <div className="p-4 md:p-6">
        <NewSubjectForm />
      </div>
    </>
  )
}
