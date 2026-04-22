'use client'

import { useEffect, useRef, useCallback } from 'react'

type SSEHandler = (type: string, payload: unknown) => void

export function useSSE(handler: SSEHandler) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  const esRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close()

    const es = new EventSource('/api/stream')
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const { type, payload } = JSON.parse(e.data)
        handlerRef.current(type, payload)
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
      // Reconnect after 3s
      setTimeout(connect, 3000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => esRef.current?.close()
  }, [connect])
}
