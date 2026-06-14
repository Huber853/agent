import { Badge } from "@/components/ui/badge"

type Variant = React.ComponentProps<typeof Badge>["variant"]

const levelMap: Record<string, Variant> = {
  必会: "default",
  常考: "secondary",
  薄弱: "destructive",
  高频考点: "default",
  易混淆: "destructive",
  简单: "secondary",
  中等: "outline",
  困难: "destructive",
  未掌握: "destructive",
  复习中: "outline",
  已掌握: "secondary",
}

export function LevelBadge({ level }: { level: string }) {
  return <Badge variant={levelMap[level] ?? "outline"}>{level}</Badge>
}
