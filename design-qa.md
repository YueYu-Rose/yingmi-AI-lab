# Design QA：可展开计划 / 思考流

- source visual truth path: `C:\Users\user1\AppData\Local\Temp\codex-clipboard-146130d1-1f0c-46a7-920f-d914bf1b1113.png`
- implementation screenshot path: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\thinking-flow-qa\01-full-expanded.png`
- focused implementation screenshot path: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\thinking-flow-qa\02b-focused-top.png`
- side-by-side evidence: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\thinking-flow-qa\05-side-by-side-comparison.png`
- viewport: 1440 × 960 CSS px
- dimensions and density: source 985 × 379 px；focused implementation 377 × 380 px；browser capture deviceScaleFactor = 1。并排比较时将两张图等比例限制在 650 × 500 px 内，没有拉伸或改变宽高比。
- state: “组合健康诊断”项目；第一条计划记录展开，其余记录收起；浅色主题；Plan Mode。
- primary interactions tested: 第一条展开项收起、第二条展开项打开、工具名称显示、确认计划后进入“资产配置诊断”预览。
- console errors checked: 是；0 条 console error，0 条 page error。

## Full-view comparison evidence

完整页面证据显示新的计划流位于中间 Plan Mode 面板，保持原有三栏工作台、左侧执行计划和右侧预览区结构。计划内容可滚动，确认按钮仍能完成构建并进入结果页；没有遮挡顶部工具栏或破坏主布局。

## Focused region comparison evidence

并排证据同时展示了小顾参考组件与盈米实验室实现。两者都采用：低对比度的生成状态行、右侧上下箭头、圆角灰色工具调用胶囊、链路图标、工具名称、完成勾选，以及展开后的说明文字。实现将参考中的单次工具调用扩展为按项目生成的多步 MCP / Skill 执行流，这是功能需要导致的有意差异。

## Findings

- 没有发现 P0 / P1 / P2 问题。
- 字体与排版：实现使用产品现有中文无衬线字体栈；层级、字重与参考一致，工作台窄栏导致换行更多，属于容器约束而非排版错误。
- 间距与布局节奏：状态行、胶囊和说明文字间距接近参考；多步骤之间留有明确节奏，没有拥挤或重叠。
- 颜色与视觉 token：标题正文使用深色，生成状态、工具详情使用低对比灰色；展开控件仍满足可识别性。警示卡保持产品现有的金融 Demo 语义色。
- 图片与资源：该组件只使用产品现有 Lucide 图标，不涉及需要复刻的品牌图片或插画；图标清晰，无栅格模糊。
- 文案与内容：工具名称来自对应项目的 MCP / Skill 配置，不再让所有项目复用同一计划；展示的是可审计的执行摘要，不展示隐藏的模型思维链。
- [P3] 实现中的正文对比度略高于参考。保留该差异有助于在较窄的 Plan Mode 面板中阅读，不阻塞交付。

## Open Questions

- 默认状态目前是第一条展开、其余收起；后续可根据导师演示偏好调整为全部收起。

## Implementation Checklist

- [x] 每个项目读取自己的步骤与正确 MCP / Skill 名称。
- [x] 每条记录支持独立展开和收起，并提供 `aria-expanded`。
- [x] 展开区显示工具类型、名称、完成状态与简洁用途说明。
- [x] 确认计划后仍能进入对应金融 Demo 预览。
- [x] 生产构建通过，浏览器交互和控制台检查通过。

## Comparison History

- Pass 1：并排检查未发现 P0 / P1 / P2 差异，因此没有进行修复迭代。证据为 `05-side-by-side-comparison.png`。

## Follow-up Polish

- 可在导师演示后根据反馈决定默认展开规则，以及是否把标题“盈米计划生成”改为“盈米思考生成”。

## Tool-call Icon Update

- source visual truth path: `C:\Users\user1\AppData\Local\Temp\codex-clipboard-8abaaf17-5a82-4e32-b643-5d277a1164ad.png`
- implementation screenshot path: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\tool-icon-qa\01-tool-pill.png`
- focused implementation screenshot path: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\tool-icon-qa\02-tool-icon.png`
- side-by-side evidence: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\tool-icon-qa\03-side-by-side.png`
- viewport: 1440 × 960 CSS px；deviceScaleFactor = 1。
- dimensions and density: source 32 × 41 px；focused browser capture 32 × 32 px；实际图标槽位 16 × 16 CSS px。并排证据将两者等比例放入 96 × 96 px 比较区域，没有改变宽高比。
- state: “组合健康诊断”项目，第一条工具调用详情展开。
- primary interactions tested: 项目进入、展开状态显示、图标资源加载、工具调用胶囊完整呈现。
- console errors checked: 是；0 条 console error，0 条 page error。
- full-view evidence: `01-tool-pill.png` 显示图标与“调用工具”、工具名称和完成勾选保持同一基线，未改变胶囊高度或文字间距。
- focused region evidence: `03-side-by-side.png` 显示参考和实现使用同一斜向双链环图形；实现使用用户提供的原始图片，裁去外围空白并将底色透明化。
- findings: 没有 P0 / P1 / P2 问题。字体、间距、颜色、图像锐度及“调用工具”文案均通过；图标在 16 px 槽位内清晰且与参考方向一致。
- comparison history: 初始 Lucide 图标方向和轮廓与参考存在 P2 偏差；改用原始参考资源后，第一次截图出现外围空白和浅色方底；随后裁切为 22 × 22 px 并透明化背景，最终并排证据通过。

## First-message Project Flow QA

- browser evidence directory: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\first-message-flow-qa`
- viewport: 1440 × 960 CSS px；浅色主题；deviceScaleFactor = 1。
- states captured: 发送首条消息前、理解需求、生成计划、自动构建完成。
- primary interactions tested: 从侧栏进入新建项目、空白状态检查、发送首次需求、识别基金筛选场景、显示 `fund-screener`、自动进入构建、生成筛选结果、返回首页后项目可见。
- console errors checked: 是；0 条 console error，0 条 page error。
- findings: 首次发送前不存在 AI 计划内容或工具调用（两项计数均为 0）；首次发送后按“理解需求 → 生成计划 → 自动构建 → 已完成”顺序运行；首次对话成功写入项目列表。没有 P0 / P1 / P2 问题。

## XiaoGu-style Auto-collapse QA

- reference URL: `https://xiaogu.netlify.app/`
- reference evidence: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\xiaogu-reference\02-after-7s.png`
- implementation collapsed evidence: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\first-message-flow-qa\04-ready.png`
- implementation reopened evidence: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\first-message-flow-qa\05-ready-reopened.png`
- state: 用户已发送首条需求；思考与计划完成；AI 首次回复“计划已经生成”并进入自动构建。
- primary interactions tested: 规划阶段顶层思考流为展开状态；首次 AI 回复出现后自动收起；点击完成摘要可重新展开并查看步骤和工具调用。
- findings: 参考页面通过“✓ 已完成前序分析 · 12 秒”保留已完成过程的入口；实现采用“✓ 已完成思考与执行计划 · N 步”的同级摘要。自动收起状态、完成标识、右侧箭头和重新展开行为一致，没有 P0 / P1 / P2 问题。

## Restored Project and Layout Modes QA

- source visual truth paths:
  - `C:\Users\user1\AppData\Local\Temp\codex-clipboard-98298349-d120-4e13-a957-c93ef35abcce.png`
  - `C:\Users\user1\AppData\Local\Temp\codex-clipboard-f2d6187b-74d6-473d-943c-d9fc9931968f.png`
  - `C:\Users\user1\AppData\Local\Temp\codex-clipboard-310ad247-ef44-4f74-8362-595d49ffce04.png`
  - `C:\Users\user1\AppData\Local\Temp\codex-clipboard-8f3a966a-1e25-43a4-adc6-76a2399339b7.png`
- implementation screenshot paths:
  - `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\layout-mode-qa\01-project-restoring.png`
  - `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\layout-mode-qa\02-focus-ready.png`
  - `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\layout-mode-qa\04-three-column.png`
  - `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\layout-mode-qa\05-focus-current-step.png`
- side-by-side focused evidence: `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\layout-mode-qa\07-reference-comparison.png`
- viewport: 1440 × 960 CSS px；deviceScaleFactor = 1；桌面浅色主题。
- dimensions and density: source images 分别为 401 × 171、684 × 1224、680 × 1057、627 × 784 px；implementation screenshots 均为 1440 × 960 px。并排证据只对加载状态与底部计划栏做等比例内容区域裁切，没有拉伸或改变宽高比。
- states: 已完成项目重新打开；专注模式已完成；专注模式执行中；三栏模式已完成；项目刷新后仍在列表。
- primary interactions tested: 打开已有项目、恢复加载、展开底部执行计划、切换专注/三栏模式、查看当前步骤、返回项目列表、新建项目、刷新页面并确认本地持久化。
- console errors checked: 是；0 条 console error，0 条 page error。
- full-view comparison evidence: `02-focus-ready.png` 显示专注模式将聊天区扩展到 520 px，并把执行计划固定在输入框上方；`04-three-column.png` 显示原 280 + 410 px 三栏结构仍可恢复；右下角切换器在两种状态中均可见。
- focused region comparison evidence: `07-reference-comparison.png` 同时对比参考和实现。加载状态复用参考中的粉蓝双圆点、居中句式和弱化后半句；执行计划栏复用完成图标、当前任务、完成计数、箭头和位于聊天框上方的结构。
- findings:
  - 字体与排版：实现沿用现有产品中文无衬线字体，在桌面端采用更紧凑字号；标题、计数和辅助文案层级明确。
  - 间距与布局：专注模式移除独立左栏，聊天宽度由 410 px 增至 520 px；计划栏和输入区保持 12 px 外边距、圆角和清晰分组。
  - 颜色与 tokens：加载状态保留参考的粉蓝标识与黑/灰文案；任务进行、完成和待执行分别使用蓝、绿、浅灰语义色。
  - 图片与资源：粉蓝加载标识直接从用户参考图提取并透明化，没有使用 CSS 或自制 SVG 近似；图像清晰，无白边。
  - 文案与内容：“正在恢复项目，请稍候…”明确对应重新进入已有项目；执行栏显示真实 MCP / Skill 步骤和当前进度。
  - 没有剩余 P0 / P1 / P2 问题。
- comparison history:
  - Pass 1：专注模式移除左侧栏后，返回项目列表入口也随之消失，属于 P1 核心导航问题。
  - Fix：在专注模式顶部加入独立返回按钮；三栏模式继续使用原左侧项目标题栏和计划栏开关。
  - Pass 2：浏览器验证返回、新建、切换布局和刷新持久化均通过；post-fix evidence 为 `02-focus-ready.png`、`04-three-column.png` 与自动化结果。

## Sidebar Search QA

- implementation screenshot paths:
  - `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\sidebar-search-qa\01-search-collapsed.png`
  - `C:\Users\user1\Documents\Codex\2026-08-06\new-chat\work\sidebar-search-qa\02-search-open-filtered.png`
- viewport: 1440 × 960 CSS px；侧栏元素截图；deviceScaleFactor = 1。
- state: 搜索入口收起；搜索框展开并输入“组合健康”。
- primary interactions tested: 点击个人空间旁的放大镜、同一行展开搜索框、隐藏项目总数、过滤个人项目、Esc 关闭搜索、确认“新建项目”按钮不存在。
- console errors checked: 是；0 条 console error，0 条 page error。
- findings: 收起状态保留“个人空间 + 项目数 + 放大镜”；展开状态保留“个人空间 + 搜索框”，项目数消失；筛选结果正确。底部蓝色“新建项目”按钮已删除。没有 P0 / P1 / P2 问题。

## Execution Plan Dock Latest-step Update

- source visual truth path: `C:\Users\user1\AppData\Local\Temp\codex-clipboard-a595c218-08b4-436f-b7f5-a4e7f8bbcc46.png`
- implementation screenshot path: unavailable in this Codex session
- intended states: thinking/planning/building 自动展开；展开区仅显示最新状态或当前步骤；ready 自动收起；ready 状态允许用户手动重新打开并显示最后一步。
- implementation evidence: `ExecutionPlanDock` 现已在 `thinking` 阶段渲染；`thinking`、`planning`、`building` 阶段强制打开；`ready` 阶段自动关闭；展开内容从全步骤循环改为单个 `execution-plan-recent-step`。
- build validation: `npm run build` passed on 2026-08-06.
- browser-rendered evidence: blocked，因为当前会话没有可调用的 in-app Browser/Playwright 工具，无法自动点击并捕获四个交互状态。
- console errors checked: blocked for the same reason.
- remaining verification: 在当前本地页面依次确认思考中展开、执行时最新步骤替换、完成后收起、完成后手动重开。

## Preview Sleep State

- source visual truth path: `C:\Users\user1\AppData\Local\Temp\codex-clipboard-d407c197-dc3e-4576-bd04-5835bf194b15.png`
- implementation screenshot path: unavailable in this Codex session
- intended state: 项目进入 ready 后 30 分钟无操作，右侧预览暂停并显示可恢复的品牌化提示；点击“唤醒预览”后原地恢复，不刷新整个应用。
- copy: “预览暂时休眠” / “为了节省资源，长时间未操作的项目已暂停预览。唤醒后可从当前位置继续查看和编辑。” / “唤醒预览”。文案为盈米实验室重新创作，没有照抄参考图。
- build validation: `npm run build` passed on 2026-08-06.
- browser-rendered evidence and console check: blocked，因为当前会话没有可调用的 in-app Browser/Playwright 工具。

final result: blocked
