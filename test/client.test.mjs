import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

/**
 * client.js is a browser bundle, not a module. Run its factory in a VM with a
 * tiny React stand-in and expose the pure pricing helpers for assertions.
 */
function loadPricingHelpers() {
  const source = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const marker = '    return {\n      inject:'
  assert.ok(source.includes(marker), 'client.js factory return marker moved')
  const instrumented = source.replace(
    marker,
    '    globalThis.__PB_TEST__ = { usageTotals, estimateCost, usageSummary, formatTokens, formatCny, usageLabel };\n' +
      marker,
  )

  let loaded
  const context = vm.createContext({
    console,
    window: {
      __ModuleLoader__: {
        load(spec) {
          loaded = spec
        },
      },
    },
  })
  vm.runInContext(instrumented, context, { filename: 'client.js' })
  assert.ok(loaded, 'client.js did not register with the module loader')

  const React = {
    createElement() {},
    Fragment: {},
    useState() {},
    useEffect() {},
    useRef() {},
    useCallback() {},
    useMemo() {},
  }
  loaded.factory(() => React)
  assert.ok(context.__PB_TEST__, 'client helpers were not exposed')
  return context.__PB_TEST__
}

const helpers = loadPricingHelpers()

test('token buckets are disjoint and sum to the displayed total', () => {
  const totals = helpers.usageTotals({
    uncachedInputTokens: 10_000,
    cacheReadTokens: 100_000,
    cacheWriteTokens: 2_000,
    outputTokens: 3_000,
  })
  assert.equal(totals.input, 10_000)
  assert.equal(totals.cacheRead, 100_000)
  assert.equal(totals.cacheWrite, 2_000)
  assert.equal(totals.output, 3_000)
  assert.equal(totals.total, 115_000)
})

test('DeepSeek list prices produce the expected RMB estimate', () => {
  const flashIdle = helpers.estimateCost(
    { input: 1_000_000, cacheRead: 1_000_000, cacheWrite: 0, output: 1_000_000 },
    'deepseek-flash',
    false,
  )
  assert.equal(flashIdle, 1 + 0.02 + 4)

  const flashPeak = helpers.estimateCost(
    { input: 1_000_000, cacheRead: 1_000_000, cacheWrite: 0, output: 1_000_000 },
    'deepseek-flash',
    true,
  )
  assert.equal(flashPeak, 2 + 0.04 + 8)

  const proIdle = helpers.estimateCost(
    { input: 1_000_000, cacheRead: 0, cacheWrite: 0, output: 1_000_000 },
    'deepseek-v4-pro',
    false,
  )
  assert.equal(proIdle, 4.5 + 13.5)

  const unknownModel = helpers.estimateCost(
    { input: 1_000_000, cacheRead: 0, cacheWrite: 0, output: 0 },
    'some-new-model',
    false,
  )
  assert.equal(unknownModel, 1)
})

test('non-DeepSeek routes show tokens without a currency estimate', () => {
  const view = helpers.usageSummary({
    usage: { uncachedInputTokens: 1000, outputTokens: 100 },
    model: 'gpt-x',
    provider: 'openai',
  })
  assert.equal(view.total, 1100)
  assert.equal(view.cost, null)
})

test('usage label and number formatting stay compact', () => {
  assert.equal(helpers.formatTokens(999), '999')
  assert.equal(helpers.formatTokens(1_500), '1.5k')
  assert.equal(helpers.formatTokens(120_000), '120k')
  assert.equal(helpers.formatTokens(2_500_000), '2.50M')
  assert.equal(helpers.formatCny(0.02), '¥0.02')
  assert.equal(helpers.formatCny(0.0042), '¥0.0042')
  assert.equal(helpers.formatCny(0), '¥0')
  assert.equal(
    helpers.usageLabel({
      total: 120_000,
      cost: 0.02,
    }),
    '120k tok · ≈¥0.02',
  )
})
