"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This would be replaced with actual auth state
  const router = useRouter()

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  const handleLogin = () => {
    router.push('/login')
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
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1500"></div>
        
        {/* Medical/Doctor related background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            {/* Logo placeholder */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleLogin}
            className="text-white/90 hover:text-white hover:bg-white/10"
          >
            Login
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Brand Name */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-4">
              Omnyla
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
              Your AI-powered medical assistant for precision healthcare and genomic analysis
            </p>
          </div>

          {/* Get Started Button */}
          <div className="mb-12">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Diagnosis</h3>
              <p className="text-white/60">AI-powered medical analysis and diagnostic assistance</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Genomic Analysis</h3>
              <p className="text-white/60">Advanced VCF analysis and pharmacogenomic insights</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Collaboration</h3>
              <p className="text-white/60">Team-based tumor board and medical collaboration tools</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-white/40 text-sm">
            © 2024 Omnyla. Advanced healthcare technology for better patient outcomes.
          </p>
        </footer>
      </div>
    </div>
  )
}
