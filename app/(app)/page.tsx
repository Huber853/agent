import Link from "next/link"
import {
  PlusCircle,
  MessagesSquare,
  PencilRuler,
  Zap,
  CalendarClock,
  Target,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { TodayTasks } from "@/components/dashboard/today-tasks"
import { LevelBadge } from "@/components/level-badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  currentSubjectId,
} from "@/lib/mock-data"
import { api } from "@/lib/api"

const quickActions = [
  { title: "新建科目", desc: "添加要复习的考试", href: "/subjects/new", icon: PlusCircle },
  { title: "继续学习", desc: "回到对话学习", href: "/learn", icon: MessagesSquare },
  { title: "开始测试", desc: "做几道练习题", href: "/practice", icon: PencilRuler },
  { title: "考前冲刺", desc: "速记 + 模拟卷", href: "/sprint", icon: Zap },
]

export default async function DashboardPage() {
  const [subjects, current, tasks, weakPoints, recentChats] = await Promise.all([
    api.subjects(),
    api.subject(currentSubjectId),
    api.todayTasks(),
    api.weakPoints(),
    api.recentChats(),
  ])

  return (
    <>
      <PageHeader
        title="学习概览"
        description="同学你好，今天也要继续加油 👏"
        actions={
          <Button render={<Link href="/learn" />}>
            <MessagesSquare data-icon="inline-start" />
            继续学习
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* 快速入口 */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/40"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <a.icon className="size-5" />
              </div>
              <p className="mt-3 flex items-center gap-1 font-medium">
                {a.title}
                <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 当前科目 + 倒计时 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardDescription>当前复习科目</CardDescription>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span>{current.emoji}</span>
                {current.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarClock className="size-4" />
                  考试倒计时
                </div>
                <p className="mt-1 text-2xl font-semibold text-primary">
                  {current.daysLeft}
                  <span className="ml-1 text-sm text-muted-foreground">天</span>
                </p>
                <p className="text-xs text-muted-foreground">{current.examDate}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="size-4" />
                  总体掌握度
                </div>
                <p className="mt-1 text-2xl font-semibold">{current.mastery}%</p>
                <Progress value={current.mastery} className="mt-2" />
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="size-4" />
                  计划完成度
                </div>
                <p className="mt-1 text-2xl font-semibold">{current.progress}%</p>
                <Progress value={current.progress} className="mt-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                render={<Link href={`/subjects/${current.id}`} />}
              >
                进入科目复习中心
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>

          {/* 今日学习任务 */}
          <Card>
            <CardHeader>
              <CardTitle>今日学习任务</CardTitle>
              <CardDescription>根据你的复习计划自动生成</CardDescription>
            </CardHeader>
            <CardContent>
              <TodayTasks initialTasks={tasks} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 薄弱知识点 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-destructive" />
                薄弱知识点
              </CardTitle>
              <CardDescription>建议优先攻克，提升性价比最高</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {weakPoints.map((kp) => (
                <div
                  key={kp.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{kp.title}</p>
                      <LevelBadge level={kp.level} />
                    </div>
                    <Progress value={kp.mastery} className="mt-2" />
                  </div>
                  <span className="w-10 text-right text-sm font-medium text-muted-foreground">
                    {kp.mastery}%
                  </span>
                  <Button size="sm" variant="ghost" render={<Link href="/learn" />}>
                    去学习
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 最近对话 */}
          <Card>
            <CardHeader>
              <CardTitle>最近对话</CardTitle>
              <CardDescription>继续未完成的学习</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {recentChats.map((c) => (
                <Link
                  key={c.id}
                  href="/learn"
                  className="rounded-lg border p-3 transition-colors hover:bg-accent/40"
                >
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.preview}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.subject}</span>
                    <span>{c.time}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 全部科目进度 */}
        <Card>
          <CardHeader>
            <CardTitle>全部科目</CardTitle>
            <CardDescription>{subjects.length} 个科目正在复习</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/subjects/${s.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40"
              >
                <span className="text-xl">{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <span className="text-xs text-muted-foreground">
                      还剩 {s.daysLeft} 天
                    </span>
                  </div>
                  <Progress value={s.mastery} className="mt-2" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
