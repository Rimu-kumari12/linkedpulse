'use client'

import { useState } from 'react'
import type { PipelineConfig } from '@/types'

interface PipelineControlProps {
  isRunning: boolean
  config: PipelineConfig
  onToggle: () => void
  onConfigChange: (updates: Partial<PipelineConfig>) => void
}

export default function PipelineControl({
  isRunning,
  config,
  onToggle,
  onConfigChange,
}: PipelineControlProps) {
  const [showConfig, setShowConfig] = useState(false)
  const [localConfig, setLocalConfig] = useState(config)

  const handleSave = () => {
    onConfigChange(localConfig)
    setShowConfig(false)
  }

  return (
    <div className="glass rounded-sm p-4">
      {/* Status + Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: isRunning ? '#00c986' : 'rgba(255,255,255,0.2)' }}
            />
            {isRunning && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: '#00c986',
                  animation: 'pulse-ring 1.5s ease-out infinite',
                  opacity: 0.4,
                }}
              />
            )}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-sans)' }}>
              {isRunning ? 'Pipeline Running' : 'Pipeline Stopped'}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {isRunning
                ? `Polling every ${config.pollIntervalSeconds}s`
                : 'Click start to begin monitoring'}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-1.5 text-xs uppercase tracking-widest transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            ⚙ Config
          </button>
          <button
            onClick={onToggle}
            className="px-4 py-1.5 text-xs uppercase tracking-widest font-bold transition-all"
            style={{
              background: isRunning ? 'rgba(255,59,0,0.15)' : 'rgba(0,201,134,0.15)',
              border: `1px solid ${isRunning ? 'rgba(255,59,0,0.4)' : 'rgba(0,201,134,0.4)'}`,
              color: isRunning ? '#ff3b00' : '#00c986',
            }}
          >
            {isRunning ? '⏹ Stop' : '▶ Start'}
          </button>
        </div>
      </div>

      {/* Pipeline Steps Indicator */}
      <div className="flex items-center gap-1">
        {['OAuth', 'Poll Feed', 'Detect', 'AI Comment', 'Post'].map((step, i) => (
          <div key={step} className="flex items-center gap-1 flex-1">
            <div
              className="flex-1 py-1 px-2 text-center text-xs uppercase tracking-wider rounded-sm"
              style={{
                background: isRunning ? `rgba(0,85,255,${0.1 + i * 0.04})` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isRunning ? 'rgba(0,85,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: isRunning ? '#6b9fff' : 'rgba(255,255,255,0.25)',
                fontSize: '0.6rem',
              }}
            >
              {step}
            </div>
            {i < 4 && (
              <div className="text-xs" style={{ color: isRunning ? '#0055ff' : 'rgba(255,255,255,0.1)' }}>
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-10 animate-fadeUp">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="block">
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Poll Interval (sec)
              </div>
              <input
                type="number"
                value={localConfig.pollIntervalSeconds}
                onChange={e => setLocalConfig(p => ({ ...p, pollIntervalSeconds: +e.target.value }))}
                className="w-full px-3 py-2 text-sm font-mono"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                }}
                min={10}
                max={3600}
              />
            </label>
            <label className="block">
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Daily Limit
              </div>
              <input
                type="number"
                value={localConfig.dailyCommentLimit}
                onChange={e => setLocalConfig(p => ({ ...p, dailyCommentLimit: +e.target.value }))}
                className="w-full px-3 py-2 text-sm font-mono"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                }}
                min={1}
                max={200}
              />
            </label>
            <label className="block">
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Confidence Threshold
              </div>
              <input
                type="number"
                value={localConfig.confidenceThreshold}
                onChange={e => setLocalConfig(p => ({ ...p, confidenceThreshold: +e.target.value }))}
                className="w-full px-3 py-2 text-sm font-mono"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                }}
                min={0.1}
                max={1}
                step={0.05}
              />
            </label>
            <label className="block">
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Feed Scope
              </div>
              <select
                value={localConfig.feedScope}
                onChange={e => setLocalConfig(p => ({ ...p, feedScope: e.target.value as PipelineConfig['feedScope'] }))}
                className="w-full px-3 py-2 text-sm font-mono"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                }}
              >
                <option value="network" style={{ background: '#1a1a2e' }}>Network</option>
                <option value="personal" style={{ background: '#1a1a2e' }}>Personal</option>
                <option value="all" style={{ background: '#1a1a2e' }}>All Feeds</option>
              </select>
            </label>
          </div>
          <button
            onClick={handleSave}
            className="w-full py-2 text-xs uppercase tracking-widest font-bold"
            style={{
              background: 'rgba(0,85,255,0.2)',
              border: '1px solid rgba(0,85,255,0.4)',
              color: '#6b9fff',
            }}
          >
            Save Configuration
          </button>
        </div>
      )}
    </div>
  )
}
