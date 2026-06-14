SUBJECTS = [
    {
        "id": "data-structure",
        "name": "数据结构",
        "emoji": "🌲",
        "examDate": "2026-06-28",
        "daysLeft": 14,
        "dailyMinutes": 90,
        "base": "normal",
        "goal": "高分",
        "mastery": 68,
        "progress": 54,
        "scope": "线性表、栈与队列、树与二叉树、图、查找、排序",
        "questionTypes": ["选择题", "简答题", "计算题", "代码题"],
        "color": "bg-chart-1",
    },
    {
        "id": "calculus",
        "name": "高等数学（下）",
        "emoji": "∫",
        "examDate": "2026-06-22",
        "daysLeft": 8,
        "dailyMinutes": 120,
        "base": "weak",
        "goal": "稳过",
        "mastery": 45,
        "progress": 38,
        "scope": "多元函数微分、重积分、曲线曲面积分、级数",
        "questionTypes": ["选择题", "填空题", "计算题", "综合题"],
        "color": "bg-chart-5",
    },
    {
        "id": "english",
        "name": "大学英语四级",
        "emoji": "🔤",
        "examDate": "2026-07-05",
        "daysLeft": 21,
        "dailyMinutes": 60,
        "base": "good",
        "goal": "高分",
        "mastery": 78,
        "progress": 72,
        "scope": "听力、阅读、翻译、写作、核心词汇",
        "questionTypes": ["选择题", "填空题", "简答题"],
        "color": "bg-chart-2",
    },
    {
        "id": "marxism",
        "name": "马克思主义基本原理",
        "emoji": "📖",
        "examDate": "2026-07-01",
        "daysLeft": 17,
        "dailyMinutes": 45,
        "base": "normal",
        "goal": "及格",
        "mastery": 60,
        "progress": 48,
        "scope": "唯物论、辩证法、认识论、唯物史观、政治经济学",
        "questionTypes": ["选择题", "判断题", "简答题"],
        "color": "bg-chart-3",
    },
]

TODAY_TASKS = [
    {"id": "t1", "title": "复习「二叉树遍历」并完成 5 道练习", "subject": "数据结构", "done": True, "minutes": 30},
    {"id": "t2", "title": "对话讲解「图的最短路径 Dijkstra」", "subject": "数据结构", "done": False, "minutes": 25},
    {"id": "t3", "title": "高数：重积分换元法专项 8 题", "subject": "高等数学（下）", "done": False, "minutes": 40},
    {"id": "t4", "title": "四级核心词汇 List 12 速记", "subject": "大学英语四级", "done": False, "minutes": 20},
]

WEAK_POINTS = [
    {"id": "kp1", "title": "图的最短路径（Dijkstra / Floyd）", "level": "薄弱", "mastery": 32, "subjectId": "data-structure"},
    {"id": "kp2", "title": "平衡二叉树（AVL）旋转", "level": "薄弱", "mastery": 40, "subjectId": "data-structure"},
    {"id": "kp3", "title": "重积分的换元与坐标变换", "level": "薄弱", "mastery": 28, "subjectId": "calculus"},
    {"id": "kp4", "title": "幂级数收敛半径求解", "level": "薄弱", "mastery": 35, "subjectId": "calculus"},
    {"id": "kp5", "title": "长难句翻译技巧", "level": "薄弱", "mastery": 52, "subjectId": "english"},
    {"id": "kp6", "title": "听力长对话定位", "level": "薄弱", "mastery": 58, "subjectId": "english"},
    {"id": "kp7", "title": "辩证法三大规律辨析", "level": "薄弱", "mastery": 46, "subjectId": "marxism"},
    {"id": "kp8", "title": "剩余价值生产方式", "level": "薄弱", "mastery": 42, "subjectId": "marxism"},
]

KNOWLEDGE_POINTS = [
    {"id": "ds-1", "title": "线性表与链表操作", "level": "必会", "mastery": 88, "subjectId": "data-structure"},
    {"id": "ds-2", "title": "栈与队列的应用", "level": "必会", "mastery": 80, "subjectId": "data-structure"},
    {"id": "ds-3", "title": "二叉树遍历（前/中/后/层序）", "level": "常考", "mastery": 74, "subjectId": "data-structure"},
    {"id": "ds-4", "title": "哈夫曼树与编码", "level": "常考", "mastery": 66, "subjectId": "data-structure"},
    {"id": "ds-5", "title": "平衡二叉树（AVL）旋转", "level": "薄弱", "mastery": 40, "subjectId": "data-structure"},
    {"id": "ds-6", "title": "图的最短路径（Dijkstra / Floyd）", "level": "薄弱", "mastery": 32, "subjectId": "data-structure"},
    {"id": "ds-7", "title": "排序算法复杂度与稳定性", "level": "常考", "mastery": 70, "subjectId": "data-structure"},
    {"id": "ds-8", "title": "哈希表与冲突解决", "level": "必会", "mastery": 76, "subjectId": "data-structure"},
    {"id": "cal-1", "title": "多元函数极限与连续", "level": "必会", "mastery": 62, "subjectId": "calculus"},
    {"id": "cal-2", "title": "偏导数与全微分", "level": "必会", "mastery": 58, "subjectId": "calculus"},
    {"id": "cal-3", "title": "多元复合函数求导", "level": "常考", "mastery": 54, "subjectId": "calculus"},
    {"id": "cal-4", "title": "二重积分计算", "level": "必会", "mastery": 48, "subjectId": "calculus"},
    {"id": "cal-5", "title": "重积分的换元与坐标变换", "level": "薄弱", "mastery": 28, "subjectId": "calculus"},
    {"id": "cal-6", "title": "曲线积分与格林公式", "level": "常考", "mastery": 38, "subjectId": "calculus"},
    {"id": "cal-7", "title": "数项级数敛散性", "level": "常考", "mastery": 44, "subjectId": "calculus"},
    {"id": "cal-8", "title": "幂级数收敛半径求解", "level": "薄弱", "mastery": 35, "subjectId": "calculus"},
    {"id": "eng-1", "title": "听力短篇新闻关键词", "level": "必会", "mastery": 76, "subjectId": "english"},
    {"id": "eng-2", "title": "长篇阅读匹配策略", "level": "常考", "mastery": 82, "subjectId": "english"},
    {"id": "eng-3", "title": "仔细阅读因果与转折定位", "level": "必会", "mastery": 78, "subjectId": "english"},
    {"id": "eng-4", "title": "核心词汇同义替换", "level": "必会", "mastery": 70, "subjectId": "english"},
    {"id": "eng-5", "title": "长难句翻译技巧", "level": "薄弱", "mastery": 52, "subjectId": "english"},
    {"id": "eng-6", "title": "作文模板与高级句式", "level": "常考", "mastery": 73, "subjectId": "english"},
    {"id": "eng-7", "title": "段落主旨题", "level": "常考", "mastery": 80, "subjectId": "english"},
    {"id": "eng-8", "title": "听力长对话定位", "level": "薄弱", "mastery": 58, "subjectId": "english"},
    {"id": "marx-1", "title": "物质与意识的辩证关系", "level": "必会", "mastery": 66, "subjectId": "marxism"},
    {"id": "marx-2", "title": "联系与发展的观点", "level": "必会", "mastery": 62, "subjectId": "marxism"},
    {"id": "marx-3", "title": "矛盾分析法", "level": "常考", "mastery": 58, "subjectId": "marxism"},
    {"id": "marx-4", "title": "实践与认识的关系", "level": "必会", "mastery": 64, "subjectId": "marxism"},
    {"id": "marx-5", "title": "社会存在与社会意识", "level": "常考", "mastery": 56, "subjectId": "marxism"},
    {"id": "marx-6", "title": "商品二因素与劳动二重性", "level": "常考", "mastery": 50, "subjectId": "marxism"},
    {"id": "marx-7", "title": "辩证法三大规律辨析", "level": "薄弱", "mastery": 46, "subjectId": "marxism"},
    {"id": "marx-8", "title": "剩余价值生产方式", "level": "薄弱", "mastery": 42, "subjectId": "marxism"},
]

RECENT_CHATS = [
    {"id": "c1", "title": "二叉树为什么要做平衡？", "subject": "数据结构", "time": "10 分钟前", "preview": "AVL 树通过旋转维持左右子树高度差..."},
    {"id": "c2", "title": "Dijkstra 和 Floyd 区别", "subject": "数据结构", "time": "2 小时前", "preview": "前者求单源最短路，后者求多源..."},
    {"id": "c3", "title": "AVL 的 LL / LR 怎么区分？", "subject": "数据结构", "time": "昨天", "preview": "先看失衡结点，再看插入路径方向..."},
    {"id": "c4", "title": "重积分什么时候用极坐标？", "subject": "高等数学（下）", "time": "12 分钟前", "preview": "当积分区域是圆 / 扇形时优先考虑..."},
    {"id": "c5", "title": "偏导数和全微分有什么关系？", "subject": "高等数学（下）", "time": "1 小时前", "preview": "全微分存在比偏导存在要求更强..."},
    {"id": "c6", "title": "幂级数收敛半径怎么求？", "subject": "高等数学（下）", "time": "昨天", "preview": "优先用比值法或根值法处理系数..."},
    {"id": "c7", "title": "四级写作怎么提升档次？", "subject": "大学英语四级", "time": "20 分钟前", "preview": "用高级句型替换简单句，注意衔接词..."},
    {"id": "c8", "title": "长篇阅读匹配题如何提速？", "subject": "大学英语四级", "time": "3 小时前", "preview": "先划定位词，再匹配段落主旨..."},
    {"id": "c9", "title": "翻译题怎么处理定语从句？", "subject": "大学英语四级", "time": "昨天", "preview": "先拆主干，再处理修饰成分..."},
    {"id": "c10", "title": "矛盾普遍性和特殊性怎么区分？", "subject": "马克思主义基本原理", "time": "30 分钟前", "preview": "普遍性说明矛盾无处不在，特殊性强调具体分析..."},
    {"id": "c11", "title": "实践为什么是认识的基础？", "subject": "马克思主义基本原理", "time": "2 小时前", "preview": "实践提供认识来源、动力、检验标准和目的..."},
    {"id": "c12", "title": "剩余价值两种生产方式", "subject": "马克思主义基本原理", "time": "昨天", "preview": "绝对剩余价值靠延长劳动时间，相对剩余价值靠提高生产率..."},
]

CHAPTERS = [
    {"id": "ds-ch1", "title": "第 1 章 绪论", "done": True, "items": ["时间/空间复杂度", "算法分析基础"]},
    {"id": "ds-ch2", "title": "第 2 章 线性表", "done": True, "items": ["顺序表", "单链表 / 双链表", "循环链表"]},
    {"id": "ds-ch3", "title": "第 3 章 栈与队列", "done": True, "items": ["栈的应用", "循环队列", "表达式求值"]},
    {"id": "ds-ch4", "title": "第 4 章 树与二叉树", "done": False, "active": True, "items": ["遍历", "线索二叉树", "哈夫曼树", "AVL 树"]},
    {"id": "ds-ch5", "title": "第 5 章 图", "done": False, "items": ["存储结构", "遍历", "最短路径", "最小生成树", "拓扑排序"]},
    {"id": "ds-ch6", "title": "第 6 章 查找", "done": False, "items": ["折半查找", "二叉排序树", "哈希表"]},
    {"id": "ds-ch7", "title": "第 7 章 排序", "done": False, "items": ["插入/交换/选择", "归并/基数", "复杂度对比"]},
]

CHAPTERS_BY_SUBJECT = {
    "data-structure": CHAPTERS,
    "calculus": [
        {"id": "cal-ch1", "title": "第 1 章 多元函数微分法", "done": True, "items": ["多元函数极限", "偏导数", "全微分"]},
        {"id": "cal-ch2", "title": "第 2 章 多元复合函数求导", "done": True, "items": ["链式法则", "隐函数求导", "方向导数"]},
        {"id": "cal-ch3", "title": "第 3 章 二重积分", "done": False, "active": True, "items": ["积分区域", "换序", "极坐标"]},
        {"id": "cal-ch4", "title": "第 4 章 三重积分", "done": False, "items": ["柱面坐标", "球面坐标", "对称性"]},
        {"id": "cal-ch5", "title": "第 5 章 曲线与曲面积分", "done": False, "items": ["第一类积分", "第二类积分", "格林公式"]},
        {"id": "cal-ch6", "title": "第 6 章 无穷级数", "done": False, "items": ["数项级数", "幂级数", "泰勒展开"]},
    ],
    "english": [
        {"id": "eng-ch1", "title": "模块 1 听力", "done": True, "items": ["短篇新闻", "长对话", "听力篇章"]},
        {"id": "eng-ch2", "title": "模块 2 词汇与语法", "done": True, "items": ["核心词汇", "同义替换", "长难句"]},
        {"id": "eng-ch3", "title": "模块 3 阅读理解", "done": False, "active": True, "items": ["选词填空", "段落匹配", "仔细阅读"]},
        {"id": "eng-ch4", "title": "模块 4 翻译", "done": False, "items": ["句子拆分", "文化表达", "定语处理"]},
        {"id": "eng-ch5", "title": "模块 5 写作", "done": False, "items": ["议论文结构", "高级句式", "连接词"]},
    ],
    "marxism": [
        {"id": "marx-ch1", "title": "第 1 章 马克思主义导论", "done": True, "items": ["理论来源", "鲜明特征", "当代价值"]},
        {"id": "marx-ch2", "title": "第 2 章 世界的物质性", "done": True, "items": ["物质观", "意识观", "实践观"]},
        {"id": "marx-ch3", "title": "第 3 章 唯物辩证法", "done": False, "active": True, "items": ["联系发展", "三大规律", "矛盾分析法"]},
        {"id": "marx-ch4", "title": "第 4 章 认识论", "done": False, "items": ["实践与认识", "真理与价值", "认识过程"]},
        {"id": "marx-ch5", "title": "第 5 章 唯物史观", "done": False, "items": ["社会存在", "社会意识", "人民群众"]},
        {"id": "marx-ch6", "title": "第 6 章 政治经济学", "done": False, "items": ["商品二因素", "剩余价值", "资本积累"]},
    ],
}

CONVERSATION = [
    {"id": "m1", "role": "user", "content": "帮我讲讲图的最短路径里 Dijkstra 算法的核心思想，我总是搞不清。"},
    {
        "id": "m2",
        "role": "assistant",
        "kind": "text",
        "content": "没问题。Dijkstra 算法解决的是「单源最短路径」问题——从一个起点出发，求到其它所有顶点的最短距离。它的核心是贪心 + 逐步确定：每一步都从「还没确定的顶点」里，挑出当前距离最小的那个，把它标记为已确定，再用它去松弛（更新）邻居的距离。",
    },
    {
        "id": "m3",
        "role": "assistant",
        "kind": "knowledge",
        "content": "关键前提：所有边的权重必须为非负数。一旦出现负权边，Dijkstra 的贪心假设就会失效，这时应改用 Bellman-Ford。",
    },
    {
        "id": "m4",
        "role": "assistant",
        "kind": "example",
        "content": "例题：给定起点 A，边 A→B=1, A→C=4, B→C=2。求 A 到 C 的最短路。\n解：A→C 直接为 4，但 A→B→C = 1+2 = 3 更短，所以最短距离为 3。这正体现了「松弛」的过程。",
    },
    {"id": "m5", "role": "user", "content": "那它的时间复杂度是多少？用堆优化呢？"},
    {
        "id": "m6",
        "role": "assistant",
        "kind": "reference",
        "content": "朴素实现是 O(V²)；用优先队列（小顶堆）优化后为 O((V+E)logV)，适合稀疏图。该结论来源见参考资料卡片。",
    },
]

CONVERSATIONS_BY_SUBJECT = {
    "data-structure": CONVERSATION,
    "calculus": [
        {"id": "cal-m1", "role": "user", "content": "我总分不清二重积分什么时候用直角坐标、什么时候用极坐标。"},
        {
            "id": "cal-m2",
            "role": "assistant",
            "kind": "text",
            "content": "先看积分区域的形状：如果边界里出现圆、圆环、扇形，或者被积函数含有 x²+y²，优先考虑极坐标；如果区域由直线、简单上下限围成，直角坐标通常更直接。",
        },
        {
            "id": "cal-m3",
            "role": "assistant",
            "kind": "knowledge",
            "content": "极坐标换元时一定不要漏雅可比因子：x = r cosθ，y = r sinθ，dxdy = r drdθ。很多错题不是思路错，而是漏了这个 r。",
        },
        {
            "id": "cal-m4",
            "role": "assistant",
            "kind": "example",
            "content": "例题：计算区域 x²+y²≤1 上的 ∬(x²+y²)dxdy。\n换成极坐标后为 ∫₀²π∫₀¹ r²·r drdθ = 2π·1/4 = π/2。",
        },
    ],
    "english": [
        {"id": "eng-m1", "role": "user", "content": "四级阅读我经常看懂了大概意思，但选项还是容易错。"},
        {
            "id": "eng-m2",
            "role": "assistant",
            "kind": "text",
            "content": "四级阅读不要只凭“感觉相近”选答案。先定位题干关键词，再回原文找同义替换，最后排除偷换范围、因果倒置和无中生有的选项。",
        },
        {
            "id": "eng-m3",
            "role": "assistant",
            "kind": "knowledge",
            "content": "常见正确答案不会照抄原文，而是同义改写。比如 improve 可能换成 enhance，because 可能换成 result from / lead to。",
        },
        {
            "id": "eng-m4",
            "role": "assistant",
            "kind": "example",
            "content": "例：原文说 The policy helps reduce household costs。选项里如果出现 It lowers family expenses，就是同义替换；如果说 It increases family income，就偷换了概念。",
        },
    ],
    "marxism": [
        {"id": "marx-m1", "role": "user", "content": "马原里矛盾普遍性和特殊性总是混在一起。"},
        {
            "id": "marx-m2",
            "role": "assistant",
            "kind": "text",
            "content": "可以这样记：普遍性回答“有没有矛盾”——任何事物、任何过程都有矛盾；特殊性回答“是什么矛盾”——不同事物、同一事物不同阶段的矛盾各不相同。",
        },
        {
            "id": "marx-m3",
            "role": "assistant",
            "kind": "knowledge",
            "content": "考试常用表达：坚持矛盾普遍性要求承认矛盾、分析矛盾；坚持矛盾特殊性要求具体问题具体分析。",
        },
        {
            "id": "marx-m4",
            "role": "assistant",
            "kind": "example",
            "content": "例：学习压力人人都有，这是普遍性；你薄弱在高数重积分、别人薄弱在英语听力，这是特殊性，所以复习方案不能完全照搬。",
        },
    ],
}

RESEARCH_SOURCES = [
    {
        "id": "r1",
        "title": "Dijkstra 算法 - 维基百科",
        "site": "wikipedia.org",
        "summary": "单源最短路径算法，1956 年由 Edsger W. Dijkstra 提出，适用于非负权图。",
        "level": "高",
    },
    {
        "id": "r2",
        "title": "图论最短路径专题（含例题）",
        "site": "oi-wiki.org",
        "summary": "系统整理 Dijkstra / Bellman-Ford / Floyd 的适用场景与复杂度对比。",
        "level": "高",
    },
    {
        "id": "r3",
        "title": "考研数据结构真题解析",
        "site": "kaoyan.com",
        "summary": "近 5 年最短路径相关真题及评分点，含堆优化代码模板。",
        "level": "中",
    },
]

RESEARCH_POINTS = [
    {"id": "rp1", "title": "Dijkstra 适用条件与贪心思想", "level": "高频考点"},
    {"id": "rp2", "title": "堆优化复杂度推导", "level": "高频考点"},
    {"id": "rp3", "title": "Floyd 多源最短路与状态转移", "level": "常考"},
    {"id": "rp4", "title": "负权边与 Bellman-Ford 对比", "level": "易混淆"},
]

QUESTIONS = [
    {
        "id": "q1",
        "type": "选择题",
        "difficulty": "中等",
        "point": "图的最短路径",
        "subject": "数据结构",
        "content": "对一个含 V 个顶点、E 条边的图，使用优先队列（小顶堆）优化的 Dijkstra 算法，其时间复杂度为：",
        "options": [
            {"key": "A", "text": "O(V²)"},
            {"key": "B", "text": "O(VE)"},
            {"key": "C", "text": "O((V+E)logV)"},
            {"key": "D", "text": "O(E²)"},
        ],
        "answer": "C",
        "analysis": "堆优化 Dijkstra 中，每个顶点出堆一次 O(VlogV)，每条边可能触发一次松弛并入堆 O(ElogV)，合计 O((V+E)logV)。朴素实现才是 O(V²)，对应选项 A。",
    },
    {
        "id": "q2",
        "type": "判断题",
        "difficulty": "简单",
        "point": "图的最短路径",
        "subject": "数据结构",
        "content": "Dijkstra 算法可以正确处理带有负权边的图。",
        "options": [{"key": "T", "text": "正确"}, {"key": "F", "text": "错误"}],
        "answer": "F",
        "analysis": "Dijkstra 基于贪心，要求边权非负。存在负权边时贪心选择不再成立，应使用 Bellman-Ford 算法。",
    },
    {
        "id": "q3",
        "type": "简答题",
        "difficulty": "困难",
        "point": "图的最短路径",
        "subject": "数据结构",
        "content": "简述 Dijkstra 与 Floyd 算法在适用场景与时间复杂度上的区别。",
        "answer": "Dijkstra 求单源最短路，要求非负权，堆优化 O((V+E)logV)；Floyd 求多源（任意两点）最短路，可处理负权（无负环），基于动态规划，复杂度 O(V³)。",
        "analysis": "评分点：①单源 vs 多源；②权值约束；③复杂度；④算法思想（贪心 vs 动态规划）。答出三点即可得大部分分数。",
    },
    {
        "id": "q4",
        "type": "选择题",
        "difficulty": "中等",
        "point": "重积分换元",
        "subject": "高等数学（下）",
        "content": "二重积分从直角坐标换成极坐标时，面积元 dxdy 应变为：",
        "options": [
            {"key": "A", "text": "drdθ"},
            {"key": "B", "text": "rdrdθ"},
            {"key": "C", "text": "r²drdθ"},
            {"key": "D", "text": "cosθdrdθ"},
        ],
        "answer": "B",
        "analysis": "极坐标变换 x = rcosθ，y = rsinθ 的雅可比行列式绝对值为 r，所以 dxdy = rdrdθ。漏掉 r 是重积分换元最常见错误。",
    },
    {
        "id": "q5",
        "type": "计算题",
        "difficulty": "中等",
        "point": "幂级数",
        "subject": "高等数学（下）",
        "content": "求幂级数 ∑(n=1 到 ∞) n xⁿ 的收敛半径。",
        "answer": "R = 1",
        "analysis": "设 a_n = n，用比值法：lim |a_n/a_{n+1}| = lim n/(n+1) = 1，因此收敛半径 R = 1。",
    },
    {
        "id": "q6",
        "type": "选择题",
        "difficulty": "中等",
        "point": "阅读理解",
        "subject": "大学英语四级",
        "content": "四级仔细阅读中，最可靠的解题顺序是：",
        "options": [
            {"key": "A", "text": "先看选项，再凭印象选择"},
            {"key": "B", "text": "先读题干关键词，再回原文定位并比对同义替换"},
            {"key": "C", "text": "全文逐字翻译后再做题"},
            {"key": "D", "text": "只选择含有原文原词最多的选项"},
        ],
        "answer": "B",
        "analysis": "四级阅读考查定位与同义替换。原词最多不一定正确，常见干扰项会偷换范围、因果或态度。",
    },
    {
        "id": "q7",
        "type": "简答题",
        "difficulty": "中等",
        "point": "写作",
        "subject": "大学英语四级",
        "content": "写出 2 个可以提升四级作文层次的连接表达，并说明适用场景。",
        "answer": "例如：Moreover 表示递进；However 表示转折；Therefore 表示结果。",
        "analysis": "评分重点是连接词是否准确服务于逻辑关系。不要堆砌高级词，递进、转折、因果要用对。",
    },
    {
        "id": "q8",
        "type": "判断题",
        "difficulty": "简单",
        "point": "矛盾分析法",
        "subject": "马克思主义基本原理",
        "content": "矛盾特殊性要求我们坚持具体问题具体分析。",
        "options": [
            {"key": "T", "text": "正确"},
            {"key": "F", "text": "错误"},
        ],
        "answer": "T",
        "analysis": "矛盾特殊性强调不同事物、同一事物不同阶段的矛盾各不相同，因此方法论要求是具体问题具体分析。",
    },
    {
        "id": "q9",
        "type": "简答题",
        "difficulty": "中等",
        "point": "认识论",
        "subject": "马克思主义基本原理",
        "content": "简述为什么实践是认识的基础。",
        "answer": "实践是认识的来源、动力、目的，也是检验认识真理性的唯一标准。",
        "analysis": "答题时按四点展开最稳：来源、动力、目的、检验标准。每点配一句解释即可形成完整简答。",
    },
]

MISTAKES = [
    {"id": "w1", "question": "Dijkstra 能否处理负权边？", "subject": "数据结构", "point": "图的最短路径", "wrongCount": 3, "reason": "概念不清", "status": "复习中"},
    {"id": "w2", "question": "AVL 树 LR 型旋转的调整步骤", "subject": "数据结构", "point": "平衡二叉树", "wrongCount": 2, "reason": "记忆错误", "status": "未掌握"},
    {"id": "w3", "question": "二重积分极坐标换元 dxdy = ? ", "subject": "高等数学（下）", "point": "重积分换元", "wrongCount": 4, "reason": "记忆错误", "status": "未掌握"},
    {"id": "w4", "question": "幂级数收敛半径 R 的求法", "subject": "高等数学（下）", "point": "幂级数", "wrongCount": 1, "reason": "计算错误", "status": "已掌握"},
    {"id": "w5", "question": "现在分词作状语的逻辑主语", "subject": "大学英语四级", "point": "长难句翻译", "wrongCount": 2, "reason": "语法错误", "status": "复习中"},
]

MEMORY_ITEMS = [
    {"id": "mem1", "label": "讲解偏好", "value": "喜欢先讲核心思想，再配一道最小例题，最后总结；不喜欢一上来就堆公式。"},
    {"id": "mem2", "label": "常错题型", "value": "图论中的最短路径概念题、重积分换元、英语长难句翻译。"},
    {"id": "mem3", "label": "学习节奏", "value": "工作日每天 60-90 分钟，习惯晚上 9 点后学习，周末做综合卷。"},
    {"id": "mem4", "label": "目标与动机", "value": "数据结构与英语争取高分（保研加权），高数与马原稳过即可。"},
]

MEMORY_SUMMARIES = [
    {"id": "s1", "date": "本周", "text": "二叉树相关掌握度从 58% 提升到 74%，最短路径仍是主要短板。"},
    {"id": "s2", "date": "上周", "text": "完成线性表、栈队列全部复习，正确率稳定在 85% 以上。"},
]

SPRINT_MUST_KNOW = [
    "Dijkstra 适用非负权，堆优化 O((V+E)logV)",
    "AVL 四种旋转：LL / RR / LR / RL 的判定与调整",
    "排序算法：快排平均 O(nlogn)、最坏 O(n²)，不稳定",
    "哈希冲突解决：开放定址法 vs 链地址法",
    "二叉树遍历的递归与非递归（借助栈）实现",
]

SPRINT_HOT_POINTS = [
    {"title": "图的遍历与最短路径", "weight": "★★★★★"},
    {"title": "树与二叉树的性质计算", "weight": "★★★★☆"},
    {"title": "各类排序的复杂度对比", "weight": "★★★★☆"},
    {"title": "查找：折半 / 哈希", "weight": "★★★☆☆"},
]

SPRINT_ERRORS = [
    "Dijkstra 误用于负权图",
    "二叉树结点数与高度关系记反",
    "快排在已排序数组上退化为 O(n²) 被忽略",
]
