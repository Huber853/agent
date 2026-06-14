"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/api"
import { cn } from "@/lib/utils"

export function TodayTasks({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const doneCount = tasks.filter((t) => t.done).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          已完成 {doneCount}/{tasks.length}
        </span>
        <span>
          预计 {tasks.reduce((a, t) => a + t.minutes, 0)} 分钟
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 rounded-lg border bg-card p-3"
          >
            <Checkbox
              id={task.id}
              checked={task.done}
              onCheckedChange={(v) =>
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === task.id ? { ...t, done: Boolean(v) } : t,
                  ),
                )
              }
              className="mt-0.5"
            />
            <label htmlFor={task.id} className="flex-1 cursor-pointer">
              <p
                className={cn(
                  "text-sm font-medium leading-snug",
                  task.done && "text-muted-foreground line-through",
                )}
              >
                {task.title}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant="outline">{task.subject}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {task.minutes} 分钟
                </span>
              </div>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
