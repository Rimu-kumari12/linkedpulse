import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { startPipeline, stopPipeline, updateConfig } from '@/lib/pipeline'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      isRunning: store.config.isRunning,
      config: store.config,
      stats: store.stats,
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, config } = body

  switch (action) {
    case 'start':
      startPipeline()
      return NextResponse.json({ success: true, data: { isRunning: true } })

    case 'stop':
      stopPipeline()
      return NextResponse.json({ success: true, data: { isRunning: false } })

    case 'update_config':
      if (config) updateConfig(config)
      return NextResponse.json({ success: true, data: store.config })

    default:
      return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  }
}
