"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // This would handle actual login logic
    // For now, just redirect to dashboard
    router.push('/dashboard')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleSignUp = () => {
    router.push('/signup')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/60 rounded-full animate-bounce delay-2000"></div>
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce delay-3000"></div>
        <div className="absolute bottom-20 right-20 w-4 h-4 bg-pink-400/60 rounded-full animate-bounce"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 30c0-11 9-20 20-20s20 9 20 20-9 20-20 20-20-9-20-20zm0 0c0 11-9 20-20 20s-20-9-20-20 9-20 20-20 20 9 20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 lg:p-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="text-white/80 hover:text-white hover:bg-white/10 font-medium px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>

          <div className="flex items-center space-x-4">
            {/* Enhanced Logo */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30"></div>
            </div>
            <span className="text-white font-bold text-lg bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Omnyla
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Glassmorphism Card */}
            <div className="relative">
              {/* Card Background with Glassmorphism */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-blue-500/10 p-8">
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 rounded-3xl blur-xl -z-10"></div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-black mb-3">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Welcome Back
                    </span>
                  </h1>
                  <p className="text-white/70 text-lg font-light">
                    Sign in to your Omnyla account
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90 font-medium flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl h-12 pl-4 transition-all duration-300"
                        required
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-pink-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90 font-medium flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Password</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl h-12 pl-4 pr-12 transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-pink-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <div className="pt-2">
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 h-12 text-lg rounded-xl shadow-xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-0.5 group overflow-hidden"
                    >
                      <span className="relative z-10">Sign In</span>
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </Button>
                  </div>
                </form>

                {/* Demo Notice */}
                <div className="mt-8 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl border border-white/10">
                  <p className="text-sm text-white/70 text-center font-light">
                    <span className="font-semibold text-white/90">Demo Mode:</span> Use any email/password to continue
                  </p>
                </div>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-white/60">
                    Don't have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleSignUp}
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto font-semibold underline-offset-4 hover:underline transition-all duration-200"
                    >
                      Sign up
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 