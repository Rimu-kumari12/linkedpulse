import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  let posts = [...store.posts]

  if (status) {
    posts = posts.filter(p => p.status === status)
  }

  return NextResponse.json({
    success: true,
    data: posts.slice(0, limit),
    total: store.posts.length,
  })
}
