'use client'

import { useEffect, useRef } from 'react'
import type { DashboardStats } from '@/types'

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(0)

  useEffect(() => {
    if (!ref.current) return
    const start = prev.current
    const end = value
    prev.current = value
    if (start === end) return

    const dur = 600
    const startTime = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      if (ref.current) ref.current.textContent = String(Math.floor(start + (end - start) * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return <span ref={ref}>{value}</span>
}

interface StatsCardsProps {
  stats: DashboardStats
  isRunning: boolean
}

export default function StatsCards({ stats, isRunning }: StatsCardsProps) {
  const dailyPct = stats.dailyLimit > 0 ? (stats.dailyUsed / stats.dailyLimit) * 100 : 0

  const cards = [
    {
      label: 'Posts Scanned',
      value: stats.postsScanned,
      icon: '📡',
      color: '#6b9fff',
      suffix: '',
    },
    {
      label: 'Matches Found',
      value: stats.matchesFound,
      icon: '🎯',
      color: '#ffb800',
      suffix: '',
    },
    {
      label: 'Comments Posted',
      value: stats.commentsPosted,
      icon: '✅',
      color: '#00c986',
      suffix: '',
    },
    {
      label: 'Success Rate',
      value: stats.successRate,
      icon: '📊',
      color: '#c084fc',
      suffix: '%',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="glass rounded-sm p-4 relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <span className="text-lg">{card.icon}</span>
            <span
              className="text-xs font-mono uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {isRunning && card.label === 'Posts Scanned' ? (
                <span className="animate-blink">LIVE</span>
              ) : null}
            </span>
          </div>
          <div
            className="stat-number text-3xl mb-1"
            style={{ color: card.color }}
          >
            <AnimatedNumber value={card.value} />
            {card.suffix}
          </div>
          <div className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {card.label}
          </div>

          {/* Accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, ${card.color}40, transparent)` }}
          />
        </div>
      ))}

      {/* Daily Usage Bar */}
      <div className="glass rounded-sm p-4 col-span-2 lg:col-span-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Daily Comment Usage
          </span>
          <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {stats.dailyUsed} / {stats.dailyLimit}
          </span>
        </div>
        <div className="progress-bar rounded-full">
          <div
            className={`progress-fill rounded-full ${isRunning ? 'progress-shimmer' : ''}`}
            style={{ width: `${dailyPct}%` }}
          />
        </div>
        {stats.lastPollAt && (
          <div className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Last poll: {new Date(stats.lastPollAt).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
