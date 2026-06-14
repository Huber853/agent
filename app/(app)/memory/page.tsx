import Link from "next/link"
import { Brain, CalendarDays, MessageSquareText, PencilRuler, Sparkles } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/lib/api"

export default async function MemoryPage() {
  const { items: memoryItems, summaries: memorySummaries } = await api.memory()

  return (
    <>
      <PageHeader
        title="长期记忆"
        description="记录你的学习偏好、常错类型和阶段性进步。"
        actions={
          <Button variant="outline" render={<Link href="/learn" />}>
            <MessageSquareText data-icon="inline-start" />
            用记忆继续学习
          </Button>
        }
      />

      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-4 text-primary" />
              学习画像
            </CardTitle>
            <CardDescription>Agent 在后续讲解、出题和计划中会参考这些信息</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {memoryItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.label}</p>
                  <Badge variant="secondary">已记住</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              本周建议
            </CardTitle>
            <CardDescription>根据记忆自动调整复习节奏</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">讲解方式</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                先给核心思想，再给最小例题，最后用一句话压缩总结。
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">练习安排</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                晚间优先做短组题，每组 20-30 分钟，错题次日复现。
              </p>
            </div>
            <Button render={<Link href="/practice" />}>
              <PencilRuler data-icon="inline-start" />
              生成记忆驱动练习
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              阶段总结
            </CardTitle>
            <CardDescription>按周沉淀的复习变化</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {memorySummaries.map((summary) => (
              <div key={summary.id} className="rounded-lg border p-3">
                <Badge variant="outline">{summary.date}</Badge>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {summary.text}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
