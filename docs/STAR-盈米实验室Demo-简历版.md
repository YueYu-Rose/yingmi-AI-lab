# 盈米实验室 Demo · 完整工作 STAR（简历版）

> 项目仓库：[YueYu-Rose/yingmi-AI-lab](https://github.com/YueYu-Rose/yingmi-AI-lab)  
> 角色视角：产品设计 / AI 产品（独立驱动 Demo 从 0 到可演示）  
> 覆盖范围：本段完整协作聊天中的全部工作内容（非单次小迭代）  
> 技术栈：React + Vite + TypeScript + Tailwind  

---

## 一、简历可直接用的项目简述（3–4 行）

**盈米实验室 Demo｜AI 金融应用创建平台原型**  
独立负责面向 mentor 的可演示产品原型：用自然语言创建金融网站/应用，并可视化展示 MCP / Skills / Agent / 组件的调用过程。完成信息架构重构（平台目录 vs 项目累计能力 vs 本轮 Plan）、聊天→项目双态工作流、预览编辑与发布分享、代码工作区与多轮能力演示闭环；持续基于真实反馈迭代，并通过 GitHub 交付。

---

## 二、总 STAR（面试口述主版本，约 1.5–2 分钟）

### S（Situation）

在盈米（且慢）场景下，需要一个 **AI Lab Demo**，向 mentor / 内部证明：用户可以用自然语言创建金融应用，同时看清背后调用了哪些金融能力（MCP、Skills 等）。  
起点是一份已有前端工程与 GitHub 仓库，但产品链路不完整：能力展示分散、聊天与项目边界不清、发布/编辑/Plan 体验不符合演示预期，且多次遇到网络推送问题，需要边设计边落地边同步远端。

### T（Task）

目标不是「做几个 UI 改动」，而是交付一个 **可现场演示、逻辑自洽、可版本管理** 的产品原型：

1. 讲清「平台有什么能力 / 这个项目用了什么 / 这一轮执行了什么」  
2. 覆盖从澄清需求 → 生成计划 → 构建预览 → 修改再生成的完整体验  
3. 支持 mentor 演示脚本（尤其是基金对比多轮修改）  
4. 把成果稳定推到 GitHub，形成可回溯交付物  

### A（Action）

#### 1）产品信息架构与能力体系

- 明确三层职责：  
  - **盈米工具页** = 平台能力目录（MCP / Skills / Agent / 组件）  
  - **项目「能力」Tab** = 本项目累计调用 + 次数  
  - **聊天 Plan 条** = 仅本轮 steps  
- 删除预览底部「本次使用记录」，避免在用户预览面暴露过程噪声  
- 代码页去掉侧栏能力清单，将「能力」提升为与「预览 / 代码」同级 Tab  
- 「能力」页固定四组展示，并支持使用次数统计；Agent 命名统一，避免重复计数穿帮  
- 盈米工具页 MCP / Skills 文案对齐且慢官方市场，并外链：  
  - [MCP 市场](https://qieman.com/mcp/mcp-market)  
  - [Skills 市场](https://qieman.com/mcp/skill-market)

#### 2）聊天 / 项目双态与需求澄清

- 工作区区分 **聊天** 与 **项目**，修正「只有项目」的文案与计数误导  
- 支持聊天澄清阶段的意图选择器（先聊清楚 / 直接做应用 / 基金对比等）  
- 演示「聊天升级为项目」路径；部分条目支持刷新后恢复为聊天，方便反复演示  

#### 3）Plan / 执行链与多轮演示

- 设计并落地思考流、执行链：支持折叠/展开工具调用细节  
- Plan 条：生成中只显示当前 step，完成后展示全部 step name  
- 统一本轮 steps 数据源（聊天实时 Plan / Plan Dock / 能力写入一致）  
- 为「基金对比」设计演示脚本：  
  - 打开时仅保留首轮完成记录  
  - 输入框预填跟进需求，待现场发送  
  - 发送后重跑不同 steps，并累加「能力」次数，用于展示变化  

#### 4）预览、代码、编辑与发布

- 「配置」改为「代码」，做成左文件树、右代码内容的工作区  
- 预览支持桌面/手机切换；右上角编辑（笔形 icon）可点选组件并向 AI 留言  
- 发布成功弹窗：去掉有效期/访问次数/且慢限制文案，复制成功 Toast；展示项目名而非 `.pdf`  
- 修复预览编辑相关裁切、留言条定位、TABLE 标签溢出等问题  

#### 5）个人区、工作空间与交互细节

- 个人主页弹窗（用户名可编辑）、退出仅展示「正在退出…」不真登出（演示友好）  
- 工作空间副标题、搜索收起、重命名、菜单定位等体验修正  
- 聊天气泡支持复制/修改重发；生成中可停止  
- 输入区：无内容时禁用 prompt 优化，附件始终可点；去掉多余 Plan Mode 徽章与三栏切换复杂度  

#### 6）工程协作与交付

- 使用 React + Vite + TypeScript 在现有代码库上迭代  
- 排查并修复点击项目白屏（组件 props 不匹配的运行时错误）  
- 多次处理 GitHub 推送网络问题（VPN / SSL），最终将关键提交推至 `main`  
- 主要提交包括：  
  - `c16561c` Polish Yingmi Lab demo interactions for chat, publish, and profile.  
  - `ee91da7` Refine preview edit UX and simplify project workspace chrome.  
  - `78d970a` Fix clipped TABLE edit tags in preview selection chrome.  
  - `0682259` Add capabilities tab, comparison follow-up demo, and tools market copy.  
  - `362a2b9` Unify plan steps source and soften comparison follow-up copy.  

### R（Result）

- 交付可演示的 **盈米实验室 Demo**：从需求澄清到构建、修改、发布、能力复盘形成闭环  
- 能力叙事可对外讲清楚，并与且慢 MCP / Skills 市场对齐  
- mentor 演示路径明确：打开基金对比 → 发送预填修改 → 看 Plan 与「能力」变化  
- 代码持续落入 GitHub，具备可回溯版本；关键交互与稳定性问题（白屏、裁切、文案冲突）已闭环  

---

## 三、拆开的子 STAR（简历/面试按模块深挖）

### STAR-A：能力信息架构（最适合 AI 产品岗）

- **S**：能力展示散落在预览、代码侧栏、聊天 Plan，mentor 看不清「平台能力」和「本次/本项目调用」差别。  
- **T**：定义清晰分层，并落到 UI 与数据模型。  
- **A**：提出并落地「工具目录 / 项目能力汇总 / 本轮 Plan」三层；能力 Tab 四类 + 次数；跟进轮统一 `activeSteps`。  
- **R**：演示时能一句话说清能力链路，并现场展示次数变化。  

### STAR-B：多轮修改演示设计（最适合产品思维）

- **S**：需要展示「用户继续提需求后，系统如何重规划并更新能力使用」。  
- **T**：设计不穿帮、可现场操作的演示脚本。  
- **A**：首轮历史冻结；跟进句预填输入框；发送触发不同 steps；完成文案避免假装预览已改。  
- **R**：演示可控、重点突出（Plan + 能力），降低 mentor 对假数据的质疑。  

### STAR-C：从反馈到落地的高频迭代（最适合执行力）

- **S**：单日收到大量截图反馈（执行链折叠、代码工作区、编辑留言、发布弹窗、聊天/项目分流等）。  
- **T**：在保持 Demo 可讲的前提下快速吸收反馈并上线。  
- **A**：按优先级改交互与文案，修运行时白屏，分批 commit/push。  
- **R**：形成可持续演示的主路径，Git 历史上可见清晰迭代节奏。  

---

## 四、面试可能追问 & 建议答法

**Q：你是写代码还是做产品？**  
A：以产品设计与演示闭环为主，用 Cursor 与现有 React 工程快速落地；关键决策是信息架构、演示脚本和交互逻辑，而不是堆视觉。

**Q：为什么能力要分成三层？**  
A：用户看预览时不该被过程日志打扰；项目层要回答「这个应用依赖什么」；对话层要回答「这一轮刚做了什么」。混在一起会既吵又讲不清。

**Q：有什么量化结果？**  
A：Demo 场景下可用：6+ 类金融 scenario、四类能力汇总、基金对比多轮演示脚本；GitHub 上有连续提交可核验。若面试要业务指标，需说明这是内部演示原型，指标是「可演示完整性 / 反馈闭环速度」。

**Q：最大挑战是什么？**  
A：一是能力叙事与真实预览不同步时容易穿帮，所以弱化假更新文案、强化 Plan/能力变化；二是推送与环境不稳定，通过分批提交和网络策略保证交付落库。

---

## 五、一句话成果（可放简历项目标题下）

独立打造并迭代盈米 AI Lab 可演示原型，完成能力三层信息架构、聊天/项目双态、预览编辑与发布，以及基金对比多轮 Plan/能力变化演示，产物持续交付至 GitHub。

---

## 附录：建议演示顺序（给你自己用）

1. 首页输入 / 打开「基金对比」项目  
2. 看聊天首轮 Plan + 完成回复  
3. 切「能力」看四类汇总与次数  
4. 发送输入框预填修改句  
5. 看 Plan 条本轮 steps 变化，再回「能力」看次数增加  
6. （可选）打开「盈米工具」跳转且慢 MCP / Skills 市场

---

## 六、面向美国 AI 岗位的英文 STAR 版本

### Project: Yingmi AI Lab — AI Application Creation Workspace

**Role:** AI Product Designer / Product Engineer (independent project)  
**Stack:** React, TypeScript, Vite, Tailwind CSS  
**Scope:** Financial-domain AI application builder prototype; MCP / Skills / Agent / UI component orchestration

#### Situation

Yingmi needed a demonstrable AI Lab experience for internal stakeholders and mentors. The concept was to let employees describe a financial workflow in natural language and see how an AI system could plan, use domain capabilities, generate an application, and support iterative edits. The starting prototype had fragmented capability information, unclear boundaries between chats and projects, and no coherent path from creation to preview, editing, and publishing.

#### Task

I owned the end-to-end product framing and frontend implementation for a credible MVP demo. The core challenge was to make an AI workflow understandable without forcing users to understand every MCP or Skill. The experience needed to communicate three different layers: what the platform provides, what a project has used, and what the current execution is doing.

#### Action

- Reframed the information architecture into a platform capability center, project-level capability summary, and turn-level Plan / execution flow.
- Designed the chat-to-project lifecycle, including intent clarification, plan generation, execution progress, preview, code, capability inspection, and multi-turn modification.
- Built a reusable capability model for MCP, Skills, Agents, and visual components, with counts and expandable tool details.
- Implemented a safe custom MCP onboarding flow: paste a redacted JSON configuration, save it as disabled, request trust only on first enable, show loading, then expose the connected tool list.
- Designed an application plaza and publishing flow where users can publish a real project snapshot, preview its first screen, copy a template, and continue editing the copied project.
- Added responsive desktop/mobile preview switching, component-level editing, fixed-layer chat input, workspace search, project/chat distinction, and recoverable local demo state.
- Used mentor feedback and screenshot-based QA to iterate on interaction states, copy, spacing, overflow, execution-chain behavior, and empty/loading/error states.
- Maintained the implementation in a React + TypeScript codebase and delivered versioned changes through GitHub.

#### Result

- Delivered a coherent, end-to-end AI application builder demo that can be presented live from natural-language request to generated preview and follow-up edit.
- Created a clear capability narrative that separates platform discovery, project dependency visibility, and current-turn execution transparency.
- Made the demo safer and more realistic by keeping newly added MCPs disabled, avoiding real API keys, and requiring explicit trust before simulated activation.
- Established a reusable foundation for connecting real MCP / Skills runtimes later, while keeping the current MVP honest about mocked data and frontend-only behavior.
- Produced a portfolio-ready artifact with a public GitHub repository and an interview narrative focused on AI product judgment, human-in-the-loop design, and rapid prototyping.

#### What I would do next

The current demo is intentionally an MVP prototype: some financial data, execution steps, and tool lists are simulated in the frontend. The next production-oriented steps would be to add authenticated server-side MCP routing, fetch tool manifests after connection, persist projects in a backend, add observability for tool calls, and evaluate task completion quality with internal users.

### Resume bullet options

- Designed and built a React/TypeScript AI application-builder MVP for financial workflows, separating platform capabilities, project dependencies, and turn-level execution into a coherent MCP/Skills experience.
- Created a human-in-the-loop MCP onboarding flow with disabled-by-default connections, first-use trust confirmation, expandable tool manifests, and responsive preview/editing states.
- Translated ambiguous mentor feedback into an interactive chat-to-project workflow, application plaza, template publishing, and multi-turn Plan updates; shipped the prototype through GitHub.

### Interview framing

When discussing this project, be explicit that it is a frontend MVP and not a production claim. The strongest story is the product reasoning: I designed the interaction contract first, kept simulated behavior transparent, and created the seams where real MCP / Skills services can later be connected.
