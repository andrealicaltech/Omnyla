"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useUIStore } from '@/store/ui'
import type { Patient } from '@/lib/types'

interface BoardModeContextType {
  currentCase: Patient | null
  attendees: string[]
  sessionTimer: number
  updateSessionTimer: (seconds: number) => void
  emitTabChange: (tab: string) => void
  emitPadUpdate: (content: string) => void
}

const BoardModeContext = createContext<BoardModeContextType | null>(null)

interface BoardModeProviderProps {
  children: ReactNode
  currentCase: Patient | null
}

export function BoardModeProvider({ children, currentCase }: BoardModeProviderProps) {
  const { emitBoardSync, onBoardSync, off } = useSocket()
  const { setActiveTab } = useUIStore()
  const [sessionTimer, setSessionTimer] = useState(0)

  // Mock attendees for demo
  const attendees = ['Dr. Smith', 'Dr. Johnson', 'Dr. Wilson']
  
  const updateSessionTimer = (seconds: number) => {
    setSessionTimer(seconds)
  }

  const emitTabChange = (tab: string) => {
    if (currentCase) {
      emitBoardSync({
        caseId: currentCase.id,
        action: 'TAB_CHANGE',
        data: { tab }
      })
    }
  }

  const emitPadUpdate = (content: string) => {
    if (currentCase) {
      emitBoardSync({
        caseId: currentCase.id,
        action: 'PAD_UPDATE',
        data: { content }
      })
    }
  }

  useEffect(() => {
    const handleBoardSync = (payload: any) => {
      if (payload.caseId === currentCase?.id) {
        switch (payload.action) {
          case 'TAB_CHANGE':
            setActiveTab(payload.data.tab)
            break
          case 'PAD_UPDATE':
            // Handle pad updates from other users
            break
          case 'SCROLL':
            // Handle scroll sync
            break
        }
      }
    }

    onBoardSync(handleBoardSync)

    return () => {
      off('board-sync', handleBoardSync)
    }
  }, [currentCase, onBoardSync, off, setActiveTab])

  const value: BoardModeContextType = {
    currentCase,
    attendees,
    sessionTimer,
    updateSessionTimer,
    emitTabChange,
    emitPadUpdate
  }

  return (
    <BoardModeContext.Provider value={value}>
      {children}
    </BoardModeContext.Provider>
  )
}

export function useBoardMode() {
  const context = useContext(BoardModeContext)
  if (!context) {
    throw new Error('useBoardMode must be used within a BoardModeProvider')
  }
  return context
} 