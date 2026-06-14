import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Flame,
  NotebookPen,
  RotateCcw,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/lib/api"

const statusVariant = {
  未掌握: "destructive",
  复习中: "secondary",
  已掌握: "outline",
} as const

export default async function MistakesPage() {
  const mistakes = await api.mistakes()
  const unresolved = mistakes.filter((m) => m.status !== "已掌握").length
  const reviewed = mistakes.length - unresolved
  const masteryRate = Math.round((reviewed / mistakes.length) * 100)
  const topReasons = Array.from(new Set(mistakes.map((m) => m.reason))).slice(0, 4)

  return (
    <>
      <PageHeader
        title="错题本"
        description="集中复盘高频失分点，把错题转成下一轮练习计划。"
        actions={
          <Button render={<Link href="/practice" />}>
            <RotateCcw data-icon="inline-start" />
            再练一组
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <NotebookPen className="size-4" />
                错题总数
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{mistakes.length}</p>
              <p className="text-xs text-muted-foreground">来自最近练习与诊断</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <AlertTriangle className="size-4" />
                待巩固
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-destructive">{unresolved}</p>
              <p className="text-xs text-muted-foreground">优先安排变式题</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <BookOpenCheck className="size-4" />
                已转化
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{masteryRate}%</p>
              <Progress value={masteryRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>错题列表</CardTitle>
              <CardDescription>按错误次数和掌握状态优先复习</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {mistakes.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                    <Badge variant="outline">{item.subject}</Badge>
                    <Badge variant="outline">{item.reason}</Badge>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="size-3.5" />
                      错 {item.wrongCount} 次
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-relaxed">
                    {item.question}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      知识点：{item.point}
                    </span>
                    <Button size="sm" variant="ghost" render={<Link href="/learn" />}>
                      重新讲解
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>失分原因</CardTitle>
              <CardDescription>下一轮复习的出题依据</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {topReasons.map((reason) => {
                const count = mistakes.filter((m) => m.reason === reason).length
                const value = Math.round((count / mistakes.length) * 100)

                return (
                  <div key={reason}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{reason}</span>
                      <span className="text-muted-foreground">{count} 题</span>
                    </div>
                    <Progress value={value} />
                  </div>
                )
              })}
              <div className="rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
                建议先处理“概念不清”和“记忆错误”，它们最容易通过对话讲解和短测快速修正。
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
