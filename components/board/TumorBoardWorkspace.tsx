"use client"

import { useState, useRef, useEffect } from 'react'
import { DecisionPad } from './DecisionPad'
import { SessionTimer } from './SessionTimer'
import { useBoardMode } from './BoardModeContext'
import { useUIStore } from '@/store/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BotAvatar } from '@/components/ui/bot-avatar'
import { ActionCard } from '@/components/ui/action-card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Users, Clock, Activity, Maximize2, Minimize2, Eye, FileText, Brain, Dna, 
  Image, BarChart3, Send, Mic, Bot, CheckCircle2, ExternalLink, Presentation,
  Stethoscope, Zap, Target, BookOpen, FlaskConical, Calendar, User, MapPin,
  Heart, Beaker, Monitor, ChevronDown, ChevronUp, X, Loader2, Sparkles, Square
} from 'lucide-react'
import type { Patient } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TumorBoardWorkspaceProps {
  patient: Patient
}

interface Message {
  id: string
  sender: "user" | "genetics" | "oncology" | "pathology" | "radiology" | "immunotherapy"
  content: string
  timestamp: Date
  agentName?: string
}

interface QuickInsight {
  category: string
  title: string
  value: string
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
  selected?: boolean
}

interface ImageItem {
  id: string
  title: string
  description: string
  type: 'mri' | 'ct' | 'histology' | 'pet'
  url: string
  selected: boolean
}

interface LeanTabContent {
  id: string
  name: string
  summary: string
  keyPoints: string[]
  selected: boolean
  icon: React.ReactNode
  content: React.ReactNode
}

export function TumorBoardWorkspace({ patient }: TumorBoardWorkspaceProps) {
  const { activeTab, setActiveTab } = useUIStore()
  const { attendees, sessionTimer, updateSessionTimer, emitTabChange } = useBoardMode()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [presentationMode, setPresentationMode] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [currentView, setCurrentView] = useState("CASE OVERVIEW")
  const [showDecisionPad, setShowDecisionPad] = useState(false)
  
  // Voice Recorder State
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState('')
  const [apiKey] = useState(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '')

  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "genetics",
      agentName: "Dr. AI Genetics",
      content: `Starting multi-agent analysis for ${patient.name}. Initial genomic screening shows BRCA2 pathogenic variant - this is critical for treatment planning. Initiating collaborative discussion with specialists.`,
      timestamp: new Date(),
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Enhanced insights with selection capability
  const [quickInsights, setQuickInsights] = useState<QuickInsight[]>([
    {
      category: "Genomics",
      title: "BRCA2 Mutation",
      value: "Pathogenic variant detected",
      priority: "high",
      icon: <Dna className="w-4 h-4" />,
      selected: true
    },
    {
      category: "Imaging", 
      title: "Response Assessment",
      value: "Partial response (30% reduction)",
      priority: "medium",
      icon: <Image className="w-4 h-4" />,
      selected: true
    },
    {
      category: "Biomarkers",
      title: "HER2 Status",
      value: "3+ (Positive)",
      priority: "high", 
      icon: <BarChart3 className="w-4 h-4" />,
      selected: true
    },
    {
      category: "AI Analysis",
      title: "Treatment Recommendation",
      value: "CDK4/6 inhibitor + endocrine therapy",
      priority: "high",
      icon: <Brain className="w-4 h-4" />,
      selected: false
    }
  ])

  // Enhanced image management with categorization and AI analysis
  const [availableImages, setAvailableImages] = useState<ImageItem[]>([
    // Histology Images - as requested by user
    {
      id: "histology1",
      title: "Histology Sample 1",
      description: "Histological analysis of tissue sample",
      type: "histology",
      url: "/medical-images/histology 1.png",
      selected: true
    },
    {
      id: "histology2", 
      title: "Histology Sample 2",
      description: "Secondary tissue histological examination",
      type: "histology",
      url: "/medical-images/histology 2.png",
      selected: true
    },
    {
      id: "histology_chest",
      title: "Histology Chest",
      description: "Chest tissue histological analysis",
      type: "histology", 
      url: "/medical-images/histology chest.jpg",
      selected: true
    },
    {
      id: "histology_liver",
      title: "Histology Liver",
      description: "Hepatic tissue histological analysis",
      type: "histology", 
      url: "/medical-images/histology liver.jpg",
      selected: true
    },
    // MRI Images - as requested by user, grouped with Stomach images
    {
      id: "mri1",
      title: "MRI Scan - Sequence 1",
      description: "T1-weighted MRI showing structural details",
      type: "mri",
      url: "",
      selected: true
    },
    {
      id: "mri2",
      title: "MRI Scan - Sequence 2", 
      description: "T2-weighted MRI for enhanced contrast",
      type: "mri",
      url: "/medical-images/mri 2.png",
      selected: true
    },
    // Stomach Images - grouped with MRI as requested
    {
      id: "stomach1",
      title: "Stomach Imaging - Sample 1",
      description: "Gastric tissue analysis",
      type: "mri",
      url: "/medical-images/Stomach 1.png",
      selected: true
    },
    {
      id: "stomach2",
      title: "Stomach Imaging - Sample 2", 
      description: "Additional gastric tissue examination",
      type: "mri",
      url: "/medical-images/Stomach 2.png",
      selected: true
    }
  ])

  // AI Analysis state
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({})
  const [analyzingImages, setAnalyzingImages] = useState<Set<string>>(new Set())
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Categorize images by type - MRI section includes Stomach images as requested
  const categorizeImages = () => {
    const categories = {
      histology: availableImages.filter(img => img.type === 'histology'),
      radiology: availableImages.filter(img => ['mri', 'ct', 'pet'].includes(img.type)),
    }
    return categories
  }

  // Handle AI analysis of individual images using the vision analysis hook
  const analyzeImage = async (imageItem: ImageItem) => {
    setAnalyzingImages(prev => new Set([...prev, imageItem.id]))
    setAnalysisError(null)

    try {
      // Convert image URL to file for analysis
      const response = await fetch(imageItem.url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const file = new File([blob], `${imageItem.id}.${blob.type.split('/')[1]}`, { type: blob.type })

      // Call vision API directly
      const formData = new FormData()
      formData.append('file', file)

      const apiUrl = process.env.NEXT_PUBLIC_VISION_API_URL || 'http://localhost:8000'
      const analysisResponse = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: formData,
      })

      if (!analysisResponse.ok) {
        throw new Error(`Vision API error: ${analysisResponse.status} ${analysisResponse.statusText}`)
      }

      const result = await analysisResponse.json()
      
      if (result.status === 'success' && result.analysis) {
        setAnalysisResults(prev => ({
          ...prev,
          [imageItem.id]: result.analysis
        }))
      } else {
        throw new Error('Invalid analysis response from vision API')
      }

    } catch (error) {
      console.error('Analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setAnalysisError(errorMessage)
    } finally {
      setAnalyzingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(imageItem.id)
        return newSet
      })
    }
  }

  // Lean tab content instead of full dashboard
  const leanTabs: LeanTabContent[] = [
    {
      id: "CASE OVERVIEW",
      name: "Case Overview",
      summary: "64yo female with T2N1M0 breast cancer, ER/PR+, HER2+",
      keyPoints: ["Stage IIB", "Hormone receptor positive", "HER2 overexpression", "Good performance status"],
      selected: true,
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-medium text-white/90">Patient Information</span>
                </div>
                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span className="text-white/90">64 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gender:</span>
                    <span className="text-white/90">Female</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stage:</span>
                    <span className="text-white/90 font-medium">T2N1M0 (IIB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Status:</span>
                    <span className="text-white/90">ECOG 0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span className="text-lg font-medium text-white/90">Treatment Timeline</span>
                </div>
                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span>Diagnosis:</span>
                    <span className="text-white/90">June 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surgery:</span>
                    <span className="text-white/90">July 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chemo Start:</span>
                    <span className="text-white/90">August 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Status:</span>
                    <span className="text-green-400 font-medium">On treatment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "IMAGES",
      name: "Medical Imaging", 
      summary: "Comprehensive image analysis with AI-powered diagnostics",
      keyPoints: ["Histology & Radiology", "BiomedCLIP Analysis", "Multi-specialty Insights"],
      selected: true,
      icon: <Monitor className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white/90 mb-2">Medical Image Analysis</h3>
              <p className="text-sm text-white/60">AI-powered analysis using BiomedCLIP for comprehensive diagnostic insights</p>
            </div>
            {analysisError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{analysisError}</p>
              </div>
            )}
          </div>

          {/* Image Categories */}
          {(() => {
            const categories = categorizeImages()
            return (
              <div className="space-y-8">
                {/* Histology Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <h4 className="text-lg font-medium text-white/90">Histology & Pathology</h4>
                    <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-400">
                      {categories.histology.length} images
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {categories.histology.map((image) => (
                      <div key={image.id} className="group relative bg-gradient-to-r from-[#1a1a2e] to-[#1e1e32] border border-white/10 rounded-xl p-4 hover:border-purple-400/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={image.selected}
                            onCheckedChange={(checked) => {
                              setAvailableImages(prev => prev.map(img => 
                                img.id === image.id ? { ...img, selected: !!checked } : img
                              ))
                            }}
                            className="border-white/30 mt-2"
                          />
                          
                          {/* Image Preview */}
                          <div className="w-24 h-20 bg-black/50 rounded-lg overflow-hidden border border-white/10">
                            <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
                          </div>
                          
                          {/* Image Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-base font-medium text-white/90 truncate">{image.title}</h5>
                              <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-400 px-2 py-0.5">
                                HISTOLOGY
                              </Badge>
                            </div>
                            <p className="text-sm text-white/60 mb-3">{image.description}</p>
                            
                            {/* Analysis Results */}
                            {analysisResults[image.id] && (
                              <div className="bg-black/30 rounded-lg p-3 border border-purple-400/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <Brain className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm font-medium text-purple-400">AI Analysis</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-white/70">Primary Finding:</span>
                                    <span className="text-sm font-medium text-white/90">
                                      {analysisResults[image.id].primary_prediction?.condition || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-white/70">Confidence:</span>
                                    <span className="text-sm font-medium text-green-400">
                                      {analysisResults[image.id].primary_prediction?.percentage || 'N/A'}
                                    </span>
                                  </div>
                                  {analysisResults[image.id].clinical_insights?.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-white/10">
                                      <p className="text-xs text-white/60">
                                        {analysisResults[image.id].clinical_insights[0]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Analyze Button */}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => analyzeImage(image)}
                              disabled={analyzingImages.has(image.id)}
                              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 px-4 py-2 text-sm"
                            >
                              {analyzingImages.has(image.id) ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Analyzing...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4" />
                                  Analyze
                                </div>
                              )}
                            </Button>
                            {analysisResults[image.id] && (
                              <Badge variant="outline" className="text-xs border-green-400/30 text-green-400 px-2 py-1">
                                ✓ Analyzed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radiology Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <h4 className="text-lg font-medium text-white/90">Radiology & Imaging</h4>
                    <Badge variant="outline" className="text-xs border-cyan-400/30 text-cyan-400">
                      {categories.radiology.length} images
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {categories.radiology.map((image) => (
                      <div key={image.id} className="group relative bg-gradient-to-r from-[#1a1a2e] to-[#1e1e32] border border-white/10 rounded-xl p-4 hover:border-cyan-400/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={image.selected}
                            onCheckedChange={(checked) => {
                              setAvailableImages(prev => prev.map(img => 
                                img.id === image.id ? { ...img, selected: !!checked } : img
                              ))
                            }}
                            className="border-white/30 mt-2"
                          />
                          
                          {/* Image Preview */}
                          <div className="w-24 h-20 bg-black/50 rounded-lg overflow-hidden border border-white/10">
                            <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
                          </div>
                          
                          {/* Image Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-base font-medium text-white/90 truncate">{image.title}</h5>
                              <Badge variant="outline" className="text-xs border-cyan-400/30 text-cyan-400 px-2 py-0.5">
                                {image.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-white/60 mb-3">{image.description}</p>
                            
                            {/* Analysis Results */}
                            {analysisResults[image.id] && (
                              <div className="bg-black/30 rounded-lg p-3 border border-cyan-400/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <Brain className="w-4 h-4 text-cyan-400" />
                                  <span className="text-sm font-medium text-cyan-400">AI Analysis</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-white/70">Primary Finding:</span>
                                    <span className="text-sm font-medium text-white/90">
                                      {analysisResults[image.id].primary_prediction?.condition || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-white/70">Confidence:</span>
                                    <span className="text-sm font-medium text-green-400">
                                      {analysisResults[image.id].primary_prediction?.percentage || 'N/A'}
                                    </span>
                                  </div>
                                  {analysisResults[image.id].clinical_insights?.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-white/10">
                                      <p className="text-xs text-white/60">
                                        {analysisResults[image.id].clinical_insights[0]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Analyze Button */}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => analyzeImage(image)}
                              disabled={analyzingImages.has(image.id)}
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 px-4 py-2 text-sm"
                            >
                              {analyzingImages.has(image.id) ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Analyzing...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4" />
                                  Analyze
                                </div>
                              )}
                            </Button>
                            {analysisResults[image.id] && (
                              <Badge variant="outline" className="text-xs border-green-400/30 text-green-400 px-2 py-1">
                                ✓ Analyzed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )
    },
    {
      id: "BIOMARKERS",
      name: "Molecular Profile",
      summary: "BRCA2 pathogenic, HER2+, PIK3CA wild-type, TMB-low",
      keyPoints: ["BRCA2 c.5946delT", "HER2 IHC 3+", "Homologous recombination deficient"],
      selected: true,
      icon: <Dna className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Dna className="w-5 h-5 text-red-400" />
                  <span className="text-lg font-medium text-white/90">Germline Mutations</span>
                </div>
                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span>BRCA2:</span>
                    <span className="text-red-400 font-medium">c.5946delT (Pathogenic)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ATM:</span>
                    <span className="text-green-400">Wild-type</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TP53:</span>
                    <span className="text-green-400">Wild-type</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CHEK2:</span>
                    <span className="text-green-400">Wild-type</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-medium text-white/90">Somatic Markers</span>
                </div>
                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span>HER2:</span>
                    <span className="text-blue-400 font-medium">IHC 3+ (Positive)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ER:</span>
                    <span className="text-white/90">90% positive</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PR:</span>
                    <span className="text-white/90">75% positive</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ki-67:</span>
                    <span className="text-orange-400">35% (Intermediate)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "TREATMENT",
      name: "Treatment Plan",
      summary: "Dual-targeted therapy: HER2 blockade + PARP inhibition",
      keyPoints: ["Pertuzumab + Trastuzumab", "Carboplatin (BRCA2 sensitive)", "Olaparib maintenance"],
      selected: false,
      icon: <Heart className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-lg font-medium text-white/90">Current Treatment Regimen</span>
              </div>
              <div className="space-y-4 text-sm text-white/70">
                <div className="flex justify-between items-center p-3 bg-[#121225] rounded-lg">
                  <span className="font-medium">Pertuzumab</span>
                  <span className="text-white/90">840mg IV q3weeks</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#121225] rounded-lg">
                  <span className="font-medium">Trastuzumab</span>
                  <span className="text-white/90">6mg/kg IV q3weeks</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#121225] rounded-lg">
                  <span className="font-medium">Carboplatin</span>
                  <span className="text-white/90">AUC 5 IV q3weeks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ]

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const analyzeAudio = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    setAudioLevel(average / 255) // Normalize to 0-1

    if (isRecording) {
      animationRef.current = requestAnimationFrame(analyzeAudio)
    }
  }

  const startRecording = async () => {
    try {
      setError('')
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup audio analysis
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Setup speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          // Only append final transcript to avoid duplication
          // Show interim transcript temporarily for live feedback
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript)
          }
        }

        recognitionRef.current.start()
      }

      setIsRecording(true)
      setRecordingTime(0)
      setTranscript('')
      setSummary('')

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      // Start audio analysis
      analyzeAudio()

    } catch (err) {
      setError('Failed to access microphone. Please check permissions.')
      console.error('Error starting recording:', err)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    setAudioLevel(0)

    // Generate summary if transcript exists
    if (transcript.trim()) {
      generateSummary()
    }
  }

  const generateSummary = async () => {
    if (!transcript.trim() || !apiKey) return

    setIsProcessing(true)
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant that creates comprehensive tumor board summaries from voice recordings. 

Format your response as a professional medical report:

# 🏥 Tumor Board Session Summary

## 📝 Key Discussion Points
- [Main discussion points]

## 🎯 Clinical Decisions
- [Treatment decisions made]

## 📊 Case Review
- [Case details discussed]

## ✅ Action Items
- [Follow-up actions required]

## 🔬 Specialist Input
- [Input from different specialists]

Use professional medical language and clear formatting.`
            },
            {
              role: 'user',
              content: `Please summarize this tumor board discussion transcript:\n\n${transcript}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.choices[0].message.content)
    } catch (err) {
      setError('Failed to generate summary. Please check your API key.')
      console.error('Error generating summary:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getAgentResponse = (input: string, triggerAgent?: string): Message => {
    const inputLower = input.toLowerCase()
    const timestamp = new Date()

    // Multi-agent responses based on the article
    if (triggerAgent === "genetics" || inputLower.includes("genetic") || inputLower.includes("brca") || inputLower.includes("mutation")) {
      return {
        id: Date.now().toString(),
        sender: "genetics",
        agentName: "Dr. AI Genetics",
        content: `Based on comprehensive genomic analysis: The BRCA2 pathogenic variant (c.5946delT) confers high sensitivity to platinum-based chemotherapy and PARP inhibitors. Studies show 70-80% response rates with olaparib in BRCA2+ patients. Homologous recombination deficiency score confirms DNA repair pathway disruption. Recommend germline counseling and cascade testing for family members.`,
        timestamp
      }
    }

    if (triggerAgent === "oncology" || inputLower.includes("treatment") || inputLower.includes("therapy") || inputLower.includes("recommend")) {
      return {
        id: Date.now().toString(),
        sender: "oncology",
        agentName: "Dr. AI Oncology",
        content: `Treatment strategy consensus: Given HER2+ and BRCA2+ status, dual-targeted approach optimal. First-line: Pertuzumab + Trastuzumab + Carboplatin (platinum sensitivity due to BRCA2). Maintenance with T-DM1. If progression, PARP inhibitor (olaparib) shows synergy with HER2 blockade. Clinical trial NCT04585776 investigating this combination - patient eligible.`,
        timestamp
      }
    }

    if (triggerAgent === "pathology" || inputLower.includes("pathology") || inputLower.includes("histology") || inputLower.includes("grade")) {
      return {
        id: Date.now().toString(),
        sender: "pathology",
        agentName: "Dr. AI Pathology",
        content: `Histopathologic correlation: Grade 2 invasive ductal carcinoma with moderate pleomorphism. Ki-67 proliferation index 35% - intermediate. Tumor-infiltrating lymphocytes 15% - moderate immune infiltration suggests potential immunotherapy responsiveness. H&E morphology consistent with BRCA2-associated pattern: pushing borders, lymphocytic infiltrate.`,
        timestamp
      }
    }

    if (triggerAgent === "radiology" || inputLower.includes("imaging") || inputLower.includes("response") || inputLower.includes("scan")) {
      return {
        id: Date.now().toString(),
        sender: "radiology",
        agentName: "Dr. AI Radiology", 
        content: `Imaging assessment update: RECIST criteria shows 30% diameter reduction (PR). MRI demonstrates decreased enhancement and central necrosis - excellent treatment response. No new lesions. Recommend continuing current regimen. Next imaging in 8 weeks. Consider surgical consultation given favorable response - breast conservation may be feasible.`,
        timestamp
      }
    }

    if (triggerAgent === "immunotherapy" || inputLower.includes("immune") || inputLower.includes("checkpoint") || inputLower.includes("pdl1")) {
      return {
        id: Date.now().toString(),
        sender: "immunotherapy",
        agentName: "Dr. AI Immunotherapy",
        content: `Immunotherapy assessment: PD-L1 expression 5% (low). However, BRCA2 tumors show increased neoantigen load and immune activation. Recent data suggests pembrolizumab benefit in HER2+ BRCA-mutated tumors. Consider combination with HER2-targeted therapy. Tumor microenvironment analysis shows T-cell infiltration - potentially immune-responsive.`,
        timestamp
      }
    }

    // Default collaborative response
    return {
      id: Date.now().toString(),
      sender: "genetics",
      agentName: "Dr. AI Coordinator",
      content: `Analyzing your query across all specialties... The multi-agent team is reviewing: genetics findings (BRCA2 status), imaging response (30% reduction), molecular markers (HER2+), and treatment options. Which specific aspect would you like the specialists to elaborate on?`,
      timestamp
    }
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: chatInput,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    const currentInput = chatInput
    setChatInput("")

    // Trigger appropriate agent response
    setTimeout(() => {
      const response = getAgentResponse(currentInput)
      setMessages(prev => [...prev, response])

      // Sometimes trigger follow-up from another agent
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const followUp = getAgentResponse(currentInput, "oncology")
          setMessages(prev => [...prev, followUp])
        }, 2000)
      }
    }, 1000)
  }

  const handleTabChange = (tab: string) => {
    setCurrentView(tab)
    emitTabChange(tab)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode)
  }

  const toggleInsightSelection = (index: number) => {
    setQuickInsights(prev => prev.map((insight, i) => 
      i === index ? { ...insight, selected: !insight.selected } : insight
    ))
  }

  const toggleTabSelection = (tabId: string) => {
    const updatedTabs = leanTabs.map(tab =>
      tab.id === tabId ? { ...tab, selected: !tab.selected } : tab
    )
  }

  if (presentationMode) {
    const selectedInsights = quickInsights.filter(i => i.selected)
    const selectedTabs = leanTabs.filter(t => t.selected)
    const selectedImages = availableImages.filter(img => img.selected)

    return (
      <div className="h-full bg-[#0a0a1e] text-white flex flex-col">
        {/* Presentation Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{patient.name} - Tumor Board</h1>
              <p className="text-white/70 text-lg">Multi-Agent AI Analysis - {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-[#4a6bff] text-white">
                <Presentation className="w-3 h-3 mr-1" />
                Presentation Mode
              </Badge>
              <Button
                variant="outline"
                onClick={togglePresentationMode}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                Exit Presentation
              </Button>
            </div>
          </div>
        </div>

        {/* Selected Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Key Insights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {selectedInsights.map((insight, index) => (
              <Card key={index} className="bg-[#1a1a2e] border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      insight.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {insight.icon}
                    </div>
                    <div className="text-xs text-white/50 uppercase tracking-wide">
                      {insight.category}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-white/90 mb-1">
                    {insight.title}
                  </div>
                  <div className="text-xs text-white/70">
                    {insight.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Images */}
          {selectedImages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Medical Imaging</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedImages.map((image) => (
                  <Card key={image.id} className="bg-[#1a1a2e] border-white/10">
                    <CardContent className="p-4">
                      <div className="aspect-video relative bg-black rounded-lg overflow-hidden mb-3">
                        <img src={image.url} alt={image.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white/90">{image.title}</div>
                          <div className="text-xs text-white/60">{image.description}</div>
                        </div>
                        <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                          {image.type.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Selected Tab Summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedTabs.map((tab) => (
              <Card key={tab.id} className="bg-[#1a1a2e] border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white/90 flex items-center gap-2 text-lg">
                    {tab.icon}
                    {tab.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 mb-4">{tab.summary}</p>
                  <div className="space-y-2">
                    {tab.keyPoints.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        {point}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentTab = leanTabs.find(tab => tab.id === currentView)

  return (
    <div className="flex h-full">
      {/* AI Copilot Sidebar - Multi-Agent System */}
      <aside className={`${isFullscreen ? 'hidden' : 'w-80'} border-r border-white/10 bg-gray-950/50 flex flex-col transition-all duration-200`}>
        {/* AI Copilot Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-[#4a6bff]" />
            <h3 className="font-medium text-white/90">AI Tumor Board</h3>
            <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
              Multi-Agent
            </Badge>
          </div>
          <div className="text-xs text-white/60">
            Collaborative AI specialists analyzing {patient.name}'s case
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[90%] ${
                  message.sender === "user"
                    ? "bg-[#4a6bff] rounded-l-lg rounded-tr-lg"
                    : "bg-[#1a1a30] rounded-r-lg rounded-tl-lg border border-white/10"
                } p-3`}>
                  {message.sender !== "user" && (
                    <BotAvatar 
                      type={message.sender as any} 
                      size="sm" 
                      className="mr-2 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    {message.agentName && (
                      <div className="text-xs text-white/50 mb-1">{message.agentName}</div>
                    )}
                    <p className="text-xs text-white/90 leading-relaxed">{message.content}</p>
                    <div className="text-xs text-white/40 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask the AI specialists..."
              className="flex-1 bg-[#1a1a30] border-white/20 text-white/90 resize-none text-xs"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <div className="flex flex-col gap-1">
              <Button size="sm" onClick={handleSendMessage} className="h-8 w-8 p-0 bg-[#4a6bff] hover:bg-[#3a5bef]">
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Enhanced Header with Session Info */}
        <div className="p-4 border-b border-white/10 bg-[#121225]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white/90">
                  {patient.name} - Tumor Board Review
                </h2>
                <div className="flex items-center gap-4 text-xs text-white/60 mt-1">
                  <span>Session: {Math.floor(sessionTimer / 60).toString().padStart(2, '0')}:{(sessionTimer % 60).toString().padStart(2, '0')}</span>
                  <span>Attendees: {attendees.length}</span>
                  <span>AI Agents: 5 Active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={togglePresentationMode}
                className="bg-[#4a6bff] hover:bg-[#3a5bef] text-white text-sm"
              >
                <Presentation className="w-4 h-4 mr-2" />
                Present
              </Button>
              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Selection Area - More Compact */}
        <div className="p-3 border-b border-white/10 bg-[#0f0f20]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Quick Insights Selection */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader className="pb-1 px-3 py-2">
                <CardTitle className="text-white/90 text-xs">Key Insights for Presentation</CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-2 space-y-1">
                {quickInsights.map((insight, index) => (
                  <div key={index} className="flex items-center gap-2 p-1 rounded hover:bg-white/5">
                    <Checkbox
                      checked={insight.selected}
                      onCheckedChange={() => toggleInsightSelection(index)}
                      className="border-white/30 h-3 w-3"
                    />
                    <div className={`p-1 rounded ${
                      insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      insight.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white/90 truncate">
                        {insight.title}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tab Summary Selection */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader className="pb-1 px-3 py-2">
                <CardTitle className="text-white/90 text-xs">Sections for Presentation</CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-2 space-y-1">
                {leanTabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-2 p-1 rounded hover:bg-white/5">
                    <Checkbox
                      checked={tab.selected}
                      onCheckedChange={() => toggleTabSelection(tab.id)}
                      className="border-white/30 h-3 w-3"
                    />
                    <div className="p-1 rounded bg-[#4a6bff]/20 text-[#4a6bff]">
                      {tab.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white/90">
                        {tab.name}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lean Case View - Custom Tabs */}
        <div className="flex items-center border-b border-white/10 bg-[#121225]">
          <div className="flex-1">
            <div className="flex">
              {leanTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => handleTabChange(tab.id)}
                  className={`text-xs font-medium px-4 py-3 rounded-none border-b-2 ${
                    currentView === tab.id 
                      ? "border-[#4a6bff] text-white bg-[#4a6bff]/10" 
                      : "border-transparent text-white/50 hover:text-white/80"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.icon}
                    {tab.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content - More Spacious */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {currentTab?.content}
          </div>
        </div>

        {/* Collapsible Decision Pad */}
        <div className="border-t border-white/10 bg-gray-950/50">
          <div className="flex items-center justify-between p-3 bg-[#1a1a2e] border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-white/70" />
              <span className="text-sm font-medium text-white/90">Decision Pad</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDecisionPad(!showDecisionPad)}
              className="text-white/70 hover:text-white"
            >
              {showDecisionPad ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
          {showDecisionPad && (
            <div className="h-48">
              <DecisionPad />
            </div>
          )}
        </div>
      </main>

      {/* Floating Voice Recorder Interface */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 rounded-3xl p-8 max-w-lg w-full mx-4 border border-white/20 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Brain className="w-8 h-8 text-cyan-400" />
                  <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white">Neural Voice Recorder</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Close panel but keep recording if recording is active
                  setShowVoiceRecorder(false)
                }}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Recording Interface */}
            <div className="text-center mb-6 flex-shrink-0">
              {/* Recording Timer */}
              <div className="mb-4">
                <div className="text-2xl font-mono text-cyan-400 font-bold">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-white/60 mt-1">Recording Time</div>
              </div>

              {/* Recording Button */}
              <div className="relative mb-6">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={cn(
                    "w-24 h-24 rounded-full text-white font-semibold transition-all duration-300 relative overflow-hidden",
                    isRecording
                      ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 animate-pulse shadow-lg shadow-red-500/30"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:scale-105 shadow-lg shadow-cyan-500/30"
                  )}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                  
                  {/* Pulse animation */}
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                  )}
                </Button>

                {/* Audio Level Visualization */}
                {isRecording && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full transition-all duration-150"
                        style={{
                          height: `${Math.max(3, audioLevel * 30 + Math.random() * 8)}px`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="text-center mb-4">
                {isRecording ? (
                  <div className="flex items-center justify-center gap-2 text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Listening...</span>
                  </div>
                ) : isProcessing ? (
                  <div className="flex items-center justify-center gap-2 text-cyan-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">AI Processing...</span>
                  </div>
                ) : (
                  <div className="text-white/60 text-sm">
                    Tap to start recording
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Live Transcript */}
              {(transcript || isRecording) && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <h4 className="text-sm font-semibold text-white">Live Transcript</h4>
                  </div>
                  <div className="h-32 overflow-y-auto bg-black/30 rounded-lg p-3 border border-white/20">
                    {transcript ? (
                      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {transcript}
                      </p>
                    ) : (
                      <p className="text-white/50 text-sm italic">
                        Start speaking to see live transcription...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {(summary || isProcessing) && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-semibold text-white">AI Summary</h4>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-3 border border-white/20 max-h-64 overflow-y-auto">
                    {isProcessing ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="text-center">
                          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                          <p className="text-white/70 text-sm">Analyzing discussion...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-white/90 text-sm leading-relaxed">
                        {summary.split('\n').map((line, index) => {
                          if (line.startsWith('# ')) {
                            return <h1 key={index} className="text-lg font-bold text-cyan-400 mb-3 mt-2">{line.replace('# ', '')}</h1>
                          } else if (line.startsWith('## ')) {
                            return <h2 key={index} className="text-base font-semibold text-purple-400 mb-2 mt-4">{line.replace('## ', '')}</h2>
                          } else if (line.startsWith('### ')) {
                            return <h3 key={index} className="text-sm font-medium text-blue-400 mb-2 mt-3">{line.replace('### ', '')}</h3>
                          } else if (line.startsWith('- ')) {
                            return <div key={index} className="ml-4 mb-1 text-white/80">• {line.replace('- ', '')}</div>
                          } else if (line.trim()) {
                            return <p key={index} className="mb-2 text-white/90">{line}</p>
                          } else {
                            return <div key={index} className="mb-2"></div>
                          }
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Voice Recorder Button */}
      {!showVoiceRecorder && (
        <>
          {/* Main floating button */}
          <Button
            onClick={() => {
              if (!isRecording) {
                startRecording()
              }
              setShowVoiceRecorder(true)
            }}
            className={cn(
              "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg border-2 border-white/20 backdrop-blur-sm hover:scale-110 transition-all duration-300 z-40",
              isRecording 
                ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 animate-pulse shadow-red-500/30"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/30"
            )}
          >
            <Mic className="w-6 h-6 text-white" />
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
            )}
          </Button>

          {/* Small up arrow when recording in background */}
          {isRecording && (
            <Button
              onClick={() => setShowVoiceRecorder(true)}
              className="fixed bottom-24 right-6 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30 border border-white/20 backdrop-blur-sm hover:scale-110 transition-all duration-300 z-40"
            >
              <ChevronUp className="w-4 h-4 text-white" />
            </Button>
          )}
        </>
      )}
    </div>
  )
}

// Declare global interfaces for Speech Recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
} 