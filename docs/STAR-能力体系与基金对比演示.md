# STAR：盈米实验室 Demo · 能力体系与基金对比演示闭环

> 仓库：[YueYu-Rose/yingmi-AI-lab](https://github.com/YueYu-Rose/yingmi-AI-lab)  
> 日期：2026-08-07

---

## S（Situation）

盈米实验室 Demo 需要向 mentor 演示完整链路：**自然语言 → 计划 → 调用能力 → 生成金融应用**。

此前能力相关信息分散、职责不清：

- 预览底部曾有「本次使用记录」
- 代码页右侧有「能力清单」
- 聊天上方 Plan 条与项目能力展示边界模糊
- 「盈米工具」页缺少与且慢市场对齐的文案
- 「基金对比」项目无法现场演示「再改一句 → Plan / 能力随之变化」

---

## T（Task）

把产品信息架构理顺，并做出可演示闭环：

1. 清晰分层：**平台能用什么** / **项目用过什么** / **本轮执行了什么**
2. 「基金对比」项目可现场演示 Plan 条与「能力」汇总的变化
3. 盈米工具页 MCP / Skills 文案对齐且慢能力市场
4. 改动落到 GitHub，便于同步与回顾

---

## A（Action）

### 1. 信息架构重构

| 位置 | 职责 |
|------|------|
| 盈米工具页 | 平台能力目录（MCP / Skills / Agent / 组件） |
| 项目「能力」Tab | 本项目累计使用的能力 + 次数 |
| 聊天 Plan 条 | 仅本轮执行 steps |

具体改动：

- 删除预览底部「本次使用记录」
- 代码页去掉右侧能力清单，恢复「文件树 \| 代码」两栏
- 顶栏与「预览 / 代码」同级新增「**能力**」Tab
- 「能力」页按 **MCP / Skills / Agent / 组件** 四组汇总，并展示使用次数

### 2. Plan 条行为

- **生成中**：只展示当前正在执行的 step
- **完成后**：展开可查看全部 step name
- **跟进轮**：聊天历史保留首轮计划；本轮实时 Plan / Dock 统一使用 `activeSteps`

### 3. 基金对比演示脚本

- 打开项目：只保留首轮完成记录
- 输入框预填：`再加一列基金经理任职年限，并高亮回撤超过 15% 的基金`
- 用户发送后：
  - 重跑一套不同的 steps
  - 「能力」中 MCP / Skills / Agent / 组件次数累加
  - Agent 统一命名为 `fund-compare-agent`
- 完成文案弱化：不宣称预览表已改，强调 **Plan 条** 与 **「能力」汇总** 已更新

### 4. 盈米工具页文案

- **MCP**：对齐且慢 MCP 市场定位，外链  
  [https://qieman.com/mcp/mcp-market](https://qieman.com/mcp/mcp-market)
- **Skills**：对齐且慢 Skills 市场定位，外链  
  [https://qieman.com/mcp/skill-market](https://qieman.com/mcp/skill-market)
- **Agent / 组件**：补充可延续的产品描述（完整目录后续对齐）

### 5. 其他修复

- 修复点击任意项目白屏（`PlanCard` / `ExecutionChain` props 不匹配导致运行时崩溃）
- 去掉侧边栏个人区外圈黑边框

### 6. GitHub 操作

本次以 **git commit / push** 为主；仓库未观察到独立的 GitHub Actions workflow run。

| Commit | 说明 | 远端状态 |
|--------|------|----------|
| [`0682259`](https://github.com/YueYu-Rose/yingmi-AI-lab/commit/0682259e925abf12758d20c038aa43c326b748cf) | Add capabilities tab, comparison follow-up demo, and tools market copy. | 已在 `main` |
| `362a2b9` | Unify plan steps source and soften comparison follow-up copy. | 本地已提交；曾因 `github.com:443` 网络失败未推送成功 |

提交页：[Commits · YueYu-Rose/yingmi-AI-lab](https://github.com/YueYu-Rose/yingmi-AI-lab/commits/main)

主要改动文件：

- `src/pages/DesignPage.tsx`
- `src/pages/ToolsPage.tsx`
- `src/components/Sidebar.tsx`

---

## R（Result）

1. **产品分层清晰**
   - 盈米工具 = 平台目录
   - 能力 Tab = 项目累计调用
   - Plan 条 = 本轮执行

2. **演示闭环可用**  
   打开「基金对比」→ 发送预填修改句 → Plan steps 变化 + 能力次数累加

3. **文案对齐且慢**  
   MCP / Skills 可跳转官方市场页，便于 mentor 对照平台能力

4. **稳定性**  
   项目可正常打开（白屏已修）

5. **交付落库**  
   主能力包已上 GitHub（`0682259`）；收尾统一 steps 的提交 `362a2b9` 需网络恢复后再 push

---

## 附录：30 秒演示话术

> 打开「基金对比」→ 看首轮已完成的 Plan 与「能力」汇总 → 发送输入框预填的修改句 → 输入框上方 Plan 换成新 steps → 打开「能力」看 MCP / Skills / Agent / 组件次数增加。工具页可跳转且慢 MCP / Skills 市场，看平台能力目录。

---

## 附录：本地补推命令（如需要）

```powershell
git -c http.sslBackend=openssl push origin HEAD
```
