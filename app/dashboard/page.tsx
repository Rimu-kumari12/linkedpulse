'use client'

import { useState, useCallback, useRef } from 'react'
import { useSSE } from '@/components/useSSE'
import NavBar from '@/components/NavBar'
import StatsCards from '@/components/StatsCards'
import PipelineControl from '@/components/PipelineControl'
import KeywordManager from '@/components/KeywordManager'
import PostFeed from '@/components/PostFeed'
import ActivityLogPanel from '@/components/ActivityLog'
import type {
  DashboardStats,
  PipelineConfig,
  Keyword,
  LinkedInPost,
  ActivityLog,
} from '@/types'

const DEFAULT_STATS: DashboardStats = {
  postsScanned: 0,
  matchesFound: 0,
  commentsPosted: 0,
  successRate: 0,
  lastPollAt: null,
  isRunning: false,
  dailyLimit: 50,
  dailyUsed: 0,
}

const DEFAULT_CONFIG: PipelineConfig = {
  isRunning: false,
  pollIntervalSeconds: 30,
  dailyCommentLimit: 50,
  minDelaySeconds: 15,
  maxDelaySeconds: 60,
  feedScope: 'network',
  confidenceThreshold: 0.65,
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS)
  const [config, setConfig] = useState<PipelineConfig>(DEFAULT_CONFIG)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [posts, setPosts] = useState<LinkedInPost[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const postsRef = useRef<LinkedInPost[]>([])

  // SSE handler
  const handleSSE = useCallback((type: string, payload: unknown) => {
    setIsConnected(true)

    switch (type) {
      case 'init': {
        const init = payload as { stats: DashboardStats; config: PipelineConfig; keywords: Keyword[]; posts: LinkedInPost[]; logs: ActivityLog[] }
        setStats(init.stats)
        setConfig(init.config)
        setKeywords(init.keywords)
        setPosts(init.posts)
        postsRef.current = init.posts
        setLogs(init.logs)
        break
      }
      case 'stats':
        setStats(payload as DashboardStats)
        break
      case 'pipeline_status': {
        const s = payload as { isRunning: boolean }
        setConfig(p => ({ ...p, isRunning: s.isRunning }))
        break
      }
      case 'new_post': {
        const post = payload as LinkedInPost
        postsRef.current = [post, ...postsRef.current].slice(0, 100)
        setPosts([...postsRef.current])
        break
      }
      case 'post_matched':
      case 'comment_posted': {
        const updated = payload as LinkedInPost
        postsRef.current = postsRef.current.map(p => p.id === updated.id ? updated : p)
        setPosts([...postsRef.current])
        break
      }
      case 'log': {
        const log = payload as ActivityLog
        setLogs(prev => [log, ...prev].slice(0, 200))
        break
      }
      case 'heartbeat':
        setIsConnected(true)
        break
    }
  }, [])

  useSSE(handleSSE)

  // Pipeline toggle
  const handleTogglePipeline = async () => {
    const action = config.isRunning ? 'stop' : 'start'
    await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
  }

  // Config update
  const handleConfigChange = async (updates: Partial<PipelineConfig>) => {
    setConfig(p => ({ ...p, ...updates }))
    await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_config', config: updates }),
    })
  }

  // Add keyword
  const handleAddKeyword = async (phrase: string, useAI: boolean, template?: string) => {
    const res = await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase, useAI, commentTemplate: template }),
    })
    const data = await res.json()
    if (data.success) {
      setKeywords(prev => [...prev, data.data])
    }
  }

  // Toggle keyword
  const handleToggleKeyword = async (id: string, active: boolean) => {
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, active } : k))
    await fetch('/api/keywords', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    })
  }

  // Delete keyword
  const handleDeleteKeyword = async (id: string) => {
    setKeywords(prev => prev.filter(k => k.id !== id))
    await fetch(`/api/keywords?id=${id}`, { method: 'DELETE' })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0d12' }}>
      <NavBar isRunning={config.isRunning} isConnected={isConnected} />

      <main className="flex-1 p-4 lg:p-6 space-y-4 max-w-screen-2xl mx-auto w-full">

        {/* Stats */}
        <StatsCards stats={stats} isRunning={config.isRunning} />

        {/* Pipeline Control */}
        <PipelineControl
          isRunning={config.isRunning}
          config={config}
          onToggle={handleTogglePipeline}
          onConfigChange={handleConfigChange}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ height: '520px' }}>
          {/* Keywords — 3 cols */}
          <div className="lg:col-span-3">
            <KeywordManager
              keywords={keywords}
              onAdd={handleAddKeyword}
              onToggle={handleToggleKeyword}
              onDelete={handleDeleteKeyword}
            />
          </div>

          {/* Post Feed — 5 cols */}
          <div className="lg:col-span-5">
            <PostFeed posts={posts} />
          </div>

          {/* Activity Log — 4 cols */}
          <div className="lg:col-span-4">
            <ActivityLogPanel logs={logs} />
          </div>
        </div>

        {/* Footer info */}
        <div
          className="flex items-center justify-between text-xs font-mono py-2"
          style={{ color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span>LinkedPulse v1.0 · Mock Mode Active · Claude Sonnet API</span>
          <span>
            {config.isRunning
              ? `⚡ Monitoring ${config.feedScope} feed every ${config.pollIntervalSeconds}s`
              : '⏸ Pipeline stopped'}
          </span>
        </div>
      </main>
    </div>
  )
}
