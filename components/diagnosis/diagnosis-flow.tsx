"use client"

import { useState } from "react"
import Link from "next/link"
import { Bot, User, Send, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { postJson, type DiagnosisResult } from "@/lib/api"
import { currentSubjectId } from "@/lib/mock-data"

type Step = {
  question: string
  options?: string[]
  weakIfAnswered?: string
  judged: string
}

const steps: Step[] = [
  {
    question: "我们先快速摸个底。二叉树的「中序遍历」顺序是怎样的？",
    options: ["根 → 左 → 右", "左 → 根 → 右", "左 → 右 → 根"],
    judged: "基础遍历掌握良好 ✅",
  },
  {
    question: "给定一个带「非负权」的有向图，求单源最短路径，你会优先用哪个算法？",
    options: ["Dijkstra", "Floyd", "不太确定"],
    weakIfAnswered: "图的最短路径",
    judged: "最短路径概念存在模糊，列为薄弱点",
  },
  {
    question: "快速排序在「已经有序」的数组上，最坏时间复杂度是多少？",
    options: ["O(nlogn)", "O(n²)", "记不清了"],
    weakIfAnswered: "排序复杂度",
    judged: "排序复杂度需要巩固",
  },
  {
    question: "最后一题：你觉得自己最没把握的章节是哪一部分？（直接回答即可）",
    judged: "已记录你的主观薄弱点",
  },
]

type Msg = { role: "assistant" | "user"; text: string }

export function DiagnosisFlow() {
  const [index, setIndex] = useState(0)
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: steps[0].question },
  ])
  const [weak, setWeak] = useState<string[]>(["平衡二叉树（AVL）旋转"])
  const [judgements, setJudgements] = useState<string[]>([])
  const [input, setInput] = useState("")

  const done = index >= steps.length
  const progress = Math.round((Math.min(index, steps.length) / steps.length) * 100)

  async function answer(text: string) {
    if (done || !text.trim()) return
    const step = steps[index]
    const next: Msg[] = [...messages, { role: "user", text }]
    const fallbackJudgement: DiagnosisResult = {
      judged: step.judged,
      nextSuggestion: "建议继续围绕该知识点做 2 道变式题。",
    }
    const result = await postJson<DiagnosisResult>(
      "/api/diagnosis/answer",
      { question: step.question, answer: text },
      fallbackJudgement,
    )
    setJudgements((j) => [...j, result.judged])
    if (step.weakIfAnswered && (text.includes("不") || text.includes("记不清") || text === "Floyd")) {
      setWeak((w) => (w.includes(step.weakIfAnswered!) ? w : [...w, step.weakIfAnswered!]))
    }
    const nextIndex = index + 1
    if (nextIndex < steps.length) {
      next.push({ role: "assistant", text: steps[nextIndex].question })
    } else {
      next.push({
        role: "assistant",
        text: "诊断完成！我已经大致了解你的掌握情况，可以为你生成个性化复习路径了。",
      })
    }
    setMessages(next)
    setIndex(nextIndex)
    setInput("")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* 对话诊断区 */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>掌握情况诊断</CardTitle>
              <CardDescription>通过几个小问题快速判断你的水平</CardDescription>
            </div>
            <Badge variant="secondary">{done ? "已完成" : `第 ${index + 1}/${steps.length} 题`}</Badge>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                    m.role === "assistant"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <Bot className="size-4" />
                  ) : (
                    <User className="size-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "assistant"
                      ? "rounded-tl-sm bg-muted"
                      : "rounded-tr-sm bg-primary text-primary-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {!done && (
            <div className="flex flex-col gap-3">
              {steps[index].options && (
                <div className="flex flex-wrap gap-2">
                  {steps[index].options!.map((o) => (
                    <Button
                      key={o}
                      variant="outline"
                      size="sm"
                      onClick={() => void answer(o)}
                    >
                      {o}
                    </Button>
                  ))}
                </div>
              )}
              <InputGroup>
                <InputGroupInput
                  placeholder="也可以直接输入你的回答…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void answer(input)
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton onClick={() => void answer(input)} aria-label="发送">
                    <Send />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          )}

          {done && (
            <Button className="w-full" render={<Link href={`/subjects/${currentSubjectId}`} />}>
              <Sparkles data-icon="inline-start" />
              生成复习路径
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 实时诊断结论 */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">当前判断</CardTitle>
            <CardDescription>随回答实时更新</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {judgements.length === 0 && (
              <p className="text-sm text-muted-foreground">回答问题后，这里会显示 AI 的判断。</p>
            )}
            {judgements.map((j, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{j}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" />
              初步薄弱点
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {weak.map((w) => (
              <div key={w} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-destructive" />
                <span className="text-sm">{w}</span>
              </div>
            ))}
            <Separator className="my-1" />
            <p className="text-xs text-muted-foreground">
              生成复习路径时，这些薄弱点会被优先安排。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
