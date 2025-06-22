"use client"

import type { Patient } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseOverviewTab } from "@/components/tabs/case-overview-tab"
import { PatientHistoryTab } from "@/components/tabs/patient-history-tab"
import { ImagesTab } from "@/components/tabs/images-tab"
import { BiomarkersTab } from "@/components/tabs/biomarkers-tab"
import { ResourcesTab } from "@/components/tabs/resources-tab"
import { VCFAnalysisTab } from "@/components/tabs/vcf-analysis-tab"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generatePatientReport } from "@/lib/pdf-generator"
import { toast } from "sonner"
import { useState } from "react"
import { 
  FileText, 
  Image, 
  Users, 
  Upload, 
  Presentation, 
  FileUp, 
  CheckCircle2,
  Clock,
  User,
  Brain,
  Dna,
  BarChart3,
  Calendar,
  MapPin,
  Heart,
  Beaker,
  Monitor,
  Stethoscope,
  Target,
  BookOpen,
  FlaskConical,
  ChevronRight,
  ChevronLeft
} from "lucide-react"

interface WorkflowDashboardProps {
  patient: Patient
  activeWorkflowStep: string
  setActiveWorkflowStep: (step: string) => void
}

interface MeetingNote {
  id: string
  title: string
  content: string
  date: Date
  attendees: string[]
}

export function WorkflowDashboard({ patient, activeWorkflowStep, setActiveWorkflowStep }: WorkflowDashboardProps) {
  const [activeTab, setActiveTab] = useState("CASE OVERVIEW")
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([])
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteAttendees, setNewNoteAttendees] = useState("")
  const [showAddNote, setShowAddNote] = useState(false)

  // Workflow steps configuration
  const workflowSteps = [
    {
      id: "PATIENT INFORMATION",
      name: "Patient Information",
      icon: <User className="w-4 h-4" />,
      tabs: ["CASE OVERVIEW", "PATIENT HISTORY", "PRELIMINARY SCREENING"],
      description: "Review patient case and medical history"
    },
    {
      id: "IMAGE ANALYSIS",
      name: "Image Analysis",
      icon: <Image className="w-4 h-4" />,
      tabs: ["IMAGES", "BIOMARKERS"],
      description: "Analyze medical images and biomarkers"
    },
    {
      id: "TUMOR_BOARD_MEETING",
      name: "Tumor-board Meeting",
      icon: <Users className="w-4 h-4" />,
      tabs: ["MEETING NOTES", "PRESENTATION"],
      description: "Collaborative discussion and decision making"
    }
  ]

  const currentStep = workflowSteps.find(step => step.id === activeWorkflowStep) || workflowSteps[0]

  const handleGenerateReport = () => {
    try {
      // Get sample biomarkers data
      const biomarkers = [
        { name: "CEA", value: "15.2", unit: "ng/mL", status: "Elevated" },
        { name: "CA 19-9", value: "89.3", unit: "U/mL", status: "Elevated" },
        { name: "PD-L1", value: "45", unit: "%", status: "Positive" },
        { name: "MSI Status", value: "Stable", unit: "", status: "Normal" },
        { name: "TMB", value: "8.2", unit: "mut/Mb", status: "Intermediate" }
      ]

      generatePatientReport({
        patient,
        biomarkers,
        customNotes: `Patient presented with ${patient.name === "Jane Doe" ? "progressive neurological symptoms" : "persistent respiratory symptoms"}. Multidisciplinary team consultation recommended for optimal treatment planning.`
      })
      
      toast.success(`Comprehensive report generated for ${patient.name}`)
    } catch (error) {
      console.error('Report generation failed:', error)
      toast.error('Failed to generate report. Please try again.')
    }
  }

  const handleAddMeetingNote = () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      const note: MeetingNote = {
        id: Date.now().toString(),
        title: newNoteTitle,
        content: newNoteContent,
        date: new Date(),
        attendees: newNoteAttendees.split(',').map(a => a.trim()).filter(Boolean)
      }
      setMeetingNotes(prev => [note, ...prev])
      setNewNoteTitle("")
      setNewNoteContent("")
      setNewNoteAttendees("")
      setShowAddNote(false)
      toast.success("Meeting note added successfully")
    }
  }

  const handleUploadDocument = () => {
    // Simulate document upload
    toast.success("Document uploaded successfully")
  }

  const renderWorkflowStepContent = () => {
    switch (activeWorkflowStep) {
      case "PATIENT INFORMATION":
        return (
          <div className="space-y-4">
            {activeTab === "CASE OVERVIEW" && <CaseOverviewTab patient={patient} />}
            {activeTab === "PATIENT HISTORY" && <PatientHistoryTab patient={patient} />}
            {activeTab === "PRELIMINARY SCREENING" && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-[#1a1a2e] border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white/90 flex items-center">
                        <Stethoscope className="w-5 h-5 mr-2 text-blue-400" />
                        Initial Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Performance Status:</span>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">ECOG 0</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Comorbidity Index:</span>
                          <span className="text-white/90">Low (2)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Treatment Eligibility:</span>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Eligible</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a2e] border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white/90 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-purple-400" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Recurrence Risk:</span>
                          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">Moderate</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Metastatic Risk:</span>
                          <Badge variant="secondary" className="bg-red-500/20 text-red-400">High</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Treatment Response:</span>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">Expected</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-[#1a1a2e] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white/90 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-cyan-400" />
                      AI Preliminary Screening
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <h4 className="font-medium text-blue-400 mb-2">Key Findings</h4>
                        <ul className="text-sm text-blue-300 space-y-1">
                          <li>• BRCA2 pathogenic variant detected - consider PARP inhibitors</li>
                          <li>• High tumor mutational burden suggests immunotherapy benefit</li>
                          <li>• ER/PR positive status indicates endocrine therapy options</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <h4 className="font-medium text-green-400 mb-2">Treatment Recommendations</h4>
                        <ul className="text-sm text-green-300 space-y-1">
                          <li>• Primary: CDK4/6 inhibitor + endocrine therapy</li>
                          <li>• Secondary: Consider immunotherapy for high TMB</li>
                          <li>• Tertiary: PARP inhibitor for BRCA2 mutation</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )

      case "IMAGE ANALYSIS":
        return (
          <div className="space-y-4">
            {activeTab === "IMAGES" && <ImagesTab patient={patient} />}
            {activeTab === "BIOMARKERS" && <BiomarkersTab patient={patient} />}
          </div>
        )

      case "TUMOR_BOARD_MEETING":
        return (
          <div className="space-y-4">
            {activeTab === "MEETING NOTES" && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white/90">Meeting Notes</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddNote(!showAddNote)}
                      className="text-xs bg-transparent border border-[#4a6bff] text-[#4a6bff] hover:bg-[#4a6bff]/10"
                    >
                      {showAddNote ? "Cancel" : "Add Note"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUploadDocument}
                      className="text-xs bg-transparent border border-green-500 text-green-400 hover:bg-green-500/10"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload Document
                    </Button>
                  </div>
                </div>

                {showAddNote && (
                  <Card className="bg-[#1a1a2e] border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white/90">Add Meeting Note</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="noteTitle" className="text-white/70">Title</Label>
                        <Input
                          id="noteTitle"
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="Enter note title..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="noteContent" className="text-white/70">Content</Label>
                        <Textarea
                          id="noteContent"
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          className="bg-white/10 border-white/20 text-white min-h-[120px]"
                          placeholder="Enter meeting notes..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="noteAttendees" className="text-white/70">Attendees (comma-separated)</Label>
                        <Input
                          id="noteAttendees"
                          value={newNoteAttendees}
                          onChange={(e) => setNewNoteAttendees(e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="Dr. Smith, Dr. Johnson, Dr. Williams..."
                        />
                      </div>
                      <Button
                        onClick={handleAddMeetingNote}
                        className="bg-[#4a6bff] hover:bg-[#4a6bff]/80 text-white"
                      >
                        Save Note
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {meetingNotes.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No meeting notes yet. Add your first note to get started.</p>
                    </div>
                  ) : (
                    meetingNotes.map((note) => (
                      <Card key={note.id} className="bg-[#1a1a2e] border-white/10">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white/90">{note.title}</CardTitle>
                            <div className="flex items-center space-x-2 text-xs text-white/50">
                              <Calendar className="w-3 h-3" />
                              <span>{note.date.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/70 mb-4">{note.content}</p>
                          {note.attendees.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <Users className="w-3 h-3 text-white/50" />
                              <span className="text-xs text-white/50">
                                Attendees: {note.attendees.join(", ")}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === "PRESENTATION" && (
              <div className="p-6 space-y-6">
                <div className="text-center py-8">
                  <Presentation className="w-16 h-16 mx-auto mb-4 text-[#4a6bff]" />
                  <h3 className="text-xl font-semibold text-white/90 mb-2">Presentation Mode</h3>
                  <p className="text-white/70 mb-6">Switch to Board Mode to access presentation features</p>
                  <Button
                    onClick={() => {
                      // This would trigger board mode
                      toast.info("Switch to Board Mode for presentation features")
                    }}
                    className="bg-[#4a6bff] hover:bg-[#4a6bff]/80 text-white"
                  >
                    <Presentation className="w-4 h-4 mr-2" />
                    Enter Board Mode
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white/90">{patient.name}</h2>
        <div className="flex items-center space-x-4 text-xs text-white/70">
          <div>DOA: Today</div>
          <div>DOB: {patient.dob}</div>
          <div>MRN: {patient.mrn}</div>
        </div>
      </div>

      {/* Workflow Steps Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setActiveWorkflowStep(step.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeWorkflowStep === step.id
                    ? "bg-[#4a6bff] text-white"
                    : "text-white/50 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                {step.icon}
                <span className="text-sm font-medium">{step.name}</span>
              </button>
              {index < workflowSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-white/30 mx-2" />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            className="text-xs bg-transparent border border-[#4a6bff] text-[#4a6bff] hover:bg-[#4a6bff]/10"
          >
            REPORT
          </Button>
        </div>
      </div>

      {/* Step Description */}
      <div className="px-4 py-2 bg-[#1a1a2e] border-b border-white/10">
        <p className="text-sm text-white/70">{currentStep.description}</p>
      </div>

      {/* Sub-tabs for current workflow step */}
      <div className="flex items-center border-b border-white/10">
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-white/10 w-full justify-start h-12 rounded-none">
              {currentStep.tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={`text-xs font-medium px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-[#4a6bff] data-[state=active]:text-white data-[state=active]:shadow-none rounded-none ${
                    activeTab === tab ? "" : "text-white/50"
                  }`}
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {renderWorkflowStepContent()}
      </div>
    </div>
  )
} 