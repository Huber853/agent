import Link from "next/link"
import { ArrowRight, CheckCircle2, ClipboardList, Flame, Zap } from "lucide-react"

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
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"

export default async function SprintPage() {
  const {
    mustKnow: sprintMustKnow,
    hotPoints: sprintHotPoints,
    errors: sprintErrors,
  } = await api.sprint()

  return (
    <>
      <PageHeader
        title="考前冲刺"
        description="把必背结论、热点题型和易错点压缩成最后一轮清单。"
        actions={
          <Button render={<Link href="/practice" />}>
            <Zap data-icon="inline-start" />
            开始模拟
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>冲刺完成度</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">62%</p>
              <Progress value={62} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今日建议</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-primary">90</p>
              <p className="text-xs text-muted-foreground">分钟：速记 30 + 套题 60</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>高频风险</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-destructive">
                {sprintErrors.length}
              </p>
              <p className="text-xs text-muted-foreground">需要考前复现</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4" />
                必会速记
              </CardTitle>
              <CardDescription>进考场前要能脱口而出的结论</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {sprintMustKnow.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-lg border p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="size-4 text-primary" />
                高频考点
              </CardTitle>
              <CardDescription>优先级越高越先刷题</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {sprintHotPoints.map((point) => (
                <div key={point.title} className="rounded-lg border p-3">
                  <p className="text-sm font-medium leading-relaxed">{point.title}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Badge variant="secondary">{point.weight}</Badge>
                    <Button size="sm" variant="ghost" render={<Link href="/practice" />}>
                      练
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              考前易错提醒
            </CardTitle>
            <CardDescription>最后一轮不要再踩的坑</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {sprintErrors.map((error) => (
              <div key={error} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-sm leading-relaxed">{error}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
