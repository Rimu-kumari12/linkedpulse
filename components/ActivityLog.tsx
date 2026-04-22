'use client'

import { useRef, useEffect } from 'react'
import type { ActivityLog } from '@/types'

const TYPE_STYLES: Record<ActivityLog['type'], { color: string; label: string }> = {
  info:    { color: '#6b9fff', label: 'INFO   ' },
  success: { color: '#00c986', label: 'OK     ' },
  match:   { color: '#ffb800', label: 'MATCH  ' },
  warn:    { color: '#ffb800', label: 'WARN   ' },
  error:   { color: '#ff3b00', label: 'ERROR  ' },
}

interface ActivityLogProps {
  logs: ActivityLog[]
}

export default function ActivityLogPanel({ logs }: ActivityLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const userScrolled = useRef(false)

  useEffect(() => {
    if (!userScrolled.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  return (
    <div className="glass rounded-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-sm font-bold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,255,255,0.7)' }}
        >
          Activity Log
        </h2>
        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {logs.length} entries
        </span>
      </div>

      {/* Terminal-style log */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-xs"
        style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '2px' }}
        onScroll={() => {
          if (!containerRef.current) return
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current
          userScrolled.current = scrollHeight - scrollTop - clientHeight > 40
        }}
      >
        {logs.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.2)' }}>
            {'>'} Waiting for pipeline to start...
          </div>
        )}
        {[...logs].reverse().map((log, i) => {
          const ts = new Date(log.timestamp)
          const timeStr = ts.toLocaleTimeString('en-US', { hour12: false })
          const cfg = TYPE_STYLES[log.type]
          return (
            <div
              key={log.id}
              className="flex gap-3 mb-0.5 leading-relaxed hover:bg-white hover:bg-opacity-5 px-1 rounded-sm"
              style={{ animation: i === 0 ? 'slideIn 0.25s ease forwards' : 'none' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{timeStr}</span>
              <span style={{ color: cfg.color, flexShrink: 0, minWidth: '52px' }}>{log.category}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{log.message}</span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
