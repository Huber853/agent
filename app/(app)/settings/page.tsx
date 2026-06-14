import { Bell, Moon, Save, ShieldCheck, SlidersHorizontal } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const reminderOptions = [
  { id: "daily-plan", label: "每天提醒我查看复习计划", checked: true },
  { id: "wrong-review", label: "错题次日自动提醒复盘", checked: true },
  { id: "exam-week", label: "考前 7 天切换为冲刺节奏", checked: false },
]

const dataOptions = [
  { id: "remember-style", label: "记住我的讲解偏好", checked: true },
  { id: "remember-errors", label: "记录常错知识点和题型", checked: true },
  { id: "share-report", label: "导出复习报告时包含学习画像", checked: false },
]

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="设置"
        description="调整复习节奏、提醒和记忆范围。"
        actions={
          <Button>
            <Save data-icon="inline-start" />
            保存设置
          </Button>
        }
      />

      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              复习偏好
            </CardTitle>
            <CardDescription>用于生成每日任务和练习难度</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="daily-minutes">默认每日复习时间</Label>
                <Input id="daily-minutes" type="number" defaultValue={90} min={10} step={10} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="study-time">常用学习时段</Label>
                <Input id="study-time" defaultValue="21:00 - 22:30" />
              </div>
            </div>
            <Separator />
            <div className="grid gap-3">
              <p className="text-sm font-medium">提醒规则</p>
              {reminderOptions.map((option) => (
                <label
                  key={option.id}
                  htmlFor={option.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                >
                  <Checkbox id={option.id} defaultChecked={option.checked} />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-4" />
              通知摘要
            </CardTitle>
            <CardDescription>当前提醒策略</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">每日计划</p>
              <p className="mt-1 text-sm text-muted-foreground">每天 21:00 前提醒</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">错题复盘</p>
              <p className="mt-1 text-sm text-muted-foreground">练习后第 2 天推送</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">主题</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Moon className="size-3.5" />
                跟随系统
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              记忆与数据
            </CardTitle>
            <CardDescription>控制 Agent 可以长期参考哪些学习信息</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {dataOptions.map((option) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
              >
                <Checkbox id={option.id} defaultChecked={option.checked} />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
