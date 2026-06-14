import Link from "next/link"
import {
  CalendarClock,
  MessagesSquare,
  PencilRuler,
  NotebookPen,
  Zap,
  TrendingUp,
  Target,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { LevelBadge } from "@/components/level-badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { api } from "@/lib/api"

function PointList({ items }: { items: { id: string; title: string; mastery: number; level: string }[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">暂无该类知识点</p>
  }
  return (
    <div className="flex flex-col gap-3">
      {items.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{p.title}</span>
              <LevelBadge level={p.level} />
            </div>
            <Progress value={p.mastery} className="mt-2" />
          </div>
          <span className="w-10 text-right text-sm text-muted-foreground">{p.mastery}%</span>
        </div>
      ))}
    </div>
  )
}

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [subject, knowledgePoints, weakPoints, recentChats, chapters] = await Promise.all([
    api.subject(id),
    api.knowledgePoints(id),
    api.weakPoints(id),
    api.recentChats(id),
    api.chapters(id),
  ])

  const allPoints = [
    ...knowledgePoints,
    ...weakPoints
      .filter((w) => !knowledgePoints.some((k) => k.title === w.title)),
  ]
  const must = allPoints.filter((p) => p.level === "必会")
  const often = allPoints.filter((p) => p.level === "常考")
  const weak = allPoints.filter((p) => p.level === "薄弱")

  const actions = [
    { title: "开始对话学习", href: `/learn?subjectId=${id}`, icon: MessagesSquare, primary: true },
    { title: "生成练习题", href: `/practice?subjectId=${id}`, icon: PencilRuler },
    { title: "查看错题本", href: "/mistakes", icon: NotebookPen },
    { title: "考前冲刺", href: "/sprint", icon: Zap },
  ]

  return (
    <>
      <PageHeader
        title={`${subject.emoji} ${subject.name}`}
        description="科目复习中心"
        actions={
          <Button render={<Link href={`/learn?subjectId=${id}`} />}>
            <MessagesSquare data-icon="inline-start" />
            继续学习
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* 概况 */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <CalendarClock className="size-4" />
                考试倒计时
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-primary">
                {subject.daysLeft}
                <span className="ml-1 text-sm text-muted-foreground">天</span>
              </p>
              <p className="text-xs text-muted-foreground">{subject.examDate}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <TrendingUp className="size-4" />
                总体掌握度
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{subject.mastery}%</p>
              <Progress value={subject.mastery} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Target className="size-4" />
                复习计划完成度
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{subject.progress}%</p>
              <Progress value={subject.progress} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {actions.map((a) => (
            <Button
              key={a.href}
              variant={a.primary ? "default" : "outline"}
              className="h-auto justify-start gap-3 py-3"
              render={<Link href={a.href} />}
            >
              <a.icon data-icon="inline-start" />
              {a.title}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 复习大纲 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>复习大纲</CardTitle>
              <CardDescription>{subject.scope}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion defaultValue={chapters.find((chapter) => chapter.active)?.title ? [chapters.find((chapter) => chapter.active)!.title] : undefined}>
                {chapters.map((chapter) => (
                  <AccordionItem key={chapter.id} value={chapter.title}>
                    <AccordionTrigger>{chapter.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-1.5">
                        {(chapter.items ?? []).map((it) => (
                          <Badge key={it} variant="outline">
                            {it}
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* 最近学习记录 */}
          <Card>
            <CardHeader>
              <CardTitle>最近学习记录</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {recentChats.slice(0, 4).map((c) => (
                <div key={c.id} className="rounded-lg border p-3">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 知识点 */}
        <Card>
          <CardHeader>
            <CardTitle>知识点掌握</CardTitle>
            <CardDescription>按重要程度分类查看</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="must">
              <TabsList>
                <TabsTrigger value="must">必会 ({must.length})</TabsTrigger>
                <TabsTrigger value="often">常考 ({often.length})</TabsTrigger>
                <TabsTrigger value="weak">薄弱 ({weak.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="must" className="mt-4">
                <PointList items={must} />
              </TabsContent>
              <TabsContent value="often" className="mt-4">
                <PointList items={often} />
              </TabsContent>
              <TabsContent value="weak" className="mt-4">
                <PointList items={weak} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
