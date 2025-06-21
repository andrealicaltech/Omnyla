import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface BoardSyncPayload {
  caseId: string
  action: 'TAB_CHANGE' | 'PAD_UPDATE' | 'SCROLL'
  data: any
}

interface MinutesReadyPayload {
  caseId: string
  url: string
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('/ws', {
      transports: ['websocket']
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const emitBoardSync = (payload: BoardSyncPayload) => {
    if (socketRef.current) {
      socketRef.current.emit('board-sync', payload)
    }
  }

  const emitMinutesReady = (payload: MinutesReadyPayload) => {
    if (socketRef.current) {
      socketRef.current.emit('minutes-ready', payload)
    }
  }

  const onBoardSync = (callback: (payload: BoardSyncPayload) => void) => {
    if (socketRef.current) {
      socketRef.current.on('board-sync', callback)
    }
  }

  const onMinutesReady = (callback: (payload: MinutesReadyPayload) => void) => {
    if (socketRef.current) {
      socketRef.current.on('minutes-ready', callback)
    }
  }

  const off = (event: string, callback?: Function) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback as any)
    }
  }

  return {
    socket: socketRef.current,
    emitBoardSync,
    emitMinutesReady,
    onBoardSync,
    onMinutesReady,
    off
  }
} 