"use client"

import { useState } from "react"
import { PatientSelector } from "@/components/patient-selector"
import { ChatInterface } from "@/components/chat-interface"
import { PatientDashboard } from "@/components/patient-dashboard"
import { TumorBoardWorkspace } from "@/components/board/TumorBoardWorkspace"
import { BoardModeProvider } from "@/components/board/BoardModeContext"
import { useUIStore } from "@/store/ui"
import { patients } from "@/lib/data"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0])
  const [activeTab, setActiveTab] = useState("CASE OVERVIEW")
  const { isBoardMode, setBoardMode } = useUIStore()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white/90">Nila Genomics v0.8.0</h1>
            {isBoardMode && (
              <span className="ml-2 px-2 py-1 bg-[#4a6bff] text-white text-xs rounded">
                BOARD MODE
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Persistent Board Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="board-mode-header" 
                checked={isBoardMode}
                onCheckedChange={setBoardMode}
              />
              <Label htmlFor="board-mode-header" className="text-sm text-white/70">
                Board Mode
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isBoardMode ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <span className="text-xs text-white/70">
                {isBoardMode ? 'Board Session Active' : 'Nila.dev.net'}
              </span>
            </div>
          </div>
        </div>

        {isBoardMode ? (
          <BoardModeProvider currentCase={selectedPatient}>
            <div className="bg-[#121225] rounded-lg overflow-hidden border border-white/10 h-[calc(100vh-120px)]">
              <TumorBoardWorkspace patient={selectedPatient} />
            </div>
          </BoardModeProvider>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
            <div className="lg:col-span-1 bg-[#121225] rounded-lg overflow-hidden border border-white/10 flex flex-col h-full">
              <PatientSelector
                patients={patients}
                selectedPatient={selectedPatient}
                onSelectPatient={setSelectedPatient}
              />
              <div className="flex-1 min-h-0">
                <ChatInterface patient={selectedPatient} onTabChange={setActiveTab} />
              </div>
            </div>

            <div className="lg:col-span-2 bg-[#121225] rounded-lg overflow-hidden border border-white/10">
              <PatientDashboard patient={selectedPatient} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
