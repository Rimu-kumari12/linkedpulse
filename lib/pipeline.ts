import { store } from './store'
import { fetchLinkedInFeed } from './linkedin'
import { detectKeywords } from './keywords'
import { generateComment } from './claude'
import { v4 as uuidv4 } from 'uuid'

let pipelineTimer: ReturnType<typeof setTimeout> | null = null
let isProcessing = false

// ─── Main Poll Cycle ────────────────────────────────────────────────────────

async function runPollCycle() {
  if (isProcessing) return
  isProcessing = true

  const { config } = store

  store.addLog('info', 'POLL', `Starting feed poll [scope: ${config.feedScope}]`)
  store.stats.lastPollAt = new Date().toISOString()
  store.broadcastStats()

  try {
    const batchSize = Math.floor(Math.random() * 4) + 3 // 3-6 posts per poll
    const posts = await fetchLinkedInFeed(batchSize)

    store.addLog('info', 'POLL', `Retrieved ${posts.length} new posts from feed`)

    for (const post of posts) {
      if (!store.config.isRunning) break

      // Add post to store
      store.addPost(post)

      // Detect keywords
      const matches = detectKeywords(
        post.text,
        store.keywords,
        config.confidenceThreshold
      )

      if (matches.length === 0) {
        store.updatePost(post.id, { status: 'skipped' })
        continue
      }

      // Mark as matched
      const matchedPhrases = matches.map(m => m.matchedPhrase)
      const topMatch = matches[0]

      store.updatePost(post.id, {
        status: 'matched',
        matchedKeywords: matchedPhrases,
        confidence: topMatch.confidence,
      })

      store.addLog(
        'match',
        'MATCH',
        `Post ${post.urn} — keyword "${topMatch.matchedPhrase}" (confidence: ${(topMatch.confidence * 100).toFixed(0)}%)`
      )

      // Update keyword match count
      const kwIdx = store.keywords.findIndex(k => k.id === topMatch.keyword.id)
      if (kwIdx !== -1) store.keywords[kwIdx].matchCount++

      // Check daily limit
      if (store.stats.dailyUsed >= store.stats.dailyLimit) {
        store.addLog('warn', 'THROTTLE', `Daily comment limit reached (${store.stats.dailyLimit}). Skipping comment.`)
        continue
      }

      // Generate comment
      store.addLog('info', 'AI', `Generating comment for post ${post.urn}...`)

      let comment: string

      if (topMatch.keyword.useAI) {
        comment = await generateComment(post.text, topMatch.matchedPhrase, post.authorName)
      } else if (topMatch.keyword.commentTemplate) {
        comment = topMatch.keyword.commentTemplate
      } else {
        comment = await generateComment(post.text, topMatch.matchedPhrase, post.authorName)
      }

      // Simulate posting delay (anti-spam)
      const delay = Math.floor(
        Math.random() * (config.maxDelaySeconds - config.minDelaySeconds) + config.minDelaySeconds
      ) * 1000

      store.addLog('info', 'THROTTLE', `Queuing comment — waiting ${Math.round(delay / 1000)}s before posting`)

      await new Promise(r => setTimeout(r, Math.min(delay, 3000))) // cap at 3s for demo speed

      // In real mode, call Unipile API here
      // await postLinkedInComment(post.urn, comment, accountId, apiKey, dsn)

      // Mark as commented
      store.updatePost(post.id, {
        status: 'commented',
        commentPosted: comment,
        commentPostedAt: new Date().toISOString(),
      })

      store.addLog(
        'success',
        'POST',
        `Comment posted on ${post.urn} — "${comment.slice(0, 80)}..."`
      )

      // Small inter-post delay
      await new Promise(r => setTimeout(r, 800))
    }

    store.addLog(
      'info',
      'CYCLE',
      `Poll complete. ${posts.length} scanned, ${store.stats.matchesFound} total matched, ${store.stats.commentsPosted} total commented.`
    )
  } catch (err) {
    store.addLog('error', 'ERROR', `Pipeline error: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    isProcessing = false

    // Schedule next cycle if still running
    if (store.config.isRunning) {
      const interval = store.config.pollIntervalSeconds * 1000
      store.addLog('info', 'SCHED', `Next poll in ${store.config.pollIntervalSeconds}s`)
      pipelineTimer = setTimeout(runPollCycle, interval)
    }
  }
}

// ─── Pipeline Controls ──────────────────────────────────────────────────────

export function startPipeline() {
  if (store.config.isRunning) return
  store.config.isRunning = true
  store.stats.isRunning = true
  store.addLog('success', 'SYSTEM', 'Pipeline started. Monitoring LinkedIn feed...')
  store.broadcast({ type: 'pipeline_status', payload: { isRunning: true } })
  store.broadcastStats()
  runPollCycle()
}

export function stopPipeline() {
  if (!store.config.isRunning) return
  store.config.isRunning = false
  store.stats.isRunning = false
  if (pipelineTimer) {
    clearTimeout(pipelineTimer)
    pipelineTimer = null
  }
  store.addLog('warn', 'SYSTEM', 'Pipeline stopped.')
  store.broadcast({ type: 'pipeline_status', payload: { isRunning: false } })
  store.broadcastStats()
}

export function updateConfig(updates: Partial<typeof store.config>) {
  Object.assign(store.config, updates)
  store.addLog('info', 'CONFIG', `Configuration updated: ${JSON.stringify(updates)}`)
}
