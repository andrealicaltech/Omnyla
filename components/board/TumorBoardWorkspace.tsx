"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import Vapi from "@vapi-ai/web";

interface CustomWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

declare const window: CustomWindow;

interface TumorBoardWorkspaceProps {
  patient: Patient;
}

interface Message {
  id: string;
  sender: string; // More flexible sender
  agentName?: string;
  content: string;
  timestamp: Date;
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

  // Vapi Voice Conversation State
  const [isVoiceConversationActive, setIsVoiceConversationActive] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const vapiRef = useRef<Vapi | null>(null)

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
  const [isBotTyping, setIsBotTyping] = useState(false)
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

  // Initialize Vapi
  useEffect(() => {
    const vapiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (vapiKey) {
      const vapiInstance = new Vapi(vapiKey);
      vapiRef.current = vapiInstance;

      vapiInstance.on('call-start', () => {
        console.log('✅ Vapi call started successfully');
        setIsVoiceConversationActive(true);
        setIsAISpeaking(false);
        setError(''); // Clear any previous errors
      });

      vapiInstance.on('call-end', (endData?: any) => {
        console.log('📞 Vapi call ended:', endData);
        setIsVoiceConversationActive(false);
        setIsAISpeaking(false);
        
        // Handle different end reasons
        if (endData?.reason) {
          console.log('📞 Call end reason:', endData.reason);
          
          if (endData.reason === 'user-ended') {
            console.log('✅ User ended the call normally');
          } else if (endData.reason === 'assistant-ended') {
            console.log('🤖 Assistant ended the call');
          } else if (endData.reason === 'pipeline-error-openai-voice-failed') {
            setError('Voice service temporarily unavailable. Please try again.');
          } else if (endData.reason === 'pipeline-error-exceeded-max-duration') {
            setError('Call duration limit reached. Please start a new conversation.');
          } else if (endData.reason === 'pipeline-error-exceeded-silence-timeout') {
            setError('Call ended due to silence. Please start a new conversation.');
          } else if (endData.reason.includes('ejection')) {
            console.log(' कॉल निकाल दी गई।');
            setError('Connection lost. This can happen due to network issues or assistant configuration. Please try again.');
          } else {
            setError(`Call ended: ${endData.reason}. Please try again.`);
          }
        }
      });

      vapiInstance.on('speech-start', () => {
        console.log('🗣️ AI started speaking');
        setIsAISpeaking(true);
      });
      
      vapiInstance.on('speech-end', () => {
        console.log('🤐 AI stopped speaking');
        setIsAISpeaking(false);
      });

      vapiInstance.on('message', (message) => {
        console.log('📨 Vapi message:', message);
        
        if (message.type === 'transcript' && message.role === 'user' && message.transcript) {
          const userMessage: Message = {
            id: uuidv4(),
            sender: "user",
            content: message.transcript,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, userMessage]);
        } else if (message.type === 'assistant_message' && message.message) {
           const botMessage: Message = {
            id: message.id || uuidv4(),
            sender: "bot",
            agentName: "Dr. AI Assistant",
            content: message.message.content,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
        }
      });
      
      vapiInstance.on('error', (error) => {
        console.error('❌ Vapi Error Object:', error);
        try {
          console.error('❌ Vapi Error (JSON):', JSON.stringify(error, null, 2));
        } catch {
          console.error('❌ Vapi Error could not be stringified.');
        }
        const errorMessage = error?.message || (typeof error === 'object' && Object.keys(error).length > 0 ? `Received non-standard error object: ${JSON.stringify(error)}` : 'Unknown error. The error object was empty.');
        setError(`Voice error: ${errorMessage}. Please check microphone permissions and try again.`);
        setIsVoiceConversationActive(false);
      });

    }
    
    return () => {
      vapiRef.current?.stop();
    }
  }, []);

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
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setError("Speech recognition is not supported in this browser.")
        return
      }
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
      generateSummary(transcript)
    }
  }

  const generateSummary = async (currentTranscript: string) => {
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    if (!currentTranscript.trim()) return

    setIsProcessing(true)
    try {
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        temperature: 0.7,
        system: `You are an AI assistant that creates comprehensive summaries from voice recordings.

Your primary goal is to format the output as a professional medical report, following the structure below. However, even if the transcript does not contain specific details for every section, you must still generate a summary of the available text. Do not refuse to generate a summary based on the content.

If the content is not related to a tumor board, adapt the headings and summarize the key points discussed as best as you can.

# 🏥 Meeting Summary

## 📝 Key Discussion Points
- [Main discussion points]

## 🎯 Decisions & Action Items
- [Decisions made and follow-up actions]

## 🔬 Other Details
- [Any other relevant information]

Use professional language and clear formatting.`,
        messages: [
          {
            role: 'user',
            content: `Please summarize this tumor board discussion transcript:\n\n${currentTranscript}`
          }
        ],
      });

      const responseText = msg.content
        .map(block => ('text' in block ? block.text : ''))
        .join('');

      if (responseText) {
        setSummary(responseText);
      } else {
        throw new Error('No text content in response from Anthropic');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate summary');
    } finally {
      setIsProcessing(false)
    }
  }

  // Voice Conversation Functions
  const startVoiceConversation = async () => {
    console.log('🎤 Starting voice conversation...');
    
    // Check microphone permissions first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🎙️ Microphone access granted');
    } catch (micError) {
      console.error('🚫 Microphone access denied:', micError);
      setError('Microphone access denied. Please allow microphone permissions and try again.');
      return;
    }
    
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) {
      console.error('❌ Vapi Assistant ID is not configured.');
      setError("Vapi Assistant ID is not configured.");
      return;
    }

    console.log('📋 Building patient context...');
    const patientContext = `
Patient: ${patient.name || 'Unknown'}, Age: ${patient.age || 'Unknown'}, Sex: ${patient.sex || 'Unknown'}
Diagnosis: ${patient.diagnosis || 'Unknown'}
Stage: ${patient.tumor_stage || 'Unknown'}
Case Summary: ${patient.case_overview?.summary || 'No summary available'}
Key Biomarkers: ${patient.biomarkers?.map((b: any) => `${b.name}: ${b.result}`).join(', ') || 'No biomarkers available'}
    `.trim();
    
    console.log('🚀 Starting Vapi conversation with Assistant ID only (no overrides)...');
    console.log('📞 Vapi instance:', vapiRef.current ? 'Ready' : 'Not initialized');
    
    try {
      setError('');
      // Diagnostic step: Call the assistant by ID without any overrides.
      // This will confirm if the overrides are the source of the ejection issue.
      vapiRef.current?.start(assistantId);
      console.log('✅ Vapi start called successfully');
    } catch (error) {
      console.error('❌ Error starting Vapi:', error);
      setError(`Failed to start voice conversation: ${error}`);
    }
  };

  const stopVoiceConversation = () => {
    console.log('🛑 Stopping voice conversation...');
    try {
      vapiRef.current?.stop();
      setIsVoiceConversationActive(false);
      setIsAISpeaking(false);
      setError(''); // Clear any errors
      console.log('✅ Voice conversation stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping voice conversation:', error);
    }
  };

  const speakAIResponse = async (text: string) => {
    if (!isVoiceConversationActive) return;

    try {
      vapiRef.current?.say(text);
    } catch (error) {
      console.error('Failed to speak AI response:', error);
    }
  };

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

  const handleSendMessage = async () => {
    if (chatInput.trim() === "") return
    const newMessage = {
      id: uuidv4(),
      sender: "user" as const,
      content: chatInput,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
    setChatInput("")
    setIsBotTyping(true)

    // --- Construct the full context for Claude ---
    const context = `
      # Patient Information
      - Name: ${patient.name}
      - Age: ${patient.age}
      - Sex: ${patient.sex}
      - Diagnosis: ${patient.diagnosis}
      - Stage: ${patient.tumor_stage}

      # Case Overview
      ${patient.case_overview?.summary || 'No case overview available'}

      # Biomarkers
      ${patient.biomarkers?.map((b: { name: string; result: string; status: string; }) => `- ${b.name}: ${b.result} (Status: ${b.status})`).join('\n') || 'No biomarkers available'}

      # Image Analysis Results
      ${Object.entries(analysisResults).map(([image, result]) => 
        `## Image: ${image}\n- AI Finding: ${(result as any).finding}\n- AI Confidence: ${((result as any).confidence * 100).toFixed(1)}%`
      ).join('\n')}

      # Previous Conversation
      ${messages.map(m => `${m.agentName || m.sender}: ${m.content}`).join('\n')}
    `;

    // --- Call Claude API ---
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    try {
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        temperature: 0.7,
        system: `You are a team of AI medical specialists collaborating on a tumor board. Your team consists of Dr. AI Genetics, Dr. AI Radiology, and Dr. AI Oncology. Based on the comprehensive patient data provided below, answer the user's questions. Always respond in character as the most relevant AI specialist. Start your response with your name (e.g., "Dr. AI Radiology: ...").

        Here is the full case context:
        ${context}`,
        messages: [
          {
            role: 'user',
            content: chatInput
          }
        ],
      });

      const responseText = msg.content
        .map(block => ('text' in block ? block.text : ''))
        .join('');
      
      if (responseText) {
        const [agentName, ...contentParts] = responseText.split(': ');
        const content = contentParts.join(': ');

              const botMessage = {
        id: uuidv4(),
        sender: "bot" as const,
        agentName: agentName || "Dr. AI Assistant",
        content: content.trim(),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])

      // Speak the AI response if voice conversation is not active
      if (!isVoiceConversationActive && vapiRef.current) {
        await speakAIResponse(content.trim());
      }
      } else {
        throw new Error('No text content in response from Anthropic');
      }

    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: uuidv4(),
        sender: "bot" as const,
        agentName: "System",
        content: "Sorry, I encountered an error trying to get a response. Please check the console.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsBotTyping(false)
    }
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
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={cn("max-w-[70%] p-3 rounded-lg", msg.sender === 'user' ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-700 text-slate-200 rounded-bl-none")}>
                  {msg.sender !== 'user' && <p className="font-bold text-green-400 mb-1">{msg.agentName}</p>}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs text-slate-400 mt-2 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            {isBotTyping && (
              <div ref={messagesEndRef} />
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10">
          {error && (
            <div className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs">
              {error}
            </div>
          )}
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
              <Button 
                size="sm" 
                onClick={isVoiceConversationActive ? stopVoiceConversation : startVoiceConversation}
                className={cn(
                  "h-8 w-8 p-0",
                  isVoiceConversationActive 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-green-500 hover:bg-green-600"
                )}
                title={isVoiceConversationActive ? "Stop voice conversation" : "Start voice conversation"}
              >
                {isVoiceConversationActive ? (
                  <Square className="w-3 h-3" />
                ) : (
                  <Mic className="w-3 h-3" />
                )}
              </Button>
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
                  {isVoiceConversationActive && (
                    <span className="text-green-400 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Voice Active
                    </span>
                  )}
                  {isAISpeaking && (
                    <span className="text-blue-400 flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      AI Speaking
                    </span>
                  )}
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}