"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // This would handle actual login logic
    // For now, just redirect to dashboard
    router.push('/dashboard')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with bokeh effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1e] via-[#1a1a2e] to-[#16213e]">
        {/* Bokeh circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-40 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-green-500/20 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="text-white/90 hover:text-white hover:bg-white/10"
          >
            ← Back to Home
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-4"></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-white/70">
                Sign in to your Omnyla account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-500"
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-white/60 text-center">
                <strong>Demo Mode:</strong> Use any email/password to continue
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 