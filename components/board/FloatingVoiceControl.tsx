"use client"

import { useState } from "react"
import { Mic, Square, ChevronDown, ChevronUp, Sparkles, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from 'react-markdown'

interface FloatingVoiceControlProps {
  isRecording: boolean
  isStarting: boolean
  onStart: () => void
  onStop: () => void
  meetingNotes?: string
  isGeneratingSummary?: boolean
}

export const FloatingVoiceControl = ({
  isRecording,
  isStarting,
  onStart,
  onStop,
  meetingNotes,
  isGeneratingSummary = false,
}: FloatingVoiceControlProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    if (isRecording) {
      onStop()
    } else {
      onStart()
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-8 right-8 z-[9999]">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-105 transition-transform"
        >
          <Mic size={32} />
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <Card className="w-96 bg-gray-900/95 backdrop-blur-lg border-purple-500/30 text-white shadow-2xl shadow-purple-500/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Voice Control
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="text-white/70 hover:text-white">
            <ChevronDown className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-gray-400 mb-6 text-center">
            {isRecording ? "Session is active. Press to stop." : "Ready to start session."}
          </p>
          <button
            onClick={handleToggle}
            disabled={isStarting}
            className={cn(
              "w-24 h-24 rounded-full text-white font-semibold transition-all duration-300 flex items-center justify-center relative overflow-hidden",
              isRecording 
                ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 animate-pulse shadow-lg shadow-red-500/30"
                : "bg-gradient-to-br from-purple-600 to-blue-500 shadow-lg shadow-purple-500/50 hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isRecording ? <Square size={40} /> : <Mic size={40} />}
            {isStarting && !isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
            )}
          </button>
          <div className="flex justify-center items-center gap-6 text-gray-300 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <span className={cn("relative flex h-3 w-3", isRecording ? "animate-pulse" : "")}>
                <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", isRecording ? "bg-red-400 animate-ping": "bg-green-400")}></span>
                <span className={cn("relative inline-flex rounded-full h-3 w-3", isRecording ? "bg-red-500": "bg-green-500")}></span>
              </span>
              {isRecording ? "Recording" : "Ready"}
            </div>
          </div>

          {/* Meeting Notes Section with Loading State */}
          {(isGeneratingSummary || meetingNotes) && (
            <div className="w-full mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 mb-3">
                {isGeneratingSummary ? (
                  <>
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-sm font-medium text-purple-400">Generating Summary...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">Meeting Summary</span>
                  </>
                )}
              </div>
              
              {isGeneratingSummary ? (
                <div className="h-32 w-full flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Claude is analyzing the meeting<br />
                    and generating your summary...
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-32 w-full">
                  <div className="text-xs text-gray-300 leading-relaxed pr-2 prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown 
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-sm font-bold text-white mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xs font-semibold text-purple-300 mb-1 mt-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xs font-medium text-gray-200 mb-1 mt-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-xs text-gray-300 mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="text-xs text-gray-300 mb-2 ml-3 list-disc" {...props} />,
                        ol: ({node, ...props}) => <ol className="text-xs text-gray-300 mb-2 ml-3 list-decimal" {...props} />,
                        li: ({node, ...props}) => <li className="text-xs text-gray-300 mb-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                        em: ({node, ...props}) => <em className="text-purple-300 italic" {...props} />,
                      }}
                    >
                      {meetingNotes}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 