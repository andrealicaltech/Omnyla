"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Upload, FileText, Download, Send, Loader2, ExternalLink, MapPin } from "lucide-react"
import type { Patient } from "@/lib/types"
import type { VCFAnalysisResult, DrugRecommendation, ClinicalTrial } from "@/lib/vcf-analysis"
import { parseVCFFile, callPharmCATAPI, searchClinicalTrials, generatePharmacoReport } from "@/lib/vcf-analysis"

interface VCFAnalysisTabProps {
  patient: Patient
}

export function VCFAnalysisTab({ patient }: VCFAnalysisTabProps) {
  const [vcfFile, setVcfFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<VCFAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant", content: string }>>([])
  const [isChatLoading, setIsChatLoading] = useState(false)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.vcf')) {
        toast.error('Please select a valid VCF file (.vcf extension required)')
        event.target.value = ''
        return
      }
      
      // Check file size (back to 100MB like local version)
      const maxSize = 100 * 1024 * 1024 // 100MB (same as local version)
      if (file.size > maxSize) {
        toast.error('File size too large. Please select a file under 100MB.')
        event.target.value = ''
        return
      }
      
      setVcfFile(file)
      setAnalysisResult(null) // Clear previous results
      toast.success(`VCF file selected: ${file.name}`)
    }
  }, [])

  const analyzeVCF = useCallback(async () => {
    if (!vcfFile) return

    setIsAnalyzing(true)
    setProgress(0)

    try {
      // Prepare form data for API call
      setProgress(20)
      const formData = new FormData()
      formData.append('vcfFile', vcfFile)
      formData.append('patientName', patient.name.replace(/\s+/g, '_'))

      // Call the real PharmCAT API
      setProgress(50)
      const response = await fetch('/api/analyze-vcf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        
        // Handle specific error types
        if (response.status === 413) {
          throw new Error('File too large. Please use a smaller VCF file (under 100MB).')
        } else if (response.status === 408) {
          throw new Error('Analysis timed out. Please try with a smaller file.')
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid file format. Please check your VCF file.')
        } else {
          throw new Error(errorData.error || `Server error: ${response.statusText}`)
        }
      }

      setProgress(90)
      const result: VCFAnalysisResult = await response.json()
      
      setProgress(100)
      setAnalysisResult(result)
      
      toast.success(`Analysis complete! Found ${result.numVariants} variants, ${result.drugs.length} drug recommendations, and ${result.trials.length} clinical trials.`)
    } catch (error) {
      console.error('Analysis failed:', error)
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }, [vcfFile, patient.name])

  const handleChatSubmit = useCallback(async () => {
    if (!chatMessage.trim() || !analysisResult) return

    const userMessage = chatMessage.trim()
    setChatMessage("")
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }])
    setIsChatLoading(true)

    try {
      // Mock AI response - in production, you'd call OpenAI API
      const mockResponse = `Based on the analysis of ${analysisResult.fileName}, I can provide insights about the ${analysisResult.drugs.length} drug recommendations and ${analysisResult.trials.length} clinical trials found. ${userMessage.toLowerCase().includes('drug') ? 'The key pharmacogenomic findings suggest careful consideration of CYP2D6 and SLCO1B1 variants for drug dosing.' : userMessage.toLowerCase().includes('trial') ? 'The clinical trials found are within 250km of your location and are actively recruiting patients.' : 'Please ask specific questions about the drug recommendations or clinical trials.'}`
      
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: "assistant", content: mockResponse }])
        setIsChatLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Chat failed:', error)
      toast.error('Failed to get AI response')
      setIsChatLoading(false)
    }
  }, [chatMessage, analysisResult])

  const downloadReport = useCallback(() => {
    if (!analysisResult) {
      toast.error('No analysis results available to download')
      return
    }

    try {
      const report = generatePharmacoReport(analysisResult)
      const blob = new Blob([report], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${patient.name.replace(/\s+/g, '_')}_pharmacogenomics_report.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Pharmacogenomics report downloaded successfully')
    } catch (error) {
      console.error('Report download failed:', error)
      toast.error('Failed to download report. Please try again.')
    }
  }, [analysisResult, patient.name])

  return (
    <div className="p-6 space-y-6">
      {/* File Upload Section */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white/90 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            VCF File Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".vcf"
              onChange={handleFileUpload}
              className="bg-[#121225] border-white/20 text-white/90"
            />
            <Button
              onClick={analyzeVCF}
              disabled={!vcfFile || isAnalyzing}
              className="bg-[#4a6bff] hover:bg-[#3a5bef] text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Analyze VCF
                </>
              )}
            </Button>
          </div>
          
          {vcfFile && (
            <div className="text-sm text-white/70 space-y-1">
              <div>Selected: {vcfFile.name} ({(vcfFile.size / 1024 / 1024).toFixed(2)} MB)</div>
              {vcfFile.size > 4 * 1024 * 1024 && (
                <div className="text-amber-400 text-xs">
                  ⚠️ Large file detected. Using mock analysis data due to platform limits. For full PharmCAT analysis of large files, run locally.
                </div>
              )}
            </div>
          )}
          
          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-white/60">
                {progress < 30 ? 'Parsing VCF file...' : 
                 progress < 60 ? 'Calling PharmCAT API...' : 
                 progress < 90 ? 'Searching clinical trials...' : 'Finalizing analysis...'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#4a6bff]">{analysisResult.numVariants}</div>
                <div className="text-sm text-white/70">Variants Found</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#4a6bff]">{analysisResult.drugs.length}</div>
                <div className="text-sm text-white/70">Drug Recommendations</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#4a6bff]">{analysisResult.trials.length}</div>
                <div className="text-sm text-white/70">Clinical Trials</div>
              </CardContent>
            </Card>
          </div>

          {/* Drug Recommendations Table */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white/90">Drug Recommendations</CardTitle>
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/70">Gene</TableHead>
                    <TableHead className="text-white/70">Drug</TableHead>
                    <TableHead className="text-white/70">Recommendation</TableHead>
                    <TableHead className="text-white/70">Dosage</TableHead>
                    <TableHead className="text-white/70">Guideline</TableHead>
                    <TableHead className="text-white/70">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisResult.drugs.map((drug, index) => (
                    <TableRow key={index} className="border-white/10">
                      <TableCell className="text-white/90 font-medium">{drug.gene}</TableCell>
                      <TableCell className="text-white/90">{drug.drug}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={drug.recommendation.includes('Avoid') ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {drug.recommendation}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">{drug.dosage}</TableCell>
                      <TableCell className="text-white/70">{drug.guideline}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={drug.cpicUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Clinical Trials Grid */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90">Nearby Clinical Trials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisResult.trials.map((trial, index) => {
                  const clinicalTrialsUrl = trial.nxtId 
                    ? `https://clinicaltrials.gov/ct2/show/${trial.nxtId}`
                    : `https://clinicaltrials.gov/ct2/results?cond=${encodeURIComponent(trial.condition)}&term=${encodeURIComponent(trial.intervention)}&cntry=US&state1=NA%3AUS%3ACA&Search=Apply&recrs=a&age_v=&gndr=&type=&rslt=`
                  
                  return (
                    <Card 
                      key={index} 
                      className="bg-[#121225] border-white/10 hover:border-[#4a6bff]/50 transition-colors cursor-pointer group"
                      onClick={() => {
                        window.open(clinicalTrialsUrl, '_blank', 'noopener,noreferrer')
                        toast.success(`Opening ${trial.title} in ClinicalTrials.gov`)
                      }}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-white/90 line-clamp-2 group-hover:text-[#4a6bff] transition-colors">
                            {trial.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {trial.phase}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                              {trial.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-white/70">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {trial.city}, {trial.state} ({trial.distance}km)
                          </div>
                          <div><strong>Condition:</strong> {trial.condition}</div>
                          <div><strong>Intervention:</strong> {trial.intervention}</div>
                          <div><strong>Contact:</strong> {trial.contactInfo}</div>
                          {trial.nxtId && (
                            <div className="flex items-center gap-1">
                              <strong>NCT ID:</strong> 
                              <span className="text-[#4a6bff] group-hover:underline">{trial.nxtId}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="text-xs text-white/50">Click to view details</div>
                          <ExternalLink className="w-3 h-3 text-white/50 group-hover:text-[#4a6bff] transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90">Ask AI About Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto chat-scroll">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.role === 'user' 
                        ? 'bg-[#4a6bff] text-white' 
                        : 'bg-[#121225] text-white/90 border border-white/10'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#121225] border border-white/10 p-3 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about drug recommendations or clinical trials..."
                  className="bg-[#121225] border-white/20 text-white/90 resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleChatSubmit()
                    }
                  }}
                />
                <Button 
                  onClick={handleChatSubmit}
                  disabled={!chatMessage.trim() || isChatLoading}
                  className="bg-[#4a6bff] hover:bg-[#3a5bef] text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 