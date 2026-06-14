import { PageHeader } from "@/components/page-header"
import { DiagnosisFlow } from "@/components/diagnosis/diagnosis-flow"

export default function DiagnosisPage() {
  return (
    <>
      <PageHeader
        title="掌握情况诊断"
        description="对话式问答 + 小测验，快速定位你的薄弱点"
      />
      <div className="p-4 md:p-6">
        <DiagnosisFlow />
      </div>
    </>
  )
}
