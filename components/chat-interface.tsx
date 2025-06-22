"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { Patient } from "@/lib/types"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { BotAvatar } from "@/components/ui/bot-avatar"
import { ActionCard } from "@/components/ui/action-card"
import { Eye, Dna, FileText, TestTube, Stethoscope, Users } from "lucide-react"

interface Message {
  id: string
  sender: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: Array<{
    icon: any
    title: string
    description: string
    action: string
  }>
}

interface ChatInterfaceProps {
  patient: Patient
  onTabChange: (tab: string) => void
}

export function ChatInterface({ patient, onTabChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      content: `Hi! My name is Nila. Let's get started reviewing the case for ${patient.name}. How can I assist you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Reset chat when patient changes
    setMessages([
      {
        id: Date.now().toString(),
        sender: "assistant",
        content: `Hi! My name is Nila. Let's get started reviewing the case for ${patient.name}. How can I assist you today?`,
        timestamp: new Date(),
      },
    ])
  }, [patient])

  const getAIResponse = (userInput: string): { content: string; actions?: Array<{icon: any, title: string, description: string, action: string}> } => {
    const input = userInput.toLowerCase()

    // Radiology and imaging keywords - switch to Images tab
    if (
      input.includes("radiological") ||
      input.includes("radiology") ||
      input.includes("imaging") ||
      input.includes("image") ||
      input.includes("scan") ||
      input.includes("mri") ||
      input.includes("ct")
    ) {
      setTimeout(() => onTabChange("IMAGES"), 1500)

      if (patient.name === "Jane Doe") {
        return { content: "Switching to Images tab... I can see a suspicious 2.5 cm irregular mass in the right temporal lobe. The lesion shows irregular margins and heterogeneous enhancement pattern on T1-weighted post-contrast sequences, highly concerning for malignancy. Recommend immediate neurosurgical consultation." }
      } else {
        return { content: "Switching to Images tab... Analysis reveals a 1.8 cm spiculated nodule in the left lung lower lobe with irregular margins and associated pleural retraction. The lesion demonstrates ground-glass opacity components suspicious for adenocarcinoma. Recommend tissue confirmation." }
      }
    }

    // Biomarker keywords - switch to Biomarkers tab
    if (
      input.includes("biomarker") ||
      input.includes("molecular") ||
      input.includes("genetic") ||
      input.includes("mutation") ||
      input.includes("gene")
    ) {
      setTimeout(() => onTabChange("BIOMARKERS"), 1500)

      if (patient.name === "Jane Doe") {
        return { content: "Switching to Biomarkers tab... OmniScreen analysis identifies TP53 alterations (PPV: 0.63) and EGFR amplification (PPV: 0.36). These findings suggest potential responsiveness to targeted therapies including ceritinib, neratinib, and lapatinib. Molecular confirmation recommended for treatment planning." }
      } else {
        return { content: "Switching to Biomarkers tab... H&E-based analysis shows TP53 mutations (PPV: 0.63), EGFR alterations (PPV: 0.36), and RTK pathway involvement (PPV: 0.56). High likelihood of actionable mutations detected. Recommend comprehensive genomic profiling for precision therapy selection." }
      }
    }

    // Treatment and therapy keywords
    if (input.includes("treatment") || input.includes("therapy") || input.includes("recommend")) {
      if (patient.name === "Jane Doe") {
        return { content: "Based on imaging characteristics and biomarker profile, I recommend: 1) Core needle biopsy for definitive diagnosis, 2) Neoadjuvant chemotherapy with anti-HER2 therapy if HER2+, 3) Surgical consultation for breast-conserving surgery vs. mastectomy. Estimated treatment timeline: 6-8 months. Oncology referral initiated." }
      } else {
        return { content: "Treatment recommendations based on molecular profile: 1) EGFR-targeted therapy (osimertinib first-line), 2) Combination immunotherapy for PD-L1+ tumors, 3) Surgical evaluation if resectable. Expected response rate: 70-80% with targeted therapy. Thoracic oncology consultation scheduled." }
      }
    }

    // Report generation - more realistic response
    if (input.includes("report") || input.includes("generate") || input.includes("document")) {
      const timestamp = new Date().toLocaleString()
      const reportId = Math.random().toString(36).substr(2, 9).toUpperCase()

      return { content: `Generating comprehensive pathology report... 

📄 Report ID: ${reportId}
📧 PDF sent to: pathology@hospital.org, oncology@hospital.org
📋 Report includes: Clinical history, imaging findings, biomarker analysis, treatment recommendations
⏰ Generated: ${timestamp}
🔒 HIPAA-compliant delivery confirmed

The report has been automatically added to the patient's EMR and distributed to the multidisciplinary team.` }
    }

    // Ordering tests/stains - realistic workflow
    if (input.includes("order") || input.includes("request")) {
      const orderTime = new Date().toLocaleTimeString()

      if (input.includes("her2") || input.includes("HER2")) {
        return `🧪 HER2 IHC/FISH Order Placed
Order #: HER2-${Math.random().toString(36).substr(2, 6).toUpperCase()}
⏰ Ordered: ${orderTime}
🏥 Lab: Molecular Pathology Lab
📅 Expected results: 24-48 hours
📧 Results will auto-populate in Biomarkers tab
👨‍⚕️ Ordering physician: Dr. [Current User]

The lab has been notified and tissue blocks are being retrieved for processing.`
      } else if (input.includes("stain") || input.includes("order")) {
        return `🧪 IHC Panel Order Placed
Order #: IHC-${Math.random().toString(36).substr(2, 6).toUpperCase()}
🔬 Stains: ER, PR, Ki-67, p53
⏰ Ordered: ${orderTime}
📅 Expected completion: 18-24 hours
💰 Insurance pre-authorization: Approved
📧 Results notification: Enabled

Tissue sections are being prepared for immunohistochemical analysis.`
      } else {
        return `📋 Test Order Menu Available:
• Immunohistochemistry (ER/PR/HER2/Ki-67)
• Molecular sequencing (NGS panel)
• Additional imaging (PET/CT, Brain MRI)
• Tumor markers (CA 15-3, CEA)

Which specific tests would you like me to order? I can process the requests immediately.`
      }
    }

    // Prognosis keywords
    if (input.includes("prognosis") || input.includes("outcome") || input.includes("survival")) {
      if (patient.name === "Jane Doe") {
        return `📊 Prognostic Analysis for ${patient.name}:

Current staging: Likely T2N0M0 (pending full workup)
5-year survival estimates:
• HR+/HER2-: 92-95%
• HER2+: 87-91% 
• Triple-negative: 77-83%

Risk factors: Age (63), tumor size (2.5cm)
Favorable factors: No lymphadenopathy, early detection

🎯 Personalized risk score will be calculated once molecular subtyping is complete.`
      } else {
        return `📊 Prognostic Analysis for ${patient.name}:

Suspected stage: T1cN0M0 (pending staging)
5-year survival with targeted therapy:
• EGFR+: 65-75%
• ALK+: 70-80%
• Wild-type: 45-55%

🧬 Molecular profile suggests favorable response to precision therapy. Median PFS with osimertinib: 18.9 months.`
      }
    }

    // Staging keywords - switch to Case Overview
    if (input.includes("stage") || input.includes("staging")) {
      setTimeout(() => onTabChange("CASE OVERVIEW"), 1500)

      if (patient.name === "Jane Doe") {
        return "Switching to Case Overview... Current staging assessment: T2 (tumor >2cm), N0 (no palpable nodes), M0 (no distant mets visible). Recommend: sentinel lymph node biopsy, chest CT, bone scan if symptomatic. Staging will guide surgical approach and adjuvant therapy decisions."
      } else {
        return "Switching to Case Overview... Preliminary staging: T1c (1.8cm nodule), N0 (no mediastinal adenopathy), M0 (no distant disease). Recommend: PET/CT for mediastinal assessment, brain MRI given adenocarcinoma histology. Stage will determine surgical vs. systemic therapy approach."
      }
    }

    // Multidisciplinary team/tumor board
    if (input.includes("tumor board") || input.includes("mdt") || input.includes("multidisciplinary")) {
      const boardDate = new Date()
      boardDate.setDate(boardDate.getDate() + 3)

      return `📅 Tumor Board Presentation Scheduled

Patient: ${patient.name}
Date: ${boardDate.toLocaleDateString()} at 7:00 AM
Location: Conference Room A / Virtual Link
Attendees: Medical Oncology, Radiation Oncology, Surgery, Pathology, Radiology

 Case summary prepared and distributed
 Images uploaded to presentation system
 Biomarker data compiled
 Treatment options analysis ready

The case has been added to Thursday's multidisciplinary tumor board agenda.`
    }

    // Patient history - switch to Patient History tab
    if (input.includes("history") || input.includes("background") || input.includes("past medical")) {
      setTimeout(() => onTabChange("PATIENT HISTORY"), 1500)

      return `Switching to Patient History tab... Reviewing comprehensive medical background for ${patient.name}. Key factors include family history of cancer, current medications, and relevant comorbidities that may impact treatment planning. This information is crucial for personalized care decisions.`
    }

    // Resources and guidelines
    if (input.includes("guideline") || input.includes("resource") || input.includes("protocol")) {
      setTimeout(() => onTabChange("RESOURCES"), 1500)

      return `Switching to Resources tab... Accessing current NCCN guidelines and clinical protocols relevant to ${patient.name}'s case. I've compiled the latest evidence-based recommendations, ongoing clinical trials, and patient education materials for your review.`
    }

    // General help or unclear input
    if (input.includes("help") || input.includes("what can you do")) {
      return `🤖 Nila Genomics Capabilities:

 **Analysis & Interpretation**
• Radiological findings review → "show me the images"
• Biomarker analysis → "explain the mutations"
• Staging assessment → "what's the stage"

 **Clinical Workflow**
• Order tests → "order HER2 stain"
• Generate reports → "create pathology report"
• Treatment planning → "recommend therapy"

**Collaboration**
• Tumor board prep → "prepare for MDT"
• Case summaries → "summarize findings"
• Resource access → "show guidelines"

What would you like me to help you with today?`
    }

    // Default response for unrecognized input with action cards
    return {
      content: `Hello! I've analyzed the case for **${patient.name}**. I can assist you with several key areas of this case. Please choose what you'd like to explore:`,
      actions: [
        {
          icon: Eye,
          title: "Show radiological findings",
          description: "Review imaging with AI analysis and annotations",
          action: "Show radiological findings"
        },
        {
          icon: Dna,
          title: "Explain biomarkers",
          description: "Molecular profile interpretation and clinical significance",
          action: "Explain biomarkers"
        },
        {
          icon: Stethoscope,
          title: "Treatment recommendations",
          description: "Evidence-based therapy options and protocols",
          action: "Treatment recommendations"
        },
        {
          icon: FileText,
          title: "Generate report",
          description: "Comprehensive pathology documentation",
          action: "Generate report"
        },
        {
          icon: TestTube,
          title: "Order additional tests",
          description: "Lab and imaging requests with protocols",
          action: "Order additional tests"
        },
        {
          icon: Users,
          title: "Prepare for tumor board",
          description: "MDT presentation and case summary",
          action: "Prepare for tumor board"
        }
      ]
    }
  }

  const handleActionClick = (action: string) => {
    setInput(action)
    // Auto-send the message after a short delay to show the input was filled
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        content: input,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, userMessage])
      setInput("")

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = getAIResponse(input)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          content: aiResponse.content,
          timestamp: new Date(),
          actions: aiResponse.actions,
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a1e]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <BotAvatar />
          <div>
            <h3 className="text-sm font-medium text-white/90">Nila AI Assistant</h3>
            <p className="text-xs text-white/50">Powered by Omnyla</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-[#4a6bff] text-white"
                    : "bg-[#1a1a2e] text-white/90 border border-white/10"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.actions && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, index) => (
                      <ActionCard
                        key={index}
                        icon={action.icon}
                        title={action.title}
                        description={action.description}
                        onClick={() => handleActionClick(action.action)}
                      />
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about the patient case, imaging, biomarkers, or treatment options..."
            className="flex-1 bg-[#1a1a2e] border-white/20 text-white placeholder:text-white/50 resize-none"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="bg-[#4a6bff] hover:bg-[#4a6bff]/80 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
