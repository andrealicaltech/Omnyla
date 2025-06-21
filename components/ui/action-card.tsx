"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface ActionCardProps {
  icon: LucideIcon
  title: string
  description: string
  action: string
  onClick: (action: string) => void
  className?: string
}

export function ActionCard({ icon: Icon, title, description, action, onClick, className = "" }: ActionCardProps) {
  return (
    <Card className={`bg-[#1a1a30] border-white/20 hover:border-[#4a6bff]/50 transition-all cursor-pointer group ${className}`}>
      <CardContent className="p-3" onClick={() => onClick(action)}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-[#4a6bff]/20 rounded-lg flex items-center justify-center group-hover:bg-[#4a6bff]/30 transition-colors">
            <Icon className="w-4 h-4 text-[#4a6bff]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
              {title}
            </h4>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 