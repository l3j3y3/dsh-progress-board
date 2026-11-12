# dsh-progress-board

DeepSeek Harness 的实时进度板插件：用户能看到 Agent 做到哪了，也能直接改进度，Agent 在下一步只读取改动部分。

> A user-editable live progress board for DeepSeek Harness. The agent reads only changed fields, while the full board stays in the UI.

## 功能

- **右侧可收起面板**：半开显示，支持全面展开；关闭后回到迷你条。
- **输入框上方迷你条**：总进度、当前任务、完成数、待确认数。
- **直接编辑**：标题、状态、百分比、当前动作、下一步、当前思路与实现、备注。
- **增量同步**：用户改动只以 diff 形式进入 Agent 上下文；Agent 更新只回传变化项。
- **按需启用且不会误关**：默认不加载进度工具和规则，模型侧 0 开销；**打开过一次进度板后，该会话会一直保持启用**，收起右侧栏、切换标签页、全面展开或重启 DSH 都不会关闭。只有 `/progress off` 或面板里的「Agent 更新：关」才会关闭。
- **空板首轮建任务**：启用后如果进度板还是空的，系统会要求 Agent 在本回合第一个工具调用中先建任务，再开始干活。
- **Token 与人民币消耗**：迷你条、右侧面板和全面展开视图显示本会话累计 token 与按 DeepSeek 公开单价估算的人民币费用；按当前北京时间自动区分高峰/空闲价。
- **持久化**：每个会话独立保存，启用状态与任务一起保存，重启后恢复。
- **3 秒看门狗轮询**：请求挂起会被下一轮中止并重试，避免界面停在旧状态。

## 安装

需要 DeepSeek Harness 0.2.x（Web / Desktop）。插件已发布到 npm：<https://www.npmjs.com/package/dsh-progress-board>。

1. 在设置 → 插件 → 插件管理里安装 bundle，包名填：
   ```
   dsh-progress-board
   ```
   或在终端里装进当前 profile：
   ```bash
   dsh plugin --profile web add dsh-progress-board
   ```
2. 重启 DSH（Host 侧插件在启动时加载），然后刷新页面。

插件包名：`dsh-progress-board`。从本地目录安装也一样可用（指向本仓库目录即可），包名保持不变。

## 使用

- **打开进度板**：点对话标题右侧的进度板图标，或点输入框上方的迷你条。
- **切换半开/关闭**：再次点标题右侧的进度板图标，或点迷你条主区域。
- **全面展开**：右侧面板头部的「全面展开 / 恢复半开」。
- **Agent 更新**：打开过一次面板后，Agent 会在之后每个回合自动加载 `progress_update`。收起右侧栏、切换标签页或点「全面展开」都不会关闭；面板头部会显示「Agent 更新：开 / 关」。
- **新增任务**：自动发一条消息唤醒 Agent；改状态、备注、百分比只保存，不唤醒。
- **命令**：
  - `/progress`：立即启用进度工具（不打开面板也会更新）。
  - `/progress off`：立即关闭；任务仍会保存，只是 Agent 不再自动更新。

## Token 行为

- 从未打开过进度板的会话：不发送进度板规则与工具 schema，**0 开销**。
- 打开过一次后：该会话持续启用，固定开销约 **550–750 tokens/请求**；`/progress off` 可立即恢复 0 开销。
- 空板首轮：额外约 **40–60 tokens**，只在该会话还没有任务时出现。
- 任务更新：只回传 `id / title / 变化字段`，约 **30–80 tokens/次**。
- 用户改动 diff：约 **100–250 tokens**，只在待同步期间注入。
- UI 轮询、持久化、面板操作：**0 token**。

## Token 与人民币消耗

数据来源是 token-meter 的 `tokenUsage` 会话投影（输入、缓存命中、缓存写入、输出四项），模型取自 `modelSelection` 投影。插件按 [DeepSeek 官方「模型 & 价格」页](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/) 的人民币单价估算：

| 模型 | 时段 | 缓存命中输入 | 缓存未命中输入 | 输出 |
|---|---:|---:|---:|---:|
| deepseek-flash | 空闲 | ¥0.02/M | ¥1/M | ¥4/M |
| deepseek-flash | 高峰 | ¥0.04/M | ¥2/M | ¥8/M |
| deepseek-v4-pro | 空闲 | ¥0.15/M | ¥4.5/M | ¥13.5/M |
| deepseek-v4-pro | 高峰 | ¥0.30/M | ¥9/M | ¥27/M |

- 高峰时段按北京时间周一至周五 9:00–12:00、14:00–18:00 判断；其余时间按空闲价。法定节假日未单独识别，节假日工作日可能略微高估。
- 缓存写入按缓存未命中输入价计费。
- 显示的是**估算值**，跨高峰/空闲时段的历史 token 统一按当前时段单价折算；实际扣费以 DeepSeek 账单为准。
- 如果 token-meter 投影不可用（例如精简 profile 未加载该插件），进度板会自动隐藏这一行，不影响其他功能。

## 常见问题

### 我在主界面输入内容，任务板不更新？

1.0.1 之前的版本把「启用」绑在右侧面板的挂载上：收起右侧栏、切换标签页或点「全面展开」都会卸载面板并静默关闭 Agent 工具，所以之后在主界面发消息时进度板不再变化。

现在改为**按会话持久化启用**：

- 只要打开过一次进度板，收起侧栏或重启 DSH 都不会关闭。
- 面板头部显示「Agent 更新：开」；如果显示「Agent 更新：关」，点一下即可开启。
- 迷你条显示「开启自动更新」时同样点一下即可。
- 想彻底关闭，输入 `/progress off`。

如果打开面板后仍然不动，检查面板头部是否显示「Agent 更新：关」，并刷新一次页面（Host 更新后需要重启 DSH 才会生效）。

## 文件

| 文件 | 作用 |
|---|---|
| `index.js` | Host 侧：存储、HTTP API、Agent 工具、系统提示、持久化启用 |
| `client.js` | Web 侧：右侧面板、迷你条、编辑与轮询 |
| `test/host.test.mjs` | Host 侧启用状态、持久化、空板提示与增量同步测试 |
| `cordis.patch.yml` | DSH bundle patch |
| `locale/*.json` | 插件管理器的标题与描述 |
| `icon.svg` | 插件图标 |

## 兼容性

- 依赖 DSH 的 `sidebarRightTabs`、`sidebar.right.pane.tab`、`conversation.input.dock`、`conversation.session.header.utilities` 槽位。
- Host 侧使用 `storage` 的 JSON KV 后端；找不到时退化为内存保存。

## 许可证

见 `LICENSE`。
