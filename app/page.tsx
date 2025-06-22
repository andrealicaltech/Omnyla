"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle, Beaker, Users, ArrowRight, Sparkles } from "lucide-react"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGetStarted = () => {
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-gradient-to-br from-blue-950 via-purple-950 to-black">
      {/* Bokeh background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[5%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[20%] left-[25%] w-72 h-72 bg-indigo-500/05 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - Simplified */}
        <header className="flex items-center justify-between p-6 lg:p-8">
          <div className="flex items-center space-x-2">
            {/* Professional Company Logo */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-sm"></div>
                </div>
              </div>
            </div>
            <span className="text-white font-bold text-2xl">
              Omnyla
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/signup')} className="text-white hover:bg-white/10">
              Sign Up
            </Button>
            <Button variant="ghost" onClick={() => router.push('/login')} className="text-white hover:bg-white/10">
              Log In
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 lg:px-8 text-center">
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto mb-16">

            <h2 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-sky-300 to-white bg-clip-text text-transparent">
              Omnyla
            </h2>

            <p className="text-xl md:text-2xl font-light text-white max-w-3xl mx-auto leading-relaxed mb-12">
              AI Copilot for Cancer Teams
            </p>

            {/* Enhanced CTA Button */}
            <div className="relative inline-block group mb-16">
              <button 
                onClick={handleGetStarted}
                className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white text-xl font-bold px-12 py-4 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden group cursor-pointer border-0 z-20"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none"></div>
              </button>
              
              {/* Outer glow ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 scale-110 -z-10"></div>
            </div>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 xl:gap-20 max-w-7xl mx-auto">
            {/* Smart Diagnosis */}
            <div className="relative group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:from-white/10 hover:to-white/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Smart Diagnosis</h3>
                <p className="text-lg text-white/80 leading-relaxed">
                  AI-powered medical analysis and diagnostic assistance for accurate patient care
                </p>
              </div>
            </div>
            
            {/* Genomic Analysis */}
            <div className="relative group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:from-white/10 hover:to-white/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Beaker className="w-10 h-10 text-purple-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Genomic Analysis</h3>
                <p className="text-lg text-white/80 leading-relaxed">
                  Advanced VCF analysis and pharmacogenomic insights for personalized medicine
                </p>
              </div>
            </div>
            
            {/* Collaboration */}
            <div className="relative group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:from-white/10 hover:to-white/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500/30 to-pink-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-10 h-10 text-pink-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Collaboration</h3>
                <p className="text-lg text-white/80 leading-relaxed">
                  Team-based tumor board and medical collaboration tools for better outcomes
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="p-6 text-center">
          <p className="text-white/40 text-sm font-light">
            © 2024 Omnyla. Advanced healthcare technology for better patient outcomes.
          </p>
        </footer>
      </div>
    </div>
  )
}
