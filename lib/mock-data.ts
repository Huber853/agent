// 所有页面共享的 Mock 数据。后续接入真实接口时，只需替换这里的数据来源。

export type Mastery = "weak" | "normal" | "good"

export type Subject = {
  id: string
  name: string
  emoji: string
  examDate: string // ISO
  daysLeft: number
  dailyMinutes: number
  base: Mastery
  goal: "及格" | "稳过" | "高分"
  mastery: number // 0-100 总体掌握度
  progress: number // 复习计划完成度 0-100
  scope: string
  questionTypes: string[]
  color: string // tailwind class for accent dot
}

export type KnowledgePoint = {
  id: string
  title: string
  level: "必会" | "常考" | "薄弱"
  mastery: number
  subjectId: string
}

export type ChatMessage = {
  id: string
  role: "assistant" | "user"
  content: string
  kind?: "text" | "knowledge" | "example" | "reference"
}

export type Question = {
  id: string
  type: string
  difficulty: "简单" | "中等" | "困难"
  point: string
  subject: string
  content: string
  options?: { key: string; text: string }[]
  answer: string
  analysis: string
}

export type MistakeReason =
  | "概念不清"
  | "记忆错误"
  | "审题错误"
  | "计算错误"
  | "语法错误"
  | "知识点混淆"

export type Mistake = {
  id: string
  question: string
  subject: string
  point: string
  wrongCount: number
  reason: MistakeReason
  status: "未掌握" | "复习中" | "已掌握"
}

export const subjects: Subject[] = [
  {
    id: "data-structure",
    name: "数据结构",
    emoji: "🌲",
    examDate: "2026-06-28",
    daysLeft: 14,
    dailyMinutes: 90,
    base: "normal",
    goal: "高分",
    mastery: 68,
    progress: 54,
    scope: "线性表、栈与队列、树与二叉树、图、查找、排序",
    questionTypes: ["选择题", "简答题", "计算题", "代码题"],
    color: "bg-chart-1",
  },
  {
    id: "calculus",
    name: "高等数学（下）",
    emoji: "∫",
    examDate: "2026-06-22",
    daysLeft: 8,
    dailyMinutes: 120,
    base: "weak",
    goal: "稳过",
    mastery: 45,
    progress: 38,
    scope: "多元函数微分、重积分、曲线曲面积分、级数",
    questionTypes: ["选择题", "填空题", "计算题", "综合题"],
    color: "bg-chart-5",
  },
  {
    id: "english",
    name: "大学英语四级",
    emoji: "🔤",
    examDate: "2026-07-05",
    daysLeft: 21,
    dailyMinutes: 60,
    base: "good",
    goal: "高分",
    mastery: 78,
    progress: 72,
    scope: "听力、阅读、翻译、写作、核心词汇",
    questionTypes: ["选择题", "填空题", "简答题"],
    color: "bg-chart-2",
  },
  {
    id: "marxism",
    name: "马克思主义基本原理",
    emoji: "📖",
    examDate: "2026-07-01",
    daysLeft: 17,
    dailyMinutes: 45,
    base: "normal",
    goal: "及格",
    mastery: 60,
    progress: 48,
    scope: "唯物论、辩证法、认识论、唯物史观、政治经济学",
    questionTypes: ["选择题", "判断题", "简答题"],
    color: "bg-chart-3",
  },
]

export const currentSubjectId = "data-structure"

export function getSubject(id: string) {
  return subjects.find((s) => s.id === id) ?? subjects[0]
}

export const todayTasks = [
  { id: "t1", title: "复习「二叉树遍历」并完成 5 道练习", subject: "数据结构", done: true, minutes: 30 },
  { id: "t2", title: "对话讲解「图的最短路径 Dijkstra」", subject: "数据结构", done: false, minutes: 25 },
  { id: "t3", title: "高数：重积分换元法专项 8 题", subject: "高等数学（下）", done: false, minutes: 40 },
  { id: "t4", title: "四级核心词汇 List 12 速记", subject: "大学英语四级", done: false, minutes: 20 },
]

export const weakPoints: KnowledgePoint[] = [
  { id: "kp1", title: "图的最短路径（Dijkstra / Floyd）", level: "薄弱", mastery: 32, subjectId: "data-structure" },
  { id: "kp2", title: "平衡二叉树（AVL）旋转", level: "薄弱", mastery: 40, subjectId: "data-structure" },
  { id: "kp3", title: "重积分的换元与坐标变换", level: "薄弱", mastery: 28, subjectId: "calculus" },
  { id: "kp4", title: "幂级数收敛半径求解", level: "薄弱", mastery: 35, subjectId: "calculus" },
  { id: "kp5", title: "长难句翻译技巧", level: "薄弱", mastery: 52, subjectId: "english" },
]

export const knowledgePoints: KnowledgePoint[] = [
  { id: "ds-1", title: "线性表与链表操作", level: "必会", mastery: 88, subjectId: "data-structure" },
  { id: "ds-2", title: "栈与队列的应用", level: "必会", mastery: 80, subjectId: "data-structure" },
  { id: "ds-3", title: "二叉树遍历（前/中/后/层序）", level: "常考", mastery: 74, subjectId: "data-structure" },
  { id: "ds-4", title: "哈夫曼树与编码", level: "常考", mastery: 66, subjectId: "data-structure" },
  { id: "ds-5", title: "平衡二叉树（AVL）旋转", level: "薄弱", mastery: 40, subjectId: "data-structure" },
  { id: "ds-6", title: "图的最短路径（Dijkstra / Floyd）", level: "薄弱", mastery: 32, subjectId: "data-structure" },
  { id: "ds-7", title: "排序算法复杂度与稳定性", level: "常考", mastery: 70, subjectId: "data-structure" },
  { id: "ds-8", title: "哈希表与冲突解决", level: "必会", mastery: 76, subjectId: "data-structure" },
]

export const recentChats = [
  { id: "c1", title: "二叉树为什么要做平衡？", subject: "数据结构", time: "10 分钟前", preview: "AVL 树通过旋转维持左右子树高度差..." },
  { id: "c2", title: "Dijkstra 和 Floyd 区别", subject: "数据结构", time: "2 小时前", preview: "前者求单源最短路，后者求多源..." },
  { id: "c3", title: "重积分什么时候用极坐标？", subject: "高等数学（下）", time: "昨天", preview: "当积分区域是圆 / 扇形时优先考虑..." },
  { id: "c4", title: "四级写作怎么提升档次？", subject: "大学英语四级", time: "2 天前", preview: "用高级句型替换简单句，注意衔接词..." },
]

export const conversation: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "帮我讲讲图的最短路径里 Dijkstra 算法的核心思想，我总是搞不清。",
  },
  {
    id: "m2",
    role: "assistant",
    kind: "text",
    content:
      "没问题。Dijkstra 算法解决的是「单源最短路径」问题——从一个起点出发，求到其它所有顶点的最短距离。它的核心是贪心 + 逐步确定：每一步都从「还没确定的顶点」里，挑出当前距离最小的那个，把它标记为已确定，再用它去松弛（更新）邻居的距离。",
  },
  {
    id: "m3",
    role: "assistant",
    kind: "knowledge",
    content:
      "关键前提：所有边的权重必须为非负数。一旦出现负权边，Dijkstra 的贪心假设就会失效，这时应改用 Bellman-Ford。",
  },
  {
    id: "m4",
    role: "assistant",
    kind: "example",
    content:
      "例题：给定起点 A，边 A→B=1, A→C=4, B→C=2。求 A 到 C 的最短路。\n解：A→C 直接为 4，但 A→B→C = 1+2 = 3 更短，所以最短距离为 3。这正体现了「松弛」的过程。",
  },
  {
    id: "m5",
    role: "user",
    content: "那它的时间复杂度是多少？用堆优化呢？",
  },
  {
    id: "m6",
    role: "assistant",
    kind: "reference",
    content:
      "朴素实现是 O(V²)；用优先队列（小顶堆）优化后为 O((V+E)logV)，适合稀疏图。该结论来源见参考资料卡片。",
  },
]

export const chapters = [
  { id: "ch1", title: "第 1 章 绪论", done: true },
  { id: "ch2", title: "第 2 章 线性表", done: true },
  { id: "ch3", title: "第 3 章 栈与队列", done: true },
  { id: "ch4", title: "第 4 章 树与二叉树", done: false, active: true },
  { id: "ch5", title: "第 5 章 图", done: false },
  { id: "ch6", title: "第 6 章 查找", done: false },
  { id: "ch7", title: "第 7 章 排序", done: false },
]

export const researchSources = [
  {
    id: "r1",
    title: "Dijkstra 算法 - 维基百科",
    site: "wikipedia.org",
    summary: "单源最短路径算法，1956 年由 Edsger W. Dijkstra 提出，适用于非负权图。",
    level: "高",
  },
  {
    id: "r2",
    title: "图论最短路径专题（含例题）",
    site: "oi-wiki.org",
    summary: "系统整理 Dijkstra / Bellman-Ford / Floyd 的适用场景与复杂度对比。",
    level: "高",
  },
  {
    id: "r3",
    title: "考研数据结构真题解析",
    site: "kaoyan.com",
    summary: "近 5 年最短路径相关真题及评分点，含堆优化代码模板。",
    level: "中",
  },
]

export const researchPoints = [
  { id: "rp1", title: "Dijkstra 适用条件与贪心思想", level: "高频考点" as const },
  { id: "rp2", title: "堆优化复杂度推导", level: "高频考点" as const },
  { id: "rp3", title: "Floyd 多源最短路与状态转移", level: "常考" as const },
  { id: "rp4", title: "负权边与 Bellman-Ford 对比", level: "易混淆" as const },
]

export const questions: Question[] = [
  {
    id: "q1",
    type: "选择题",
    difficulty: "中等",
    point: "图的最短路径",
    subject: "数据结构",
    content:
      "对一个含 V 个顶点、E 条边的图，使用优先队列（小顶堆）优化的 Dijkstra 算法，其时间复杂度为：",
    options: [
      { key: "A", text: "O(V²)" },
      { key: "B", text: "O(VE)" },
      { key: "C", text: "O((V+E)logV)" },
      { key: "D", text: "O(E²)" },
    ],
    answer: "C",
    analysis:
      "堆优化 Dijkstra 中，每个顶点出堆一次 O(VlogV)，每条边可能触发一次松弛并入堆 O(ElogV)，合计 O((V+E)logV)。朴素实现才是 O(V²)，对应选项 A。",
  },
  {
    id: "q2",
    type: "判断题",
    difficulty: "简单",
    point: "图的最短路径",
    subject: "数据结构",
    content: "Dijkstra 算法可以正确处理带有负权边的图。",
    options: [
      { key: "T", text: "正确" },
      { key: "F", text: "错误" },
    ],
    answer: "F",
    analysis:
      "Dijkstra 基于贪心，要求边权非负。存在负权边时贪心选择不再成立，应使用 Bellman-Ford 算法。",
  },
  {
    id: "q3",
    type: "简答题",
    difficulty: "困难",
    point: "图的最短路径",
    subject: "数据结构",
    content: "简述 Dijkstra 与 Floyd 算法在适用场景与时间复杂度上的区别。",
    answer:
      "Dijkstra 求单源最短路，要求非负权，堆优化 O((V+E)logV)；Floyd 求多源（任意两点）最短路，可处理负权（无负环），基于动态规划，复杂度 O(V³)。",
    analysis:
      "评分点：①单源 vs 多源；②权值约束；③复杂度；④算法思想（贪心 vs 动态规划）。答出三点即可得大部分分数。",
  },
]

export const mistakes: Mistake[] = [
  {
    id: "w1",
    question: "Dijkstra 能否处理负权边？",
    subject: "数据结构",
    point: "图的最短路径",
    wrongCount: 3,
    reason: "概念不清",
    status: "复习中",
  },
  {
    id: "w2",
    question: "AVL 树 LR 型旋转的调整步骤",
    subject: "数据结构",
    point: "平衡二叉树",
    wrongCount: 2,
    reason: "记忆错误",
    status: "未掌握",
  },
  {
    id: "w3",
    question: "二重积分极坐标换元 dxdy = ? ",
    subject: "高等数学（下）",
    point: "重积分换元",
    wrongCount: 4,
    reason: "记忆错误",
    status: "未掌握",
  },
  {
    id: "w4",
    question: "幂级数收敛半径 R 的求法",
    subject: "高等数学（下）",
    point: "幂级数",
    wrongCount: 1,
    reason: "计算错误",
    status: "已掌握",
  },
  {
    id: "w5",
    question: "现在分词作状语的逻辑主语",
    subject: "大学英语四级",
    point: "长难句翻译",
    wrongCount: 2,
    reason: "语法错误",
    status: "复习中",
  },
]

export const memoryItems = [
  {
    id: "mem1",
    label: "讲解偏好",
    value: "喜欢先讲核心思想，再配一道最小例题，最后总结；不喜欢一上来就堆公式。",
  },
  {
    id: "mem2",
    label: "常错题型",
    value: "图论中的最短路径概念题、重积分换元、英语长难句翻译。",
  },
  {
    id: "mem3",
    label: "学习节奏",
    value: "工作日每天 60-90 分钟，习惯晚上 9 点后学习，周末做综合卷。",
  },
  {
    id: "mem4",
    label: "目标与动机",
    value: "数据结构与英语争取高分（保研加权），高数与马原稳过即可。",
  },
]

export const memorySummaries = [
  { id: "s1", date: "本周", text: "二叉树相关掌握度从 58% 提升到 74%，最短路径仍是主要短板。" },
  { id: "s2", date: "上周", text: "完成线性表、栈队列全部复习，正确率稳定在 85% 以上。" },
]

export const sprintMustKnow = [
  "Dijkstra 适用非负权，堆优化 O((V+E)logV)",
  "AVL 四种旋转：LL / RR / LR / RL 的判定与调整",
  "排序算法：快排平均 O(nlogn)、最坏 O(n²)，不稳定",
  "哈希冲突解决：开放定址法 vs 链地址法",
  "二叉树遍历的递归与非递归（借助栈）实现",
]

export const sprintHotPoints = [
  { title: "图的遍历与最短路径", weight: "★★★★★" },
  { title: "树与二叉树的性质计算", weight: "★★★★☆" },
  { title: "各类排序的复杂度对比", weight: "★★★★☆" },
  { title: "查找：折半 / 哈希", weight: "★★★☆☆" },
]

export const sprintErrors = [
  "Dijkstra 误用于负权图",
  "二叉树结点数与高度关系记反",
  "快排在已排序数组上退化为 O(n²) 被忽略",
]

export const diagnosisQA = [
  {
    id: "d1",
    question: "你能描述一下二叉树的中序遍历顺序吗？",
    answer: "左子树 → 根 → 右子树，递归进行。",
    judged: "掌握良好",
  },
  {
    id: "d2",
    question: "给定一个带权有向图，你会用什么算法求单源最短路径？",
    answer: "应该是 Dijkstra，但我不太确定有负权边时怎么办。",
    judged: "存在薄弱点：最短路径",
  },
]
