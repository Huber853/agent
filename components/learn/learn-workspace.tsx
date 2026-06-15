"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
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
  type ChatMessage,
  type Subject,
} from "@/lib/mock-data"
import { fallbackChat, postJson, type Chapter, type MemoryData, type RecentChat } from "@/lib/api"
import { cn } from "@/lib/utils"

const quickPrompts = [
  "继续讲",
  "换种方式解释",
  "出几道题",
  "我还是不懂",
  "总结这个知识点",
]

function subjectFallbackReply(text: string, subject: Subject, id: string): ChatMessage {
  if (text === "出几道题") {
    return {
      id,
      role: "assistant",
      kind: "example",
      content:
        `我先围绕「${subject.name}」给你一组兜底练习，重点覆盖：${subject.scope}。\n\n` +
        "1. 说出本章最容易混淆的一个概念，并写出它的适用条件。\n" +
        "2. 根据一个典型题，先判断考点，再列出 2 个解题步骤。\n" +
        "3. 写出你最不确定的一步，我再继续追问和纠正。\n\n" +
        "如果网络/API 恢复，我会直接生成更完整的 3 道带答案解析的题。",
    }
  }
  if (text === "总结这个知识点") {
    return {
      id,
      role: "assistant",
      kind: "knowledge",
      content:
        `当前科目是「${subject.name}」，复习范围是：${subject.scope}。\n\n` +
        "总结时先抓三件事：它解决什么问题、使用条件是什么、考试会怎么变形。再把公式、步骤或关键词压缩成一张清单，最后用一道小题验证。",
    }
  }
  return {
    ...fallbackChat(text),
    id,
  }
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

export function LearnWorkspace({
  subject,
  initialMessages,
  chapters,
  selectedChapterId,
  recentChats,
  memoryItems,
}: {
  subject: Subject
  initialMessages: ChatMessage[]
  chapters: Chapter[]
  selectedChapterId?: string
  recentChats: RecentChat[]
  memoryItems: MemoryData["items"]
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messageSeqRef = useRef(0)
  const activeChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters.find((chapter) => chapter.active) ?? chapters[0]

  useEffect(() => {
    setMessages(initialMessages)
    setInput("")
    setSending(false)
  }, [initialMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sending])

  async function send(text: string) {
    if (!text.trim() || sending) return
    const nextMessageId = (prefix: string) => {
      messageSeqRef.current += 1
      return `${prefix}-${Date.now()}-${messageSeqRef.current}`
    }
    const userMsg: ChatMessage = {
      id: nextMessageId("u"),
      role: "user",
      content: text,
    }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput("")
    setSending(true)
    const fallbackReply = subjectFallbackReply(text, subject, nextMessageId("a"))
    const reply = await postJson<ChatMessage>(
      "/api/chat",
      {
        message: text,
        subjectId: subject.id,
        chapterId: activeChapter?.id,
        history: nextMessages.slice(-8).map((message) => ({
          role: message.role,
          content: message.content,
        })),
      },
      fallbackReply,
    )
    setMessages((m) => [...m, reply])
    setSending(false)
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
                  <Link
                    key={c.id}
                    href={`/learn?subjectId=${subject.id}&chapterId=${c.id}`}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                      activeChapter?.id === c.id && "bg-accent font-medium text-accent-foreground",
                    )}
                  >
                    <span className="truncate">{c.title}</span>
                    {c.done ? (
                      <span className="text-xs text-muted-foreground">✓</span>
                    ) : activeChapter?.id === c.id ? (
                      <ChevronRight className="size-3.5" />
                    ) : null}
                  </Link>
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
            {sending && (
              <MessageBubble
                message={{
                  id: "thinking",
                  role: "assistant",
                  kind: "text",
                  content: `正在结合「${subject.name}」和前文整理回答...`,
                }}
              />
            )}
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
                  disabled={sending}
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
                    if (!sending) void send(input)
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
                  disabled={sending}
                  onClick={() => void send(input)}
                >
                  <Send data-icon="inline-start" />
                  {sending ? "发送中" : "发送"}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
  )
}
