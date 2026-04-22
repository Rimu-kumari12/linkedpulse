import { store } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  let controller: ReadableStreamDefaultController

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl
      store.subscribe(controller)

      // Heartbeat every 15s
      const heartbeat = setInterval(() => {
        try {
          ctrl.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ type: 'heartbeat', payload: { ts: Date.now() } })}\n\n`)
          )
        } catch {
          clearInterval(heartbeat)
        }
      }, 15000)

      // Cleanup when client disconnects
      return () => {
        clearInterval(heartbeat)
        store.unsubscribe(controller)
      }
    },
    cancel() {
      store.unsubscribe(controller)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
