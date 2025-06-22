"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, Mail, Lock, Eye, EyeOff, User } from "lucide-react"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    // This would handle actual signup logic
    // For now, just redirect to dashboard
    router.push('/dashboard')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleLogin = () => {
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-950 via-purple-950 to-black">
      {/* Bokeh background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[5%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[20%] left-[25%] w-72 h-72 bg-indigo-500/05 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
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
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-8">
          <div className="w-full max-w-lg">
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
                      Create Account
                    </span>
                  </h1>
                  <p className="text-white/70 text-lg font-light">
                    Join Omnyla for advanced healthcare technology
                  </p>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSignUp} className="space-y-5">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white/90 font-medium flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>First Name</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl h-12 pl-4 transition-all duration-300"
                          required
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-pink-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white/90 font-medium flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Last Name</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl h-12 pl-4 transition-all duration-300"
                          required
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-pink-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

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
                        placeholder="Create a password"
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

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/90 font-medium flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Confirm Password</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl h-12 pl-4 pr-12 transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-pink-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Create Account Button */}
                  <div className="pt-2">
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 h-12 text-lg rounded-xl shadow-xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-0.5 group overflow-hidden"
                    >
                      <span className="relative z-10">Create Account</span>
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </Button>
                  </div>
                </form>

                {/* Demo Notice */}
                <div className="mt-8 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl border border-white/10">
                  <p className="text-sm text-white/70 text-center font-light">
                    <span className="font-semibold text-white/90">Demo Mode:</span> Fill in any information to continue
                  </p>
                </div>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-white/60">
                    Already have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleLogin}
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto font-semibold underline-offset-4 hover:underline transition-all duration-200"
                    >
                      Sign in
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