"use client"

import { useState } from "react"
import { Check, X, ChevronRight, Sparkles, RotateCcw, BookmarkPlus, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { Question } from "@/lib/mock-data"
import { postJson, type PracticeResult, type QuestionGenerateResult } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type AnswerRecord = {
  questionId: string
  given: string
  correct: boolean
}

export function PracticeRunner({
  questions,
  subjectId,
}: {
  questions: Question[]
  subjectId?: string
}) {
  const [questionList, setQuestionList] = useState<Question[]>(questions)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string>("")
  const [shortText, setShortText] = useState("")
  const [revealed, setRevealed] = useState(false)
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<PracticeResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)

  const q = questionList[index]
  const isChoice = q.type === "选择题" || q.type === "判断题"
  const total = questionList.length

  async function submit() {
    if (isChoice && !selected) {
      toast.error("请先选择一个答案")
      return
    }
    if (!isChoice && !shortText.trim()) {
      toast.error("请先写下你的作答")
      return
    }
    const given = isChoice ? selected : shortText
    setSubmitting(true)
    const fallbackResult: PracticeResult = {
      questionId: q.id,
      correct: isChoice ? selected === q.answer : shortText.length > 20,
      answer: given,
      expected: q.answer,
      analysis: q.analysis,
    }
    const apiResult = await postJson<PracticeResult>(
      "/api/practice/submit",
      {
        questionId: q.id,
        answer: given,
        expected: q.answer,
        analysis: q.analysis,
        questionType: q.type,
      },
      fallbackResult,
    )
    setResult(apiResult)
    setRecords((prev) => [...prev, { questionId: q.id, given, correct: apiResult.correct }])
    setRevealed(true)
    setSubmitting(false)
  }

  function next() {
    if (index + 1 >= total) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected("")
    setShortText("")
    setRevealed(false)
    setResult(null)
  }

  function restart() {
    setIndex(0)
    setSelected("")
    setShortText("")
    setRevealed(false)
    setRecords([])
    setFinished(false)
    setResult(null)
  }

  async function generateMore() {
    setGenerating(true)
    const fallbackQuestions = questionList.map((question) => ({
      ...question,
      id: `local-${question.id}-${Date.now()}`,
    })).slice(0, 3)
    const result = await postJson<QuestionGenerateResult>(
      "/api/questions/generate",
      {
        subjectId,
        count: 5,
        focus: q?.point,
        existingQuestionIds: questionList.map((question) => question.id),
      },
      { questions: fallbackQuestions },
    )
    if (result.questions.length === 0) {
      toast.error("暂时没有生成新题")
    } else {
      const nextIndex = questionList.length
      setQuestionList((prev) => [...prev, ...result.questions])
      setIndex(nextIndex)
      setSelected("")
      setShortText("")
      setRevealed(false)
      setResult(null)
      setFinished(false)
      toast.success(`已生成 ${result.questions.length} 道新题`)
    }
    setGenerating(false)
  }

  if (finished) {
    const correctCount = records.filter((r) => r.correct).length
    const rate = Math.round((correctCount / total) * 100)
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Trophy className="size-7" />
            </div>
            <CardTitle className="text-xl">练习完成</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold">{total}</span>
                <span className="text-xs text-muted-foreground">总题数</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-primary">{correctCount}</span>
                <span className="text-xs text-muted-foreground">答对</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold">{rate}%</span>
                <span className="text-xs text-muted-foreground">正确率</span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="text-sm font-semibold">AI 学习分析</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                本次练习集中在「图的最短路径」。你在概念辨析题上仍有失分，建议重点复习 Dijkstra
                的适用条件与负权边处理。错题已自动加入错题本，明日计划将优先安排相关变式题。
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={restart}>
                <RotateCcw data-icon="inline-start" />
                再练一组
              </Button>
              <Button className="flex-1" disabled={generating} onClick={() => void generateMore()}>
                <Sparkles data-icon="inline-start" />
                {generating ? "生成中" : "AI 再生成"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lastRecord = records.find((r) => r.questionId === q.id)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            第 {index + 1} / {total} 题
          </span>
          <span>{q.subject}</span>
        </div>
        <Progress value={((index + (revealed ? 1 : 0)) / total) * 100} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{q.type}</Badge>
            <Badge variant="outline">{q.difficulty}</Badge>
            <Badge variant="outline">{q.point}</Badge>
          </div>
          <CardTitle className="mt-2 text-base leading-relaxed">{q.content}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isChoice ? (
            <div className="flex flex-col gap-2">
              {q.options?.map((opt) => {
                const isPicked = selected === opt.key
                const isAnswer = q.answer === opt.key
                const showState = revealed
                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={revealed}
                    onClick={() => setSelected(opt.key)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-left text-sm transition-colors",
                      !revealed && isPicked && "border-primary bg-accent",
                      !revealed && !isPicked && "hover:bg-muted",
                      showState && isAnswer && "border-primary bg-primary/10",
                      showState && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                        isPicked && !revealed && "border-primary text-primary",
                        showState && isAnswer && "border-primary bg-primary text-primary-foreground",
                        showState && isPicked && !isAnswer && "border-destructive bg-destructive text-white",
                      )}
                    >
                      {showState && isAnswer ? (
                        <Check className="size-3.5" />
                      ) : showState && isPicked && !isAnswer ? (
                        <X className="size-3.5" />
                      ) : (
                        opt.key
                      )}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <Textarea
              placeholder="在此写下你的解答，AI 会按评分点为你打分..."
              value={shortText}
              onChange={(e) => setShortText(e.target.value)}
              disabled={revealed}
              rows={5}
            />
          )}

          {revealed && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                {result?.correct ? (
                  <Badge className="gap-1 bg-primary text-primary-foreground">
                    <Check className="size-3" /> 回答正确
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <X className="size-3" /> {isChoice ? "回答错误" : "需要加强"}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  正确答案：<span className="font-medium text-foreground">{result?.expected ?? q.answer}</span>
                </span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">AI 解析</span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{result?.analysis ?? q.analysis}</p>
                </div>
              </div>
              {!result?.correct && (
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => toast.success("已加入错题本")}
                >
                  <BookmarkPlus data-icon="inline-start" />
                  加入错题本
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" disabled={generating || submitting} onClick={() => void generateMore()}>
          <Sparkles data-icon="inline-start" />
          {generating ? "生成中" : "AI 生成新题"}
        </Button>
        {!revealed ? (
          <Button disabled={submitting} onClick={() => void submit()}>
            {submitting ? "批改中" : "提交作答"}
          </Button>
        ) : (
          <Button onClick={next}>
            {index + 1 >= total ? "查看结果" : "下一题"}
            <ChevronRight data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  )
}
