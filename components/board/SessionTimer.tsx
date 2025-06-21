"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Clock } from 'lucide-react'

interface SessionTimerProps {
  onTimeUpdate?: (seconds: number) => void
}

export function SessionTimer({ onTimeUpdate }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const newTime = prev + 1
          onTimeUpdate?.(newTime)
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, onTimeUpdate])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartPause = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSeconds(0)
    onTimeUpdate?.(0)
  }

  return (
    <Card className="bg-[#1a1a2e] border-white/10">
      <CardHeader className="p-3">
        <CardTitle className="text-white/90 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Session Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-center space-y-3">
          <div className="text-3xl font-mono text-white/90 font-bold tracking-wider">
            {formatTime(seconds)}
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={handleStartPause}
              size="sm"
              className={`${
                isRunning 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3 h-3 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </>
              )}
            </Button>
            
            <Button
              onClick={handleReset}
              size="sm"
              variant="outline"
              className="border-white/20 text-white/70 hover:bg-white/10"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
          
          <div className="text-xs text-white/50">
            {isRunning ? 'Session in progress' : seconds > 0 ? 'Session paused' : 'Ready to start'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 