"use client"

import { useState } from "react"
import { Search, Globe, Sparkles, ExternalLink, Check, Loader2, BookmarkPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group"
import { researchSources, researchPoints } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const steps = [
  { label: "解析问题", detail: "理解你想研究的知识点范围" },
  { label: "检索网络", detail: "搜索权威教材、课程与百科" },
  { label: "筛选来源", detail: "评估可信度并去重" },
  { label: "归纳整理", detail: "生成结构化复习笔记" },
]

const suggested = [
  "Dijkstra 算法的适用条件",
  "最短路径算法复杂度对比",
  "负权边为什么要用 Bellman-Ford",
  "Floyd 算法的状态转移方程",
]

const summaryParas = [
  "最短路径是图论中的核心问题，常见算法包括 Dijkstra、Bellman-Ford 和 Floyd。它们的区别主要体现在适用场景、能否处理负权边以及时间复杂度上。",
  "Dijkstra 采用贪心策略，每次从未确定的节点中选取距离最小的节点扩展，要求图中不含负权边；使用优先队列（堆）优化后复杂度为 O((V+E)logV)。",
  "当图中存在负权边时应使用 Bellman-Ford，它通过 V-1 轮松弛保证正确性，并能检测负权环；Floyd 则适合求解多源最短路，基于动态规划，复杂度为 O(V³)。",
]

export function ResearchWorkspace() {
  const [query, setQuery] = useState("")
  const [phase, setPhase] = useState<"idle" | "running" | "done">("done")
  const [activeStep, setActiveStep] = useState(steps.length)

  function runResearch(q: string) {
    if (!q.trim()) return
    setQuery(q)
    setPhase("running")
    setActiveStep(0)
    let i = 0
    const timer = setInterval(() => {
      i += 1
      setActiveStep(i)
      if (i >= steps.length) {
        clearInterval(timer)
        setPhase("done")
      }
    }, 700)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="输入你想深入研究的知识点，例如：Dijkstra 算法的应用场景"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runResearch(query)
              }}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={() => runResearch(query)} disabled={phase === "running"}>
                {phase === "running" ? "研究中" : "开始研究"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <div className="flex flex-wrap gap-2">
            {suggested.map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => runResearch(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                研究过程
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {steps.map((step, idx) => {
                const state =
                  idx < activeStep
                    ? "done"
                    : idx === activeStep && phase === "running"
                      ? "active"
                      : phase === "done"
                        ? "done"
                        : "idle"
                return (
                  <div key={step.label} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                        state === "done" && "border-primary bg-primary text-primary-foreground",
                        state === "active" && "border-primary text-primary",
                        state === "idle" && "border-border text-muted-foreground",
                      )}
                    >
                      {state === "done" ? (
                        <Check className="size-3.5" />
                      ) : state === "active" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{step.label}</span>
                      <span className="text-xs text-muted-foreground">{step.detail}</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {phase === "done" && (
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="size-4 text-primary" />
                  归纳笔记
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("已保存到「最短路径」知识卡片")}
                >
                  <BookmarkPlus data-icon="inline-start" />
                  存为知识卡片
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {summaryParas.map((p) => (
                  <p key={p.slice(0, 8)} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">提炼考点</span>
                  <div className="flex flex-wrap gap-2">
                    {researchPoints.map((pt) => (
                      <Badge key={pt.id} variant="secondary" className="gap-1">
                        {pt.title}
                        <span className="text-[10px] text-muted-foreground">· {pt.level}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  以上内容由 AI 基于 {researchSources.length} 个网络来源归纳，建议结合教材核对。
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="size-4 text-primary" />
                引用来源
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {researchSources.map((src) => (
                <a
                  key={src.id}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="group flex flex-col gap-1.5 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium leading-snug group-hover:text-accent-foreground">
                      {src.title}
                    </span>
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{src.summary}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {src.site}
                    </Badge>
                    <span className="text-xs text-muted-foreground">可信度 {src.level}</span>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
