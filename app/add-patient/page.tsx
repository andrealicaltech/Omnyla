"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Upload, FileText, Image, Brain, User, Calendar, Hash, FileUp, X, Check, Info } from "lucide-react"

export default function AddPatientPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [patientInfo, setPatientInfo] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    mrn: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    medicalHistory: "",
    currentMedications: "",
    allergies: ""
  })

  const [vcfFile, setVcfFile] = useState<File | null>(null)
  const [uploadedImages, setUploadedImages] = useState<Array<{
    file: File
    preview: string
    type: string
    aiLabel: string
  }>>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isAnalyzingVcf, setIsAnalyzingVcf] = useState(false)

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const handleVcfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.toLowerCase().endsWith('.vcf')) {
      setVcfFile(file)
      setIsAnalyzingVcf(true)
      
      // Simulate VCF analysis and auto-fill
      setTimeout(() => {
        autoFillFromVcf(file)
        setIsAnalyzingVcf(false)
      }, 1500)
    } else {
      alert('Please select a valid VCF file')
    }
  }

  const autoFillFromVcf = (file: File) => {
    // Simulate extracting patient information from VCF file
    // In a real implementation, this would parse the VCF file headers and metadata
    
    // Extract potential patient name from filename (e.g., "John_Doe_sample.vcf")
    const fileName = file.name.replace('.vcf', '').replace('.VCF', '')
    const nameParts = fileName.split(/[_\-\s]+/)
    
    let firstName = ""
    let lastName = ""
    
    if (nameParts.length >= 2) {
      firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase()
      lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase()
    } else if (nameParts.length === 1) {
      firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase()
    }
    
    // Generate a mock MRN based on the file
    const mockMrn = `MRN${Date.now().toString().slice(-6)}`
    
    // Update patient information
    setPatientInfo(prev => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      mrn: mockMrn,
      medicalHistory: prev.medicalHistory || "Patient information extracted from VCF file. Please review and update as needed."
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const preview = e.target?.result as string
          
          // AI-assisted labeling (simulated)
          const aiLabel = getAILabel(file.name)
          
          setUploadedImages(prev => [...prev, {
            file,
            preview,
            type: file.type,
            aiLabel
          }])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const getAILabel = (fileName: string): string => {
    // Simulated AI labeling based on filename
    const lowerName = fileName.toLowerCase()
    if (lowerName.includes('mri') || lowerName.includes('brain')) return 'Brain MRI'
    if (lowerName.includes('ct') || lowerName.includes('chest')) return 'Chest CT'
    if (lowerName.includes('xray') || lowerName.includes('x-ray')) return 'X-Ray'
    if (lowerName.includes('histology') || lowerName.includes('biopsy')) return 'Histology'
    if (lowerName.includes('pet')) return 'PET Scan'
    return 'Medical Image'
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Simulate processing time
    setTimeout(() => {
      setIsUploading(false)
      setUploadProgress(0)
      router.push('/dashboard')
    }, 2000)
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
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="text-white/90 hover:text-white hover:bg-white/10"
          >
            ← Back to Dashboard
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
                Add New Patient
              </h1>
              <p className="text-white/70">
                Upload patient data, VCF files, and medical images for AI-powered analysis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* VCF File Upload - Moved to the beginning */}
              <Card className="bg-[#121225]/80 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white/90 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    VCF File Upload
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Upload patient's genomic data for pharmacogenomic analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* AI Auto-fill Notification */}
                    <Alert className="bg-blue-500/10 border-blue-500/20">
                      <Info className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-blue-300">
                        <strong>AI Auto-fill:</strong> When you upload a VCF file, patient information fields will be automatically filled based on the file metadata. Please review and update the information as needed.
                      </AlertDescription>
                    </Alert>

                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".vcf"
                        onChange={handleVcfFileChange}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-white/50" />
                      <p className="text-white/70 mb-2">Drop your VCF file here or click to browse</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-[#4a6bff] text-[#4a6bff] hover:bg-[#4a6bff]/10"
                      >
                        Choose VCF File
                      </Button>
                    </div>
                    
                    {vcfFile && (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-green-400" />
                          <span className="text-white/90">{vcfFile.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isAnalyzingVcf && (
                            <div className="flex items-center text-blue-400">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                              <span className="text-sm">Analyzing...</span>
                            </div>
                          )}
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            <Check className="w-3 h-3 mr-1" />
                            Uploaded
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Patient Information */}
              <Card className="bg-[#121225]/80 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white/90 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Patient Information
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {vcfFile ? "Patient information auto-filled from VCF file. Please review and update as needed." : "Enter basic patient details and medical history"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white/90">First Name</Label>
                      <Input
                        id="firstName"
                        value={patientInfo.firstName}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white/90">Last Name</Label>
                      <Input
                        id="lastName"
                        value={patientInfo.lastName}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-white/90">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={patientInfo.dateOfBirth}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mrn" className="text-white/90">Medical Record Number</Label>
                      <Input
                        id="mrn"
                        value={patientInfo.mrn}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, mrn: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white/90">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={patientInfo.phone}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory" className="text-white/90">Medical History</Label>
                    <Textarea
                      id="medicalHistory"
                      value={patientInfo.medicalHistory}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, medicalHistory: e.target.value }))}
                      placeholder="Enter relevant medical history..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies" className="text-white/90">Allergies</Label>
                    <Input
                      id="allergies"
                      value={patientInfo.allergies}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="List any known allergies..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Medical Images Upload */}
              <Card className="bg-[#121225]/80 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white/90 flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Medical Images
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Upload MRI, CT scans, X-rays, and histology images with AI-assisted labeling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Image className="w-12 h-12 mx-auto mb-4 text-white/50" />
                      <p className="text-white/70 mb-2">Drop medical images here or click to browse</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        className="border-[#4a6bff] text-[#4a6bff] hover:bg-[#4a6bff]/10"
                      >
                        Choose Images
                      </Button>
                    </div>
                    
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative bg-black rounded-lg overflow-hidden border border-white/20">
                            <img
                              src={image.preview}
                              alt={`Medical image ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                                  <Brain className="w-3 h-3 mr-1" />
                                  {image.aiLabel}
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeImage(index)}
                                  className="h-6 w-6 p-0 text-white/50 hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-white/70 truncate">{image.file.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isUploading || !vcfFile}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing... {uploadProgress}%
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-5 h-5 mr-2" />
                      Add Patient & Analyze Data
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
} 