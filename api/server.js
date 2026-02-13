import express from 'express'

const app = express()
const port = process.env.PORT || 8080

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'hybrid-api' })
})

app.get('/api/cards', (req, res) => {
  const count = clampInt(req.query.count, 1200, 1, 10000)
  const revision = clampInt(req.query.revision, 1, 1, 1000000)
  const now = new Date().toISOString()
  const statuses = ['ok', 'warn', 'error']

  const cards = Array.from({ length: count }, (_, idx) => ({
    key: `rev-${revision}-item-${idx}`,
    name: `Order Widget #${String(idx + 1).padStart(4, '0')}`,
    status: statuses[idx % statuses.length],
    amount: 1000 + ((idx * 37 + revision * 13) % 90000),
    updatedAt: now
  }))

  res.json({
    revision,
    count,
    cards
  })
})

app.get('/api/not-found', (_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Requested resource not found' })
})

app.get('/api/slow', async (req, res) => {
  const delayMs = clampInt(req.query.delayMs, 1200, 100, 15000)
  await sleep(delayMs)
  res.json({ ok: true, delayMs })
})

app.listen(port, () => {
  console.log(`hybrid-api listening on :${port}`)
})

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
