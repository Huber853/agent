import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  MessagesSquare,
  PencilRuler,
  NotebookPen,
  Brain,
  Zap,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const mainNav: NavItem[] = [
  { title: "概览", href: "/", icon: LayoutDashboard },
  { title: "我的科目", href: "/subjects", icon: BookOpen },
  { title: "新建科目", href: "/subjects/new", icon: PlusCircle },
  { title: "对话学习", href: "/learn", icon: MessagesSquare },
  { title: "练习题", href: "/practice", icon: PencilRuler },
  { title: "错题本", href: "/mistakes", icon: NotebookPen },
  { title: "长期记忆", href: "/memory", icon: Brain },
  { title: "考前冲刺", href: "/sprint", icon: Zap },
]

export const footerNav: NavItem[] = [
  { title: "设置", href: "/settings", icon: Settings },
]
