import { v4 as uuidv4 } from 'uuid'
import type {
  Keyword,
  LinkedInPost,
  ActivityLog,
  DashboardStats,
  PipelineConfig,
} from '@/types'

// ─── In-Memory Store (replaces a DB for demo) ──────────────────────────────

class AppStore {
  keywords: Keyword[] = [
    {
      id: uuidv4(),
      phrase: 'i am hiring',
      active: true,
      useAI: true,
      matchCount: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      phrase: 'looking for developer',
      active: true,
      useAI: true,
      matchCount: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      phrase: 'open to work',
      active: true,
      useAI: false,
      commentTemplate: "Great that you're putting yourself out there! What kind of roles are you targeting?",
      matchCount: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      phrase: 'we are recruiting',
      active: true,
      useAI: true,
      matchCount: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      phrase: 'job opening',
      active: false,
      useAI: false,
      commentTemplate: 'Interesting opportunity! Can you share more details about the role?',
      matchCount: 0,
      createdAt: new Date().toISOString(),
    },
  ]

  posts: LinkedInPost[] = []

  logs: ActivityLog[] = [
    {
      id: uuidv4(),
      timestamp: new Date(Date.now() - 120000).toISOString(),
      type: 'info',
      category: 'SYSTEM',
      message: 'LinkedPulse initialized. Mock mode active.',
    },
    {
      id: uuidv4(),
      timestamp: new Date(Date.now() - 90000).toISOString(),
      type: 'info',
      category: 'CONFIG',
      message: '5 keywords loaded. 4 active, 1 inactive.',
    },
  ]

  stats: DashboardStats = {
    postsScanned: 0,
    matchesFound: 0,
    commentsPosted: 0,
    successRate: 0,
    lastPollAt: null,
    isRunning: false,
    dailyLimit: 50,
    dailyUsed: 0,
  }

  config: PipelineConfig = {
    isRunning: false,
    pollIntervalSeconds: 30,
    dailyCommentLimit: 50,
    minDelaySeconds: 15,
    maxDelaySeconds: 60,
    feedScope: 'network',
    confidenceThreshold: 0.65,
  }

  // SSE subscribers
  private subscribers: Set<ReadableStreamDefaultController> = new Set()

  addLog(type: ActivityLog['type'], category: string, message: string) {
    const log: ActivityLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type,
      category,
      message,
    }
    this.logs.unshift(log)
    if (this.logs.length > 200) this.logs = this.logs.slice(0, 200)
    this.broadcast({ type: 'log', payload: log })
    return log
  }

  addPost(post: LinkedInPost) {
    this.posts.unshift(post)
    if (this.posts.length > 100) this.posts = this.posts.slice(0, 100)
    this.stats.postsScanned++
    this.broadcast({ type: 'new_post', payload: post })
    this.broadcastStats()
  }

  updatePost(id: string, updates: Partial<LinkedInPost>) {
    const idx = this.posts.findIndex(p => p.id === id)
    if (idx !== -1) {
      this.posts[idx] = { ...this.posts[idx], ...updates }
      if (updates.status === 'matched') {
        this.stats.matchesFound++
        this.broadcast({ type: 'post_matched', payload: this.posts[idx] })
      }
      if (updates.status === 'commented') {
        this.stats.commentsPosted++
        this.stats.dailyUsed++
        this.updateSuccessRate()
        this.broadcast({ type: 'comment_posted', payload: this.posts[idx] })
      }
      this.broadcastStats()
    }
  }

  updateSuccessRate() {
    if (this.stats.matchesFound > 0) {
      this.stats.successRate = Math.round(
        (this.stats.commentsPosted / this.stats.matchesFound) * 100
      )
    }
  }

  broadcastStats() {
    this.broadcast({ type: 'stats', payload: this.stats })
  }

  broadcast(event: { type: string; payload: unknown }) {
    const data = `data: ${JSON.stringify(event)}\n\n`
    for (const ctrl of this.subscribers) {
      try {
        ctrl.enqueue(new TextEncoder().encode(data))
      } catch {
        this.subscribers.delete(ctrl)
      }
    }
  }

  subscribe(controller: ReadableStreamDefaultController) {
    this.subscribers.add(controller)
    // Send current state immediately
    const init = `data: ${JSON.stringify({ type: 'init', payload: {
      stats: this.stats,
      config: this.config,
      keywords: this.keywords,
      posts: this.posts.slice(0, 20),
      logs: this.logs.slice(0, 50),
    }})}\n\n`
    controller.enqueue(new TextEncoder().encode(init))
  }

  unsubscribe(controller: ReadableStreamDefaultController) {
    this.subscribers.delete(controller)
  }
}

// Singleton
const globalStore = global as typeof global & { __store?: AppStore }
if (!globalStore.__store) {
  globalStore.__store = new AppStore()
}

export const store = globalStore.__store
