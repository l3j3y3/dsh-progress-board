import assert from 'node:assert/strict'
import test from 'node:test'

import { apply } from '../index.js'

const SESSION = 'session-test'

function createHarness(seed = {}) {
  const records = { ...seed }
  const routes = new Map()
  const toolMap = new Map()
  const commandMap = new Map()
  const sections = new Map()
  const contexts = new Map()

  const unit = {
    async loadAll() {
      return { tables: { sessions: { ...records } } }
    },
    async putRecord(_table, key, record) {
      records[key] = record
    },
    async close() {},
  }

  const storage = {
    backend: {
      names: () => ['json'],
      get: () => ({ kv: { open: async () => unit } }),
    },
  }

  const webServer = {
    register(route) {
      routes.set(route.path, route)
      return () => routes.delete(route.path)
    },
  }

  const tools = {
    register(definition, options) {
      toolMap.set(definition.name, { definition, options })
      return () => toolMap.delete(definition.name)
    },
  }

  const commands = {
    register(definition) {
      commandMap.set(definition.name, definition)
      return () => commandMap.delete(definition.name)
    },
  }

  const agent = {
    session: { id: SESSION },
    ctx: {
      effect(fn) {
        return fn()
      },
      systemPrompt: {
        section(definition) {
          sections.set(definition.name, definition.text)
          return () => sections.delete(definition.name)
        },
        context(definition) {
          contexts.set(definition.name, definition.text)
          return () => contexts.delete(definition.name)
        },
      },
    },
  }

  const ctx = {
    get(name) {
      if (name === 'storage') return storage
      if (name === 'webServer') return webServer
      if (name === 'tools') return tools
      if (name === 'commands') return commands
      if (name === 'agents') return { list: () => [agent] }
      if (name === 'systemPrompt') return {}
      return undefined
    },
    effect(fn) {
      return fn()
    },
    on() {
      return () => {}
    },
  }

  return { agent, commands: commandMap, contexts, ctx, records, routes, sections, tools: toolMap }
}

function call(route, { method = 'GET', url = '/', body } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? [] : [Buffer.from(JSON.stringify(body))]
    const req = {
      method,
      url,
      headers: { 'content-type': 'application/json' },
      async *[Symbol.asyncIterator]() {
        for (const chunk of payload) yield chunk
      },
    }
    const res = {
      status: 0,
      body: '',
      headers: {},
      writeHead(status, headers) {
        this.status = status
        this.headers = headers
      },
      end(text = '') {
        this.body = text
        resolve(this)
      },
    }
    Promise.resolve(route.handler(req, res)).catch(reject)
  })
}

async function snapshot(harness, sessionId = SESSION) {
  const route = harness.routes.get('/progress-board/snapshot')
  const response = await call(route, {
    url: `/progress-board/snapshot?sessionId=${encodeURIComponent(sessionId)}`,
  })
  return JSON.parse(response.body)
}

async function active(harness, enabled, source) {
  const route = harness.routes.get('/progress-board/active')
  const response = await call(route, {
    method: 'POST',
    url: '/progress-board/active',
    body: { sessionId: SESSION, active: enabled, source },
  })
  return JSON.parse(response.body)
}

async function change(harness, changes) {
  const route = harness.routes.get('/progress-board/action')
  const response = await call(route, {
    method: 'POST',
    url: '/progress-board/action',
    body: { sessionId: SESSION, changes },
  })
  return { response, body: JSON.parse(response.body) }
}

async function runTool(harness, args) {
  const tool = harness.tools.get('progress_update')
  return tool.definition.execute(args, { agent: harness.agent })
}

test('opening the board enables the agent tool and keeps it across panel unmount', async () => {
  const harness = createHarness()
  await apply(harness.ctx)

  assert.equal(harness.tools.get('progress_update').options.when({ agent: harness.agent }), false)

  await active(harness, true, 'panel')
  assert.equal((await snapshot(harness)).enabled, true)
  assert.equal(harness.tools.get('progress_update').options.when({ agent: harness.agent }), true)

  // Collapsing the sidebar / switching tabs posts active:false with source panel.
  await active(harness, false, 'panel')
  assert.equal((await snapshot(harness)).enabled, true)
  assert.equal(harness.tools.get('progress_update').options.when({ agent: harness.agent }), true)

  // Only an explicit user/command close turns it off.
  await active(harness, false, 'user')
  assert.equal((await snapshot(harness)).enabled, false)
  assert.equal(harness.tools.get('progress_update').options.when({ agent: harness.agent }), false)
})

test('enabled state survives a host restart and the agent updates the board', async () => {
  const first = createHarness()
  await apply(first.ctx)
  await active(first, true, 'panel')
  await new Promise((resolve) => setTimeout(resolve, 0))

  const second = createHarness(first.records)
  await apply(second.ctx)
  assert.equal((await snapshot(second)).enabled, true)
  assert.equal(second.tools.get('progress_update').options.when({ agent: second.agent }), true)

  await runTool(second, {
    changes: [{ title: '实现登录', status: 'doing', percent: 30, current: '写接口' }],
  })
  const state = await snapshot(second)
  assert.equal(state.items.length, 1)
  assert.equal(state.items[0].title, '实现登录')
  assert.equal(state.items[0].status, 'doing')

  await runTool(second, { changes: [{ title: '实现登录', status: 'done', approach: '接口和页面都完成' }] })
  const done = await snapshot(second)
  assert.equal(done.items[0].percent, 100)
  assert.equal(done.items[0].approach, '接口和页面都完成')
  assert.equal(done.summary.percent, 100)
})

test('an empty enabled board gets a first-call kickoff, and a non-empty one does not', async () => {
  const harness = createHarness()
  await apply(harness.ctx)
  await active(harness, true, 'panel')

  const kickoff = harness.contexts.get('progress-board-kickoff')
  assert.match(kickoff(), /第一个工具调用必须是 progress_update/)

  await runTool(harness, { changes: [{ title: '先建一项任务', status: 'doing', percent: 5 }] })
  assert.equal(kickoff(), '')
})

test('agent updates no longer acknowledge user edits implicitly', async () => {
  const harness = createHarness()
  await apply(harness.ctx)
  await active(harness, true, 'panel')

  await runTool(harness, { changes: [{ title: '任务 A', status: 'doing', percent: 10 }] })
  await change(harness, [{ title: '任务 A', status: 'done' }])
  const pending = await snapshot(harness)
  assert.equal(pending.userRevision, pending.revision)
  assert.equal(pending.pendingUserChanges, 1)
  assert.match(harness.contexts.get('progress-board-user-edits')(), /任务 A/)

  // An unrelated agent update must not swallow the pending user diff.
  await runTool(harness, { changes: [{ title: '任务 B', status: 'todo', percent: 0 }] })
  assert.equal((await snapshot(harness)).pendingUserChanges, 1)

  await runTool(harness, { changes: [], ackUserRevision: pending.userRevision })
  assert.equal((await snapshot(harness)).pendingUserChanges, 0)
})

test('a bad item in a batch leaves the board untouched', async () => {
  const harness = createHarness()
  await apply(harness.ctx)
  await active(harness, true, 'panel')
  await runTool(harness, { changes: [{ title: '原始标题', status: 'todo', percent: 10 }] })

  const before = await snapshot(harness)
  const { response } = await change(harness, [
    { title: '原始标题', status: 'done' },
    { ackUserRevision: 2 },
  ])
  assert.equal(response.status, 400)

  const after = await snapshot(harness)
  assert.equal(after.revision, before.revision)
  assert.equal(after.items[0].title, '原始标题')
  assert.equal(after.items[0].status, 'todo')
})

test('/progress on/off controls the tool without a timer', async () => {
  const harness = createHarness()
  await apply(harness.ctx)

  const command = harness.commands.get('progress')
  assert.equal(typeof command.handler, 'function')

  command.handler({ agent: harness.agent, rawInput: '' })
  assert.equal((await snapshot(harness)).enabled, true)

  command.handler({ agent: harness.agent, rawInput: 'off' })
  assert.equal((await snapshot(harness)).enabled, false)
})
