"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bot,
  User,
  Send,
  Lightbulb,
  FileText,
  Globe,
  ExternalLink,
  BookOpen,
  History,
  Brain,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  conversation,
  chapters,
  recentChats,
  memoryItems,
  getSubject,
  currentSubjectId,
  type ChatMessage,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const quickPrompts = [
  "继续讲",
  "换种方式解释",
  "出几道题",
  "我还是不懂",
  "总结这个知识点",
]

const cannedReply: Record<string, ChatMessage> = {
  出几道题: {
    id: "auto-ex",
    role: "assistant",
    kind: "example",
    content:
      "练习：已知有向图 A→B=2, B→C=3, A→C=10，用 Dijkstra 求 A 到 C 的最短距离是多少？\n（提示：比较直达与中转路径）",
  },
  总结这个知识点: {
    id: "auto-sum",
    role: "assistant",
    kind: "knowledge",
    content:
      "一句话总结：Dijkstra = 非负权单源最短路 + 贪心地每次确定当前最近的点 + 松弛邻居；堆优化后 O((V+E)logV)。",
  },
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  if (!isUser && message.kind && message.kind !== "text") {
    const cfg = {
      knowledge: { icon: Lightbulb, label: "知识点", tone: "text-chart-3" },
      example: { icon: FileText, label: "示例题", tone: "text-chart-2" },
      reference: { icon: Globe, label: "联网资料", tone: "text-primary" },
    }[message.kind]!
    return (
      <div className="flex gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" />
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm border bg-card p-3">
          <div className={cn("mb-1.5 flex items-center gap-1.5 text-xs font-medium", cfg.tone)}>
            <cfg.icon className="size-3.5" />
            {cfg.label}
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
          {message.kind === "reference" && (
            <a
              href="#"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              查看来源 <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-muted" : "bg-primary/10 text-primary",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted",
        )}
      >
        {message.content}
      </div>
    </div>
  )
}

export function LearnWorkspace() {
  const subject = getSubject(currentSubjectId)
  const [messages, setMessages] = useState<ChatMessage[]>(conversation)
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function send(text: string) {
    if (!text.trim()) return
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    }
    const reply: ChatMessage =
      cannedReply[text] ?? {
        id: `a-${Date.now()}`,
        role: "assistant",
        kind: "text",
        content:
          "好的，我换个角度再讲一遍：你可以把 Dijkstra 想象成「水波扩散」——从起点像波纹一样向外蔓延，最先到达某个点的那条路径就是最短路径。需要我配个图示或再出两道题练练吗？",
      }
    setMessages((m) => [...m, userMsg, reply])
    setInput("")
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* 左侧栏 */}
      <aside className="hidden w-72 shrink-0 flex-col border-r bg-sidebar/40 lg:flex">
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-5 p-4">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">当前科目</p>
              <p className="mt-0.5 flex items-center gap-2 font-medium">
                <span>{subject.emoji}</span>
                {subject.name}
              </p>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BookOpen className="size-3.5" />
                章节目录
              </p>
              <div className="flex flex-col gap-0.5">
                {chapters.map((c) => (
                  <button
                    key={c.id}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                      c.active && "bg-accent font-medium text-accent-foreground",
                    )}
                  >
                    <span className="truncate">{c.title}</span>
                    {c.done ? (
                      <span className="text-xs text-muted-foreground">✓</span>
                    ) : c.active ? (
                      <ChevronRight className="size-3.5" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <History className="size-3.5" />
                历史对话
              </p>
              <div className="flex flex-col gap-1">
                {recentChats.map((c) => (
                  <button
                    key={c.id}
                    className="rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <p className="truncate">{c.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.time}</p>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Brain className="size-3.5" />
                学习记忆
              </p>
              <div className="flex flex-col gap-2">
                {memoryItems.slice(0, 2).map((m) => (
                  <div key={m.id} className="rounded-md border bg-card p-2">
                    <p className="text-xs font-medium">{m.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* 主对话区 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ScrollArea className="flex-1">
          <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4 md:p-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* 输入区 */}
        <div className="border-t bg-background/80 p-3 backdrop-blur md:p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((q) => (
                <Button
                  key={q}
                  size="sm"
                  variant="outline"
                  onClick={() => send(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
            <InputGroup>
              <InputGroupTextarea
                placeholder="问点什么，或让我继续讲解…（Enter 发送）"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
              />
              <InputGroupAddon align="block-end">
                <Badge variant="ghost" className="text-muted-foreground">
                  {subject.emoji} {subject.name}
                </Badge>
                <InputGroupButton
                  className="ml-auto"
                  variant="default"
                  onClick={() => send(input)}
                >
                  <Send data-icon="inline-start" />
                  发送
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
  )
}
