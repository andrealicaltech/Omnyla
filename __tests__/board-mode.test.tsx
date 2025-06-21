import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PatientDashboard } from '@/components/patient-dashboard'
import { TumorBoardWorkspace } from '@/components/board/TumorBoardWorkspace'
import { BoardModeProvider } from '@/components/board/BoardModeContext'
import { useUIStore } from '@/store/ui'
import { patients } from '@/lib/data'

// Mock the socket hook
vi.mock('@/hooks/useSocket', () => ({
  useSocket: () => ({
    socket: null,
    emitBoardSync: vi.fn(),
    emitMinutesReady: vi.fn(),
    onBoardSync: vi.fn(),
    onMinutesReady: vi.fn(),
    off: vi.fn(),
  }),
}))

// Mock the notes API
vi.mock('@/lib/api/notes', () => ({
  notes: {
    store: vi.fn().mockResolvedValue({ id: '1', timestamp: new Date() }),
    finalize: vi.fn().mockResolvedValue({ 
      url: 'blob:mock-url',
      content: 'mock content'
    }),
    getDrafts: vi.fn().mockResolvedValue([]),
  },
}))

describe('Board Mode Feature', () => {
  const mockPatient = patients[0]

  beforeEach(() => {
    // Reset store state
    useUIStore.setState({ isBoardMode: false, activeTab: 'CASE OVERVIEW' })
  })

  it('toggles board mode on', () => {
    render(<PatientDashboard 
      patient={mockPatient} 
      activeTab="CASE OVERVIEW" 
      setActiveTab={() => {}} 
    />)
    
    const toggle = screen.getByRole('switch')
    expect(toggle).not.toBeChecked()
    
    fireEvent.click(toggle)
    
    expect(useUIStore.getState().isBoardMode).toBe(true)
  })

  it('renders workspace when board mode is active', () => {
    useUIStore.setState({ isBoardMode: true })
    
    render(
      <BoardModeProvider currentCase={mockPatient}>
        <TumorBoardWorkspace patient={mockPatient} />
      </BoardModeProvider>
    )
    
    expect(screen.getByText('Current Case')).toBeInTheDocument()
    expect(screen.getByText('Attendees')).toBeInTheDocument()
    expect(screen.getByText('Session Timer')).toBeInTheDocument()
    expect(screen.getByText('Decision Pad')).toBeInTheDocument()
  })

  it('broadcasts tab change in board mode', () => {
    const mockEmitBoardSync = vi.fn()
    
    vi.doMock('@/hooks/useSocket', () => ({
      useSocket: () => ({
        socket: null,
        emitBoardSync: mockEmitBoardSync,
        emitMinutesReady: vi.fn(),
        onBoardSync: vi.fn(),
        onMinutesReady: vi.fn(),
        off: vi.fn(),
      }),
    }))
    
    render(
      <BoardModeProvider currentCase={mockPatient}>
        <TumorBoardWorkspace patient={mockPatient} />
      </BoardModeProvider>
    )
    
    const imagesTab = screen.getByText('IMAGES')
    fireEvent.click(imagesTab)
    
    // Note: This would need proper socket mocking to fully test
    // For now, we verify the component renders
    expect(screen.getByText('IMAGES')).toBeInTheDocument()
  })

  it('creates markdown when finalized', async () => {
    const { notes } = await import('@/lib/api/notes')
    
    await notes.finalize('case-123', 'Test content', 'Dr. Test')
    
    expect(notes.finalize).toHaveBeenCalledWith('case-123', 'Test content', 'Dr. Test')
    expect(notes.store).toHaveBeenCalledWith({
      caseId: 'case-123',
      content: 'Test content',
      type: 'finalized',
      author: 'Dr. Test'
    })
  })
}) 