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
  Heart, Beaker, Monitor, ChevronDown, ChevronUp
} from 'lucide-react'
import type { Patient } from '@/lib/types'
import { transcribeAudio } from '@/lib/transcription'

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
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [transcription, setTranscription] = useState<string | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [currentView, setCurrentView] = useState("CASE OVERVIEW")
  const [showDecisionPad, setShowDecisionPad] = useState(false)
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

  // Image selection for presentation
  const [availableImages, setAvailableImages] = useState<ImageItem[]>([
    {
      id: "mri1",
      title: "Brain MRI - T2 Weighted",
      description: "Irregular mass with heterogeneous enhancement",
      type: "mri",
      url: "https://sjra.com/wp-content/uploads/2023/05/Side-By-Side-Of-Brain-MRI-Scan-Results.webp",
      selected: true
    },
    {
      id: "hist1", 
      title: "H&E Histopathology",
      description: "Grade 2 invasive ductal carcinoma",
      type: "histology",
      url: "/placeholder.svg?height=400&width=600",
      selected: true
    },
    {
      id: "ct1",
      title: "Chest CT Follow-up",
      description: "Post-treatment response assessment",
      type: "ct",
      url: "/placeholder.svg?height=400&width=600",
      selected: false
    }
  ])

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
      name: "Imaging", 
      summary: "MRI shows 2.5cm mass with satellite lesions, partial treatment response",
      keyPoints: ["Primary tumor 30% reduction", "No new lesions", "Stable lymphadenopathy"],
      selected: true,
      icon: <Monitor className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="text-base text-white/90 mb-4">Select images for presentation:</div>
          <div className="grid grid-cols-1 gap-4">
            {availableImages.map((image) => (
              <div key={image.id} className="flex items-center gap-4 p-4 rounded-lg bg-[#1a1a2e] border border-white/10 hover:bg-[#1e1e32] transition-colors">
                <Checkbox
                  checked={image.selected}
                  onCheckedChange={(checked) => {
                    setAvailableImages(prev => prev.map(img => 
                      img.id === image.id ? { ...img, selected: !!checked } : img
                    ))
                  }}
                  className="border-white/30"
                />
                <div className="w-20 h-16 bg-black rounded overflow-hidden">
                  <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-white/90 mb-1">{image.title}</div>
                  <div className="text-sm text-white/60">{image.description}</div>
                </div>
                <Badge variant="outline" className="text-sm border-white/30 text-white/70 px-3 py-1">
                  {image.type.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
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

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)
      audioChunksRef.current = []
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const transcribedText = await transcribeAudio(audioBlob)
        if (transcribedText) {
          setTranscription(transcribedText)
          setChatInput((prev) => prev + transcribedText)
        }
      }
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
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
              <Button
                size="sm"
                variant="ghost"
                className={`h-8 w-8 p-0 ${isRecording ? 'text-red-500' : 'text-white/70'}`}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
              >
                <Mic className="w-3 h-3" />
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
    </div>
  )
} 