"use client"

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-6', className)}>
      <Loader2 className={cn('animate-spin text-[#4a6bff]', sizeClasses[size])} />
      {text && (
        <p className="mt-2 text-sm text-white/60">{text}</p>
      )}
    </div>
  )
}

interface FullPageLoadingProps {
  text?: string
}

export function FullPageLoading({ text = 'Loading...' }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-[#0d0d1e] flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#4a6bff] mx-auto mb-4" />
        <p className="text-white/90 text-lg">{text}</p>
      </div>
    </div>
  )
} 