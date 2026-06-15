"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { api } from "@/lib/api"

const questionTypeOptions = [
  "选择题",
  "填空题",
  "简答题",
  "计算题",
  "代码题",
  "综合题",
]

export function NewSubjectForm() {
  const router = useRouter()
  const [base, setBase] = useState<string[]>(["一般"])
  const [goal, setGoal] = useState<string[]>(["稳过"])
  const [types, setTypes] = useState<string[]>(["选择题", "简答题"])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const examDate = String(form.get("examDate") ?? "")
    const dailyMinutes = Number(form.get("dailyMinutes") ?? 60)
    const scope = String(form.get("scope") ?? "").trim()
    if (!name || !examDate) {
      toast.error("请填写科目名称和考试日期")
      return
    }

    setSubmitting(true)
    try {
      const result = await api.createSubject({
        name,
        examDate,
        dailyMinutes,
        base: base[0] ?? "一般",
        goal: goal[0] ?? "稳过",
        scope,
        questionTypes: types.length ? types : ["选择题", "简答题"],
      })
      toast.success("科目已创建，目录和知识点已生成")
      router.push(`/subjects/${result.subject.id}`)
      router.refresh()
    } catch {
      toast.error("创建失败，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>科目信息</CardTitle>
          <CardDescription>
            无需上传任何资料，输入基本信息后，AI 会先了解你的掌握情况，再联网整理资料并生成复习计划。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">科目名称</FieldLabel>
              <Input id="name" name="name" placeholder="例如：数据结构、高等数学、大学英语四级" required />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="date">考试日期</FieldLabel>
                <Input id="date" name="examDate" type="date" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="minutes">每天可复习时间（分钟）</FieldLabel>
                <Input
                  id="minutes"
                  name="dailyMinutes"
                  type="number"
                  min={10}
                  step={10}
                  defaultValue={60}
                  placeholder="60"
                />
              </Field>
            </div>

            <FieldSet>
              <FieldLegend>当前基础</FieldLegend>
              <FieldDescription>你对这门课目前的整体掌握感觉</FieldDescription>
              <ToggleGroup
                value={base}
                onValueChange={(v) => v.length && setBase(v)}
                variant="outline"
              >
                {["较弱", "一般", "较好"].map((o) => (
                  <ToggleGroupItem key={o} value={o}>
                    {o}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>目标</FieldLegend>
              <FieldDescription>不同目标会影响复习强度与题目难度</FieldDescription>
              <ToggleGroup
                value={goal}
                onValueChange={(v) => v.length && setGoal(v)}
                variant="outline"
              >
                {["及格", "稳过", "高分"].map((o) => (
                  <ToggleGroupItem key={o} value={o}>
                    {o}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>

            <Field>
              <FieldLabel htmlFor="scope">考试范围</FieldLabel>
              <Textarea
                id="scope"
                name="scope"
                rows={3}
                placeholder="例如：第 1-7 章，重点为树、图、排序；不考第 8 章"
              />
            </Field>

            <FieldSet>
              <FieldLegend>题型偏好</FieldLegend>
              <FieldDescription>可多选，AI 会据此出题</FieldDescription>
              <ToggleGroup
                value={types}
                onValueChange={setTypes}
                multiple
                variant="outline"
                className="flex-wrap"
              >
                {questionTypeOptions.map((o) => (
                  <ToggleGroupItem key={o} value={o}>
                    {o}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>

            <Field orientation="horizontal" className="justify-end">
              <Button type="button" variant="ghost" disabled={submitting} onClick={() => router.back()}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                <Sparkles data-icon="inline-start" />
                {submitting ? "生成中" : "创建并生成目录"}
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  )
}
