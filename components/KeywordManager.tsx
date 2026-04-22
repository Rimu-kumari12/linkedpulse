'use client'

import { useState } from 'react'
import type { Keyword } from '@/types'

interface KeywordManagerProps {
  keywords: Keyword[]
  onAdd: (phrase: string, useAI: boolean, template?: string) => void
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
}

export default function KeywordManager({
  keywords,
  onAdd,
  onToggle,
  onDelete,
}: KeywordManagerProps) {
  const [phrase, setPhrase] = useState('')
  const [useAI, setUseAI] = useState(true)
  const [template, setTemplate] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = () => {
    if (!phrase.trim()) { setError('Enter a keyword or phrase'); return }
    if (phrase.trim().length < 2) { setError('Keyword too short'); return }
    setError('')
    onAdd(phrase.trim(), useAI, template || undefined)
    setPhrase('')
    setTemplate('')
    setUseAI(true)
    setShowAdvanced(false)
  }

  return (
    <div className="glass rounded-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-sm font-bold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,255,255,0.7)' }}
        >
          Keywords
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-sm"
          style={{ background: 'rgba(0,85,255,0.15)', color: '#6b9fff', border: '1px solid rgba(0,85,255,0.3)' }}
        >
          {keywords.filter(k => k.active).length} active
        </span>
      </div>

      {/* Add form */}
      <div className="mb-4">
        <div className="flex gap-2 mb-1">
          <input
            value={phrase}
            onChange={e => setPhrase(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add keyword or phrase..."
            className="flex-1 px-3 py-2 text-xs font-mono"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${error ? 'rgba(255,59,0,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: 'white',
              outline: 'none',
            }}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
            style={{
              background: 'rgba(0,85,255,0.2)',
              border: '1px solid rgba(0,85,255,0.4)',
              color: '#6b9fff',
            }}
          >
            + Add
          </button>
        </div>
        {error && <div className="text-xs" style={{ color: '#ff3b00' }}>{error}</div>}

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs mt-1 transition-colors"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {showAdvanced ? '↑ Hide' : '↓ Advanced options'}
        </button>

        {showAdvanced && (
          <div className="mt-2 animate-fadeUp space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setUseAI(!useAI)}
                className="w-8 h-4 rounded-full relative transition-colors"
                style={{ background: useAI ? 'rgba(0,201,134,0.4)' : 'rgba(255,255,255,0.1)', border: `1px solid ${useAI ? 'rgba(0,201,134,0.6)' : 'rgba(255,255,255,0.15)'}` }}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                  style={{ background: useAI ? '#00c986' : 'rgba(255,255,255,0.3)', left: useAI ? '16px' : '2px' }}
                />
              </div>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {useAI ? 'AI-generated comments' : 'Use template below'}
              </span>
            </label>
            {!useAI && (
              <textarea
                value={template}
                onChange={e => setTemplate(e.target.value)}
                placeholder="Comment template for this keyword..."
                rows={2}
                className="w-full px-3 py-2 text-xs font-mono resize-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Keyword list */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {keywords.length === 0 && (
          <div className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            No keywords yet. Add one above.
          </div>
        )}
        {keywords.map(kw => (
          <div
            key={kw.id}
            className="flex items-center gap-2 px-3 py-2 rounded-sm transition-all animate-slideIn"
            style={{
              background: kw.active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${kw.active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
              opacity: kw.active ? 1 : 0.5,
            }}
          >
            {/* Toggle */}
            <button
              onClick={() => onToggle(kw.id, !kw.active)}
              className="w-2 h-2 rounded-full flex-shrink-0 transition-colors"
              style={{ background: kw.active ? '#00c986' : 'rgba(255,255,255,0.2)' }}
              title={kw.active ? 'Disable' : 'Enable'}
            />

            {/* Phrase */}
            <span className="flex-1 text-xs font-mono truncate" style={{ color: kw.active ? 'white' : 'rgba(255,255,255,0.4)' }}>
              "{kw.phrase}"
            </span>

            {/* AI badge */}
            {kw.useAI && (
              <span className="text-xs px-1.5 py-0.5" style={{ background: 'rgba(0,201,134,0.1)', color: '#00c986', border: '1px solid rgba(0,201,134,0.2)', fontSize: '0.55rem' }}>
                AI
              </span>
            )}

            {/* Match count */}
            {kw.matchCount > 0 && (
              <span className="text-xs font-mono" style={{ color: '#ffb800' }}>
                {kw.matchCount}×
              </span>
            )}

            {/* Delete */}
            <button
              onClick={() => onDelete(kw.id)}
              className="text-xs transition-colors flex-shrink-0"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ff3b00')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
