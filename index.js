/**
 * Host half of the progress board.
 *
 * The board is intentionally small: a per-session flat task list, a revisioned
 * patch API for the browser, and one agent tool. The agent never receives the
 * whole list back after an update; only the changed items and a compact summary
 * are returned.
 */

const ROUTE_BASE = '/progress-board'
const UNIT_NAME = 'progress_board'
const MAX_BODY_BYTES = 256 * 1024
const MAX_ITEMS = 200
const MAX_CHANGES = 50
const MAX_USER_CHANGES = 80
const MAX_TITLE = 180
const MAX_TEXT = 600
const MAX_APPROACH = 2000
const MAX_NOTE = 1600
const MAX_GROUP = 80

const STATUSES = new Set(['todo', 'doing', 'done', 'blocked'])

export const inject = ['tools', 'systemPrompt', 'webServer', 'agents']

const PROGRESS_POLICY = `## 进度板
progress_update 维护用户可见的实时进度板。每项含 title/status/percent/current/next/approach/note。
- 开工前先建扁平任务；准备开始一项任务时先把该项设为 doing，current 写正在准备/做什么；完成时立即设为 done；若还有下一步，把下一条设为 doing。只在完成任务、状态/百分比实质变化、思路转向或应用用户改动时更新；只发变化项，不重发整份计划。
- 用户每发来一段新的需求或反馈，先判断是否新任务；若是，在该回合开头新增/调整任务，再动手。
- 用户改动会以“进度板用户改动”注入，只含变化字段；以它为准，处理完传 ackUserRevision。
- 聊天只说明推进、下一步和待决策点，不复述整份计划。

## 提问
禁止猜。只有三类立即停：不可逆/高后果；目标根本歧义且在前 10%；需要价值判断或策略取舍。
其余采用可逆默认并标注假设；只有答案会显著改变路径、且至少两个维度各有三种合理解读时才问。
输入/约束澄清最晚约 50%，任何澄清不拖到中后段。每任务最多 2 轮、每轮最多 3 问；选项化、给推荐默认、先复述理解。问前把相关任务标 blocked 并写清等什么。`

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function text(value, max) {
  if (typeof value !== 'string') return undefined
  return value.trim().slice(0, max)
}

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function sessionKey(sessionId) {
  return Buffer.from(sessionId, 'utf8').toString('base64url')
}

function emptyState(sessionId) {
  const now = Date.now()
  return {
    version: 1,
    sessionId,
    revision: 0,
    userRevision: 0,
    agentSeenRevision: 0,
    createdAt: now,
    updatedAt: now,
    items: [],
    userChanges: [],
  }
}

function newItemId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function summarize(items) {
  const total = items.length
  const counts = { done: 0, doing: 0, todo: 0, blocked: 0 }
  let sum = 0
  for (const item of items) {
    counts[item.status] += 1
    sum += item.percent
  }
  return {
    total,
    done: counts.done,
    doing: counts.doing,
    todo: counts.todo,
    blocked: counts.blocked,
    percent: total === 0 ? 0 : Math.round(sum / total),
  }
}

function normalizeItems(items) {
  items.sort((a, b) => a.order - b.order || a.updatedAt - b.updatedAt || a.id.localeCompare(b.id))
  items.forEach((item, index) => {
    item.order = index
  })
}

function itemView(item) {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    percent: item.percent,
    current: item.current,
    next: item.next,
    approach: item.approach || '',
    note: item.note,
    group: item.group,
    order: item.order,
    updatedAt: item.updatedAt,
    updatedBy: item.updatedBy,
  }
}

function compactValue(value) {
  if (value === undefined) return null
  if (typeof value === 'string' && value.length > 240) return `${value.slice(0, 240)}…`
  return value
}

function fieldLabel(field) {
  return (
    {
      title: '标题',
      status: '状态',
      percent: '百分比',
      current: '当前动作',
      next: '下一步',
      approach: '思路与实现',
      note: '备注',
      group: '分组',
      order: '顺序',
    }[field] || field
  )
}

function describeChange(change) {
  if (change.kind === 'add') {
    const details = (change.fields || [])
      .filter((field) => field.field !== 'order')
      .map((field) => `${fieldLabel(field.field)}=${JSON.stringify(compactValue(field.to))}`)
      .join('，')
    return `- [${change.itemId}] 新增任务「${change.title}」${details ? `（${details}）` : ''}`
  }
  if (change.kind === 'remove') {
    return `- [${change.itemId}] 删除任务「${change.title}」`
  }
  const fields = (change.fields || [])
    .filter((field) => field.field !== 'order')
    .map(
      (field) =>
        `${fieldLabel(field.field)}：${JSON.stringify(compactValue(field.from))} → ${JSON.stringify(compactValue(field.to))}`,
    )
    .join('；')
  return `- [${change.itemId}] 「${change.title}」${fields ? `：${fields}` : ''}`
}

export async function apply(ctx) {
  const states = new Map()
  let unit
  let storageError = ''
  let writeChain = Promise.resolve()

  const storage = ctx.get('storage')
  const webServer = ctx.get('webServer')
  const systemPrompt = ctx.get('systemPrompt')
  const tools = ctx.get('tools')
  const agents = ctx.get('agents')
  const commands = ctx.get('commands')
  if (!systemPrompt || !tools) throw new Error('progress-board 需要 systemPrompt 与 tools 服务')

  const panelSessions = new Set()
  const commandUntil = new Map()
  const COMMAND_ENABLE_MS = 15 * 60 * 1000

  function isEnabled(sessionId) {
    if (panelSessions.has(sessionId)) return true
    const until = commandUntil.get(sessionId)
    if (until === undefined) return false
    if (until > Date.now()) return true
    commandUntil.delete(sessionId)
    return false
  }

  function setPanelEnabled(sessionId, enabled) {
    if (enabled) panelSessions.add(sessionId)
    else panelSessions.delete(sessionId)
  }

  function setCommandEnabled(sessionId, enabled) {
    if (enabled) commandUntil.set(sessionId, Date.now() + COMMAND_ENABLE_MS)
    else {
      commandUntil.delete(sessionId)
      panelSessions.delete(sessionId)
    }
  }

  if (storage) {
    try {
      const backendName = storage.backend.names().find((name) => {
        try {
          return Boolean(storage.backend.get(name).kv)
        } catch (_error) {
          return false
        }
      })
      if (backendName) {
        unit = await storage.backend.get(backendName).kv.open({
          name: UNIT_NAME,
          version: 1,
          tables: ['sessions'],
          hasGlobal: false,
          layout: 'per-record',
        })
        const all = await unit.loadAll()
        for (const stored of Object.values(all.tables.sessions || {})) {
          const record = isObject(stored) && isObject(stored.record) ? stored.record : stored
          if (!isObject(record) || typeof record.sessionId !== 'string' || !Array.isArray(record.items)) continue
          states.set(record.sessionId, record)
        }
      } else {
        storageError = '没有可用的 KV 存储后端，进度只保存在内存中。'
      }
    } catch (error) {
      storageError = `进度存储初始化失败，进度只保存在内存中：${error instanceof Error ? error.message : String(error)}`
    }
  } else {
    storageError = 'storage 服务不可用，进度只保存在内存中。'
  }

  function ensureState(sessionId) {
    let state = states.get(sessionId)
    if (!state) {
      state = emptyState(sessionId)
      states.set(sessionId, state)
    }
    for (const item of state.items) {
      if (typeof item.approach !== 'string') item.approach = ''
    }
    return state
  }

  function persist(sessionId) {
    if (!unit) return writeChain
    const snapshot = clone(states.get(sessionId))
    writeChain = writeChain
      .then(async () => {
        await unit.putRecord('sessions', sessionKey(sessionId), snapshot)
        if (storageError.startsWith('进度保存失败')) storageError = ''
      })
      .catch((error) => {
        storageError = `进度保存失败，改动可能只在内存中：${error instanceof Error ? error.message : String(error)}`
      })
    return writeChain
  }

  function publicSnapshot(state) {
    const items = state.items.slice().sort((a, b) => a.order - b.order).map(itemView)
    return {
      ok: true,
      sessionId: state.sessionId,
      revision: state.revision,
      userRevision: state.userRevision,
      agentSeenRevision: state.agentSeenRevision,
      pendingUserChanges: state.userChanges.filter((change) => change.revision > state.agentSeenRevision).length,
      updatedAt: state.updatedAt,
      persistent: Boolean(unit) && !storageError.includes('失败'),
      storageError: storageError || null,
      items,
      summary: summarize(items),
      serverTime: Date.now(),
    }
  }

  function findItem(state, change) {
    if (typeof change.id === 'string' && change.id.trim()) {
      const id = change.id.trim()
      return state.items.find((item) => item.id === id)
    }
    if (typeof change.title === 'string' && change.title.trim()) {
      const title = change.title.trim()
      const matches = state.items.filter((item) => item.title === title)
      if (matches.length > 1) {
        throw new Error(`标题「${title}」对应多个任务，请用 id 指定`)
      }
      return matches[0]
    }
    return undefined
  }

  function applyOneChange(state, change, origin, now, records) {
    if (!isObject(change)) throw new Error('changes 的每一项必须是对象')
    const remove = change.remove === true
    const existing = findItem(state, change)

    if (remove) {
      if (!existing) throw new Error(`找不到要删除的任务：${change.id || change.title || '(未提供 id/title)'}`)
      state.items = state.items.filter((item) => item.id !== existing.id)
      records.push({ kind: 'remove', itemId: existing.id, title: existing.title, fields: [] })
      return
    }

    const hasTitle = typeof change.title === 'string' && change.title.trim()
    if (!existing && !hasTitle) {
      throw new Error('新增任务必须提供 title；更新任务必须提供 id 或精确 title')
    }

    if (!existing) {
      if (state.items.length >= MAX_ITEMS) throw new Error(`任务数量已达到上限 ${MAX_ITEMS}`)
      const title = text(change.title, MAX_TITLE)
      if (!title) throw new Error('任务标题不能为空')
      const status = STATUSES.has(change.status) ? change.status : 'todo'
      const percent = status === 'done' ? 100 : Math.max(0, Math.min(100, Math.round(finiteNumber(change.percent) ?? 0)))
      const item = {
        id: newItemId(),
        title,
        status,
        percent,
        current: text(change.current, MAX_TEXT) || '',
        next: text(change.next, MAX_TEXT) || '',
        approach: text(change.approach, MAX_APPROACH) || '',
        note: text(change.note, MAX_NOTE) || '',
        group: text(change.group, MAX_GROUP) || '',
        order: state.items.length,
        updatedAt: now,
        updatedBy: origin,
      }
      state.items.push(item)
      records.push({
        kind: 'add',
        itemId: item.id,
        title: item.title,
        fields: [
          { field: 'status', from: null, to: item.status },
          { field: 'percent', from: null, to: item.percent },
        ],
      })
      return
    }

    const fields = []
    function record(field, from, to) {
      if (Object.is(from, to)) return
      fields.push({ field, from, to })
    }

    if (typeof change.title === 'string') {
      const nextTitle = text(change.title, MAX_TITLE)
      if (!nextTitle) throw new Error('任务标题不能为空')
      record('title', existing.title, nextTitle)
      existing.title = nextTitle
    }

    if (typeof change.status === 'string') {
      if (!STATUSES.has(change.status)) throw new Error(`未知状态：${change.status}`)
      record('status', existing.status, change.status)
      existing.status = change.status
      if (change.status === 'done') {
        record('percent', existing.percent, 100)
        existing.percent = 100
      }
    }

    if (change.percent !== undefined) {
      const value = finiteNumber(change.percent)
      if (value === undefined) throw new Error('percent 必须是 0–100 的数字')
      const nextPercent = Math.max(0, Math.min(100, Math.round(value)))
      record('percent', existing.percent, nextPercent)
      existing.percent = nextPercent
    }

    if (existing.status === 'done' && existing.percent !== 100) {
      record('percent', existing.percent, 100)
      existing.percent = 100
    }

    for (const [field, max] of [
      ['current', MAX_TEXT],
      ['next', MAX_TEXT],
      ['approach', MAX_APPROACH],
      ['note', MAX_NOTE],
      ['group', MAX_GROUP],
    ]) {
      if (typeof change[field] === 'string') {
        const nextValue = text(change[field], max) || ''
        record(field, existing[field], nextValue)
        existing[field] = nextValue
      }
    }

    if (change.order !== undefined) {
      const nextOrder = finiteNumber(change.order)
      if (nextOrder === undefined) throw new Error('order 必须是数字')
      record('order', existing.order, nextOrder)
      existing.order = nextOrder
    }

    if (fields.length > 0) {
      existing.updatedAt = now
      existing.updatedBy = origin
      records.push({ kind: 'edit', itemId: existing.id, title: existing.title, fields })
    }
  }

  async function applyChanges({ sessionId, changes, origin, expectedRevision, ackUserRevision }) {
    if (typeof sessionId !== 'string' || !sessionId || sessionId.length > 240) {
      throw new Error('无效的 sessionId')
    }
    if (!Array.isArray(changes)) throw new Error('changes 必须是数组')
    if (changes.length > MAX_CHANGES) throw new Error(`一次最多提交 ${MAX_CHANGES} 项改动`)
    if (expectedRevision !== undefined && finiteNumber(expectedRevision) === undefined) {
      throw new Error('expectedRevision 必须是数字')
    }

    const state = ensureState(sessionId)
    if (expectedRevision !== undefined && expectedRevision !== state.revision) {
      const error = new Error('进度板已被更新，请先刷新再提交')
      error.statusCode = 409
      error.snapshot = publicSnapshot(state)
      throw error
    }

    const beforeItems = new Map(state.items.map((item) => [item.id, clone(item)]))
    const records = []
    const now = Date.now()
    for (const change of changes) applyOneChange(state, change, origin, now, records)

    let revisionChanged = false
    if (records.length > 0) {
      state.revision += 1
      state.updatedAt = now
      normalizeItems(state.items)
      for (const record of records) {
        if (record.kind !== 'edit') continue
        const before = beforeItems.get(record.itemId)
        if (!before) continue
        const orderField = record.fields.find((field) => field.field === 'order')
        if (orderField) {
          const after = state.items.find((item) => item.id === record.itemId)
          if (after) orderField.to = after.order
        }
      }
      if (origin === 'user') {
        state.userRevision = state.revision
        for (const record of records) state.userChanges.push({ revision: state.revision, at: now, ...record })
        if (state.userChanges.length > MAX_USER_CHANGES) {
          state.userChanges.splice(0, state.userChanges.length - MAX_USER_CHANGES)
        }
      } else if (state.userRevision > state.agentSeenRevision) {
        state.agentSeenRevision = state.userRevision
      }
      revisionChanged = true
    }

    if (origin === 'agent' && ackUserRevision !== undefined) {
      const ack = finiteNumber(ackUserRevision)
      if (ack !== undefined) state.agentSeenRevision = Math.max(state.agentSeenRevision, Math.min(state.userRevision, Math.round(ack)))
    }

    if (revisionChanged || (origin === 'agent' && ackUserRevision !== undefined)) await persist(sessionId)

    const changed = records.map((record) => {
      if (record.kind === 'remove') return { id: record.itemId, title: record.title, removed: true }
      return {
        id: record.itemId,
        title: record.title,
        change: record.kind,
        fields: record.fields.map((field) => field.field),
      }
    })
    return { snapshot: publicSnapshot(state), changed: changed.filter(Boolean) }
  }

  function pendingContext(sessionId) {
    if (!isEnabled(sessionId)) return ''
    const state = states.get(sessionId)
    if (!state || state.userRevision <= state.agentSeenRevision) return ''
    const changes = state.userChanges.filter((change) => change.revision > state.agentSeenRevision).slice(-20)
    if (changes.length === 0) return ''
    const lines = changes.map(describeChange)
    return `<progress-board-user-edits revision="${state.userRevision}">
用户在进度板上做了以下改动。只依据这些改动调整方向，不要重读整份计划；用户改动优先于你原来的计划。
${lines.join('\n')}
处理完后调用 progress_update，传 ackUserRevision=${state.userRevision}。如果这些改动不要求修改任务，也可以传 changes=[] 仅确认收到。
</progress-board-user-edits>`
  }

  const routeDisposers = []
  function sendJson(res, status, body) {
    const textBody = JSON.stringify(body)
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'content-length': Buffer.byteLength(textBody),
    })
    res.end(textBody)
  }

  async function readJson(req) {
    let size = 0
    const chunks = []
    for await (const chunk of req) {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        const error = new Error('请求体过大')
        error.statusCode = 413
        throw error
      }
      chunks.push(chunk)
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
    } catch (_error) {
      const error = new Error('请求体不是有效 JSON')
      error.statusCode = 400
      throw error
    }
  }

  if (webServer) {
    routeDisposers.push(
      webServer.register({
        kind: 'exact',
        path: `${ROUTE_BASE}/snapshot`,
        handler: (req, res) => {
          if (req.method !== 'GET') {
            res.writeHead(405, { allow: 'GET' })
            res.end()
            return
          }
          const url = new URL(req.url || '/', 'http://localhost')
          const sessionId = url.searchParams.get('sessionId') || ''
          if (!sessionId || sessionId.length > 240) {
            sendJson(res, 400, { ok: false, error: '缺少有效的 sessionId' })
            return
          }
          sendJson(res, 200, publicSnapshot(ensureState(sessionId)))
        },
      }),
    )
    routeDisposers.push(
      webServer.register({
        kind: 'exact',
        path: `${ROUTE_BASE}/action`,
        handler: async (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405, { allow: 'POST' })
            res.end()
            return
          }
          if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
            sendJson(res, 415, { ok: false, error: 'content-type 必须是 application/json' })
            return
          }
          try {
            const body = await readJson(req)
            const result = await applyChanges({
              sessionId: body.sessionId,
              changes: body.changes,
              origin: 'user',
              expectedRevision: body.expectedRevision,
              ackUserRevision: undefined,
            })
            sendJson(res, 200, { ok: true, ...result.snapshot, changed: result.changed })
          } catch (error) {
            const status = error && error.statusCode ? error.statusCode : 400
            sendJson(res, status, {
              ok: false,
              error: error instanceof Error ? error.message : String(error),
              ...(error && error.snapshot ? { snapshot: error.snapshot } : {}),
            })
          }
        },
      }),
    )
    routeDisposers.push(
      webServer.register({
        kind: 'exact',
        path: `/progress-board/active`,
        handler: async (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405, { allow: 'POST' })
            res.end()
            return
          }
          if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
            sendJson(res, 415, { ok: false, error: 'content-type 必须是 application/json' })
            return
          }
          try {
            const body = await readJson(req)
            const sessionId = body.sessionId
            if (typeof sessionId !== 'string' || !sessionId || sessionId.length > 240) {
              sendJson(res, 400, { ok: false, error: '缺少有效的 sessionId' })
              return
            }
            if (typeof body.active !== 'boolean') {
              sendJson(res, 400, { ok: false, error: 'active 必须是布尔值' })
              return
            }
            if (body.source === 'command') setCommandEnabled(sessionId, body.active)
            else setPanelEnabled(sessionId, body.active)
            sendJson(res, 200, {
              ok: true,
              enabled: isEnabled(sessionId),
              panel: panelSessions.has(sessionId),
              commandUntil: commandUntil.get(sessionId) ?? null,
            })
          } catch (error) {
            const status = error && error.statusCode ? error.statusCode : 400
            sendJson(res, status, { ok: false, error: error instanceof Error ? error.message : String(error) })
          }
        },
      }),
    )
  }

  ctx.effect(() => () => {
    for (const dispose of routeDisposers.splice(0)) dispose()
    if (unit) unit.close().catch(() => {})
  }, 'progress-board: http routes and storage')

  ctx.effect(
    () =>
      tools.register({
        name: 'progress_update',
        description:
          '维护用户可见进度板。只在子目标完成、状态/百分比实质变化、用户新任务或用户改动时增量更新；只发变化项，不重发整份计划。用户改动处理后传 ackUserRevision；仅确认传 changes=[]。',
        parameters: {
          type: 'object',
          additionalProperties: false,
          properties: {
            changes: {
              type: 'array',
              maxItems: MAX_CHANGES,
              description: '增量补丁；新增不传 id，更新传 id 或精确 title。',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  status: { type: 'string', enum: ['todo', 'doing', 'done', 'blocked'] },
                  percent: { type: 'number', minimum: 0, maximum: 100 },
                  current: { type: 'string' },
                  next: { type: 'string' },
                  approach: { type: 'string' },
                  note: { type: 'string' },
                  remove: { type: 'boolean' },
                },
              },
            },
            ackUserRevision: { type: 'integer', minimum: 0 },
          },
          required: ['changes'],
        },
        output: {
          schema: {
            type: 'object',
            additionalProperties: true,
            properties: {
              ok: { type: 'boolean' },
              revision: { type: 'number' },
              summary: { type: 'object', additionalProperties: true },
              changed: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
          render(_args, value) {
            return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
          },
        },
        async execute(args, exec) {
          const agent = exec.agent
          if (!agent) throw new Error('progress_update 只能在 Agent 会话中调用')
          if (!isObject(args)) throw new Error('参数必须是对象')
          if (!Array.isArray(args.changes)) throw new Error('changes 必须是数组')
          const result = await applyChanges({
            sessionId: agent.session.id,
            changes: args.changes,
            origin: 'agent',
            expectedRevision: args.expectedRevision,
            ackUserRevision: args.ackUserRevision,
          })
          return {
            ok: true,
            revision: result.snapshot.revision,
            userRevision: result.snapshot.userRevision,
            agentSeenRevision: result.snapshot.agentSeenRevision,
            summary: result.snapshot.summary,
            changed: result.changed,
          }
        },
      }, { when: ({ agent }) => isEnabled(agent.session.id) }),
    'progress-board: agent tool',
  )

  if (commands) {
    ctx.effect(
      () =>
        commands.register({
          name: 'progress',
          description: '启用进度板工具（默认不加载，避免 token 开销）',
          input: { hint: '[on|off]' },
          handler: ({ agent, rawInput }) => {
            const sessionId = agent.session.id
            const mode = String(rawInput || '').trim().toLowerCase()
            if (mode === 'off') {
              setCommandEnabled(sessionId, false)
              return { kind: 'success', text: '进度板已关闭；Agent 不再加载进度工具。' }
            }
            setCommandEnabled(sessionId, true)
            return {
              kind: 'success',
              text: '进度板已启用 15 分钟；点击右上角进度板按钮打开面板。输入 /progress off 可关闭。',
            }
          },
        }),
      'progress-board: /progress command',
    )
  }

  const agentDisposers = new Map()
  function bindAgentContext(agent) {
    const sessionId = agent.session.id
    if (agentDisposers.has(sessionId)) return
    const dispose = agent.ctx.effect(
      () => {
        const offPolicy = agent.ctx.systemPrompt.section({
          name: 'progress-board-policy',
          order: 520,
          text: () => (isEnabled(sessionId) ? PROGRESS_POLICY : ''),
        })
        const offContext = agent.ctx.systemPrompt.context({
          name: 'progress-board-user-edits',
          order: 60,
          text: () => pendingContext(sessionId),
        })
        return () => {
          offPolicy()
          offContext()
        }
      },
      'progress-board: prompt policy and user edits',
    )
    agentDisposers.set(sessionId, dispose)
  }

  ctx.effect(() => {
    // Existing agents do not replay `agent/created`; bind them explicitly so a
    // plugin enabled mid-conversation still receives user-edit diffs.
    for (const agent of agents?.list?.() ?? []) bindAgentContext(agent)
    const offCreated = ctx.on('agent/created', ({ agent }) => bindAgentContext(agent))
    const offDisposed = ctx.on('agent/disposed', ({ agent }) => {
      const dispose = agentDisposers.get(agent.session.id)
      if (dispose) {
        dispose()
        agentDisposers.delete(agent.session.id)
      }
    })
    return () => {
      offCreated()
      offDisposed()
      for (const dispose of agentDisposers.values()) dispose()
      agentDisposers.clear()
    }
  }, 'progress-board: agent contexts')
}
