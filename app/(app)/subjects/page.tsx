import Link from "next/link"
import { PlusCircle, CalendarClock, ArrowRight } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/lib/api"

const goalVariant = {
  及格: "outline",
  稳过: "secondary",
  高分: "default",
} as const

export default async function SubjectsPage() {
  const subjects = await api.subjects()

  return (
    <>
      <PageHeader
        title="我的科目"
        description={`正在复习 ${subjects.length} 个科目`}
        actions={
          <Button render={<Link href="/subjects/new" />}>
            <PlusCircle data-icon="inline-start" />
            新建科目
          </Button>
        }
      />

      <div className="grid gap-4 p-4 sm:grid-cols-2 md:p-6 xl:grid-cols-3">
        {subjects.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-2xl">
                  {s.emoji}
                </span>
                <Badge variant={goalVariant[s.goal]}>目标：{s.goal}</Badge>
              </div>
              <CardTitle className="mt-2">{s.name}</CardTitle>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="size-4" />
                {s.examDate} · 还剩 {s.daysLeft} 天
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">总体掌握度</span>
                  <span className="font-medium">{s.mastery}%</span>
                </div>
                <Progress value={s.mastery} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">计划完成度</span>
                  <span className="font-medium">{s.progress}%</span>
                </div>
                <Progress value={s.progress} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.questionTypes.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                render={<Link href={`/subjects/${s.id}`} />}
              >
                进入复习中心
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <Link
          href="/subjects/new"
          className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/30 hover:text-foreground"
        >
          <PlusCircle className="size-8" />
          <span className="font-medium">新建复习科目</span>
          <span className="text-xs">输入科目即可开始</span>
        </Link>
      </div>
    </>
  )
}
