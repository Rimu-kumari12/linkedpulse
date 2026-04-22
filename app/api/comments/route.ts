import { NextRequest, NextResponse } from 'next/server'
import { generateComment } from '@/lib/claude'
import { store } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { postId, keyword, preview } = body

  const post = store.posts.find(p => p.id === postId)
  if (!post) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  }

  try {
    const comment = await generateComment(post.text, keyword ?? 'linkedin', post.authorName)

    if (!preview) {
      store.updatePost(postId, {
        status: 'commented',
        commentPosted: comment,
        commentPostedAt: new Date().toISOString(),
      })
      store.addLog('success', 'MANUAL', `Manual comment posted on ${post.urn}`)
    }

    return NextResponse.json({ success: true, data: { comment } })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
