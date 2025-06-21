"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Dna, Target, BookOpen, Eye, Zap, Stethoscope, Brain } from "lucide-react"

interface BotAvatarProps {
  type?: "general" | "genetics" | "oncology" | "pathology" | "radiology" | "immunotherapy" | "neurology"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function BotAvatar({ type = "general", size = "md", className = "" }: BotAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  }

  const getIcon = () => {
    switch (type) {
      case "genetics":
        return <Dna className="w-3 h-3" />
      case "oncology":
        return <Target className="w-3 h-3" />
      case "pathology":
        return <BookOpen className="w-3 h-3" />
      case "radiology":
        return <Eye className="w-3 h-3" />
      case "immunotherapy":
        return <Zap className="w-3 h-3" />
      case "neurology":
        return <Brain className="w-3 h-3" />
      default:
        return <Bot className="w-3 h-3" />
    }
  }

  const getGradient = () => {
    switch (type) {
      case "genetics":
        return "bg-gradient-to-br from-green-600 to-emerald-700"
      case "oncology":
        return "bg-gradient-to-br from-red-600 to-rose-700"
      case "pathology":
        return "bg-gradient-to-br from-purple-600 to-violet-700"
      case "radiology":
        return "bg-gradient-to-br from-blue-600 to-cyan-700"
      case "immunotherapy":
        return "bg-gradient-to-br from-yellow-600 to-orange-700"
      case "neurology":
        return "bg-gradient-to-br from-indigo-600 to-purple-700"
      default:
        return "bg-gradient-to-br from-[#4a6bff] to-[#3a5bef]"
    }
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarFallback className={`${getGradient()} text-white border-0`}>
        {getIcon()}
      </AvatarFallback>
    </Avatar>
  )
} 