'use client'

interface NavBarProps {
  isRunning: boolean
  isConnected: boolean
}

export default function NavBar({ isRunning, isConnected }: NavBarProps) {
  return (
    <nav
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: 'rgba(13,13,18,0.95)',
        borderColor: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-2.5 h-2.5 flex-shrink-0">
          <div
            className="w-2.5 h-2.5 rounded-full animate-blink"
            style={{ background: isRunning ? '#00c986' : '#0055ff' }}
          />
        </div>
        <span
          className="font-bold text-base tracking-tight"
          style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.03em' }}
        >
          LinkedPulse
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-sm"
          style={{ background: 'rgba(0,85,255,0.15)', color: '#6b9fff', border: '1px solid rgba(0,85,255,0.25)', fontSize: '0.6rem', letterSpacing: '0.08em' }}
        >
          DASHBOARD
        </span>
      </div>

      {/* Center — pipeline status */}
      <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <span>Mock Mode: <span style={{ color: '#ffb800' }}>ON</span></span>
        <span>Claude API: <span style={{ color: '#00c986' }}>Ready</span></span>
        <span>Unipile: <span style={{ color: '#ffb800' }}>Mock</span></span>
      </div>

      {/* Right — connection indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs" style={{ color: isConnected ? '#00c986' : '#ff3b00' }}>
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isConnected ? '#00c986' : '#ff3b00', animation: isConnected ? 'blink 2s infinite' : 'none' }}
          />
          {isConnected ? 'Live' : 'Reconnecting...'}
        </div>

        <button
          className="text-xs px-3 py-1.5 uppercase tracking-widest transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
          }}
          onClick={() => window.open('https://docs.unipile.com', '_blank')}
        >
          API Docs ↗
        </button>
      </div>
    </nav>
  )
}
