'use client'

import { useState } from 'react'
import type { LinkedInPost } from '@/types'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.05)' },
  matched: { label: 'Matched', color: '#ffb800', bg: 'rgba(255,184,0,0.1)' },
  commented: { label: 'Commented', color: '#00c986', bg: 'rgba(0,201,134,0.1)' },
  skipped: { label: 'Skipped', color: 'rgba(255,255,255,0.2)', bg: 'rgba(255,255,255,0.03)' },
  error: { label: 'Error', color: '#ff3b00', bg: 'rgba(255,59,0,0.1)' },
}

interface PostFeedProps {
  posts: LinkedInPost[]
}

function PostCard({ post }: { post: LinkedInPost }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[post.status]
  const isInteresting = post.status === 'matched' || post.status === 'commented'

  return (
    <div
      className="rounded-sm mb-2 cursor-pointer transition-all animate-fadeUp"
      style={{
        background: isInteresting ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${isInteresting ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ background: post.authorColor, fontFamily: 'var(--font-sans)' }}
          >
            {post.authorInitials}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                {post.authorName}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-sm flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.color, fontSize: '0.58rem', border: `1px solid ${cfg.color}30` }}
              >
                {cfg.label}
              </span>
            </div>
            <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
              {post.authorTitle}
            </div>
            <div
              className="text-xs leading-relaxed"
              style={{
                color: 'rgba(255,255,255,0.55)',
                display: expanded ? 'block' : '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.matchedKeywords.length > 0
                ? highlightText(post.text, post.matchedKeywords)
                : post.text}
            </div>
          </div>

          {/* Confidence badge */}
          {post.confidence && (
            <div
              className="flex-shrink-0 text-xs text-center"
              style={{ color: '#ffb800', fontSize: '0.6rem' }}
            >
              {Math.round(post.confidence * 100)}%
            </div>
          )}
        </div>

        {/* Matched keywords */}
        {post.matchedKeywords.length > 0 && (
          <div className="flex gap-1 mt-2 ml-11">
            {post.matchedKeywords.map(kw => (
              <span
                key={kw}
                className="text-xs px-2 py-0.5"
                style={{ background: 'rgba(255,184,0,0.1)', color: '#ffb800', border: '1px solid rgba(255,184,0,0.25)', fontSize: '0.58rem' }}
              >
                "{kw}"
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Comment preview */}
      {post.commentPosted && expanded && (
        <div
          className="mx-3 mb-3 p-3 rounded-sm animate-fadeUp"
          style={{ background: 'rgba(0,201,134,0.06)', border: '1px solid rgba(0,201,134,0.2)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: '#00c986', fontSize: '0.6rem' }}>✦</span>
            <span className="text-xs uppercase tracking-widest" style={{ color: '#00c986', fontSize: '0.58rem' }}>
              AI Comment Posted
            </span>
            {post.commentPostedAt && (
              <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.58rem' }}>
                {new Date(post.commentPostedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            "{post.commentPosted}"
          </div>
        </div>
      )}

      {/* URN */}
      <div
        className="px-3 pb-2 text-xs font-mono truncate"
        style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.58rem' }}
      >
        {post.urn} · {new Date(post.postedAt).toLocaleTimeString()}
      </div>
    </div>
  )
}

function highlightText(text: string, keywords: string[]) {
  if (!keywords.length) return <>{text}</>
  const parts = text.split(new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        keywords.some(k => k.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} style={{ background: 'rgba(255,184,0,0.2)', color: '#ffb800', borderRadius: '2px', padding: '0 2px' }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

type FilterType = 'all' | 'matched' | 'commented' | 'skipped'

export default function PostFeed({ posts }: PostFeedProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)
  const tabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: `All (${posts.length})` },
    { key: 'matched', label: `Matched (${posts.filter(p => p.status === 'matched').length})` },
    { key: 'commented', label: `Commented (${posts.filter(p => p.status === 'commented').length})` },
    { key: 'skipped', label: `Skipped (${posts.filter(p => p.status === 'skipped').length})` },
  ]

  return (
    <div className="glass rounded-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,255,255,0.7)' }}>
          Post Feed
        </h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-4 mb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`text-xs pb-2 uppercase tracking-widest transition-colors ${filter === t.key ? 'tab-active' : 'tab-inactive'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {posts.length === 0 ? 'Start the pipeline to begin scanning posts.' : 'No posts match this filter.'}
          </div>
        ) : (
          filtered.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
