# dsh-progress-board

DeepSeek Harness 的实时进度板插件：用户能看到 Agent 做到哪了，也能直接改进度，Agent 在下一步只读取改动部分。

> A user-editable live progress board for DeepSeek Harness. The agent reads only changed fields, while the full board stays in the UI.

## 功能

- **右侧可收起面板**：半开显示，支持全面展开；关闭后回到迷你条。
- **输入框上方迷你条**：总进度、当前任务、完成数、待确认数。
- **直接编辑**：标题、状态、百分比、当前动作、下一步、当前思路与实现、备注。
- **增量同步**：用户改动只以 diff 形式进入 Agent 上下文；Agent 更新只回传变化项。
- **按需启用**：默认不加载进度工具和规则，模型侧 0 开销；打开面板或输入 `/progress` 才启用。
- **持久化**：每个会话独立保存，重启后恢复。
- **3 秒看门狗轮询**：请求挂起会被下一轮中止并重试，避免界面停在旧状态。

## 安装

需要 DeepSeek Harness 0.2.x（Web / Desktop）。

1. 克隆本仓库：
   ```bash
   git clone https://github.com/l3j3y3/dsh-progress-board.git
   ```
2. 在 DSH 的插件管理中选择安装本地 bundle，指向仓库目录。
3. 启用后刷新页面。

插件包名：`@local/progress-board`。

## 使用

- **打开进度板**：点对话标题右侧的进度板图标，或点输入框上方的迷你条。
- **切换半开/关闭**：再次点标题右侧的进度板图标，或点迷你条主区域。
- **全面展开**：右侧面板头部的「全面展开 / 恢复半开」。
- **Agent 更新**：打开面板期间，Agent 会自动加载 `progress_update` 工具。
- **命令**：
  - `/progress`：启用进度工具 15 分钟（面板不开也能更新）。
  - `/progress off`：立即关闭。

## Token 行为

- 默认关闭：不发送进度板规则与工具 schema，**0 开销**。
- 启用后：固定开销约 **550–750 tokens/请求**。
- 任务更新：只回传 `id / title / 变化字段`，约 **30–80 tokens/次**。
- 用户改动 diff：约 **100–250 tokens**，只在待同步期间注入。
- UI 轮询、持久化、面板操作：**0 token**。

## 文件

| 文件 | 作用 |
|---|---|
| `index.js` | Host 侧：存储、HTTP API、Agent 工具、系统提示、按需启用 |
| `client.js` | Web 侧：右侧面板、迷你条、编辑与轮询 |
| `cordis.patch.yml` | DSH bundle patch |
| `locale/*.json` | 插件管理器的标题与描述 |
| `icon.svg` | 插件图标 |

## 兼容性

- 依赖 DSH 的 `sidebarRightTabs`、`sidebar.right.pane.tab`、`conversation.input.dock`、`conversation.session.header.utilities` 槽位。
- Host 侧使用 `storage` 的 JSON KV 后端；找不到时退化为内存保存。

## 许可证

见 `LICENSE`。
