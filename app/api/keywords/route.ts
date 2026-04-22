import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import type { Keyword } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ success: true, data: store.keywords })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phrase, useAI, commentTemplate } = body

  if (!phrase?.trim()) {
    return NextResponse.json({ success: false, error: 'Phrase is required' }, { status: 400 })
  }

  // Check for duplicates
  const exists = store.keywords.find(
    k => k.phrase.toLowerCase() === phrase.toLowerCase().trim()
  )
  if (exists) {
    return NextResponse.json({ success: false, error: 'Keyword already exists' }, { status: 409 })
  }

  const keyword: Keyword = {
    id: uuidv4(),
    phrase: phrase.trim().toLowerCase(),
    active: true,
    useAI: useAI ?? true,
    commentTemplate: commentTemplate || undefined,
    matchCount: 0,
    createdAt: new Date().toISOString(),
  }

  store.keywords.push(keyword)
  store.addLog('info', 'KEYWORDS', `Keyword added: "${keyword.phrase}"`)
  store.broadcast({ type: 'stats', payload: store.stats })

  return NextResponse.json({ success: true, data: keyword })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body

  const idx = store.keywords.findIndex(k => k.id === id)
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Keyword not found' }, { status: 404 })
  }

  store.keywords[idx] = { ...store.keywords[idx], ...updates }
  store.addLog('info', 'KEYWORDS', `Keyword updated: "${store.keywords[idx].phrase}"`)

  return NextResponse.json({ success: true, data: store.keywords[idx] })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
  }

  const idx = store.keywords.findIndex(k => k.id === id)
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Keyword not found' }, { status: 404 })
  }

  const [removed] = store.keywords.splice(idx, 1)
  store.addLog('warn', 'KEYWORDS', `Keyword removed: "${removed.phrase}"`)

  return NextResponse.json({ success: true })
}
