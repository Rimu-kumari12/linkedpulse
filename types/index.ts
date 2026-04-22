// ─── Core Data Types ───────────────────────────────────────────────────────

export interface Keyword {
  id: string
  phrase: string
  active: boolean
  commentTemplate?: string
  useAI: boolean
  matchCount: number
  createdAt: string
}

export interface LinkedInPost {
  id: string
  urn: string
  authorName: string
  authorTitle: string
  authorInitials: string
  authorColor: string
  text: string
  postedAt: string
  matchedKeywords: string[]
  status: 'pending' | 'matched' | 'commented' | 'skipped' | 'error'
  commentPosted?: string
  commentPostedAt?: string
  confidence?: number
}

export interface ActivityLog {
  id: string
  timestamp: string
  type: 'info' | 'success' | 'warn' | 'error' | 'match'
  category: string
  message: string
}

export interface DashboardStats {
  postsScanned: number
  matchesFound: number
  commentsPosted: number
  successRate: number
  lastPollAt: string | null
  isRunning: boolean
  dailyLimit: number
  dailyUsed: number
}

export interface PipelineConfig {
  isRunning: boolean
  pollIntervalSeconds: number
  dailyCommentLimit: number
  minDelaySeconds: number
  maxDelaySeconds: number
  feedScope: 'network' | 'personal' | 'all'
  confidenceThreshold: number
}

export interface AppState {
  keywords: Keyword[]
  posts: LinkedInPost[]
  logs: ActivityLog[]
  stats: DashboardStats
  config: PipelineConfig
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// ─── SSE Event Types ────────────────────────────────────────────────────────

export type SSEEventType =
  | 'stats'
  | 'new_post'
  | 'post_matched'
  | 'comment_posted'
  | 'log'
  | 'pipeline_status'
  | 'heartbeat'

export interface SSEEvent {
  type: SSEEventType
  payload: unknown
}
