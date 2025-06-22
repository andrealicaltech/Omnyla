"use client"

import type { Patient } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Brain, Loader2, AlertCircle, Sparkles, Eye, Cpu, FileSearch, CheckCircle } from "lucide-react"
import { useVisionAnalysis, urlToFile } from "@/hooks/useVisionAnalysis"
import { toast } from "sonner"

interface ImagesTabProps {
  patient: Patient
}

export function ImagesTab({ patient }: ImagesTabProps) {
  const [imageType, setImageType] = useState("mri")
  const [selectedImage, setSelectedImage] = useState(0)
  const [loadingStage, setLoadingStage] = useState("")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const { analyze, isLoading, error, result, clearResult } = useVisionAnalysis()

  // Loading stages simulation
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0)
      const stages = [
        { text: "Loading image data...", duration: 300, progress: 15 },
        { text: "Preprocessing image...", duration: 400, progress: 25 },
        { text: "Performing deep analysis...", duration: 600, progress: 45 },
        { text: "Computing statistics...", duration: 400, progress: 60 },
        { text: "Analyzing texture patterns...", duration: 500, progress: 75 },
        { text: "Processing medical context...", duration: 400, progress: 85 },
        { text: "Correlating findings...", duration: 500, progress: 95 },
        { text: "Finalizing analysis...", duration: 300, progress: 100 }
      ]
      
      let currentStage = 0
      const runStage = () => {
        if (currentStage < stages.length && isLoading) {
          const stage = stages[currentStage]
          setLoadingStage(stage.text)
          setLoadingProgress(stage.progress)
          
          setTimeout(() => {
            currentStage++
            runStage()
          }, stage.duration)
        }
      }
      
      runStage()
    } else {
      setLoadingStage("")
      setLoadingProgress(0)
    }
  }, [isLoading])

  const mriImages = [
    {
      src: "/medical-images/mri 1.png",
      title: "MRI Scan - Sequence 1",
      description: "T1-weighted MRI showing structural details",
      filename: "mri_1.png"
    },
    {
      src: "/medical-images/mri 2.png",
      title: "MRI Scan - Sequence 2", 
      description: "T2-weighted MRI for enhanced contrast",
      filename: "mri_2.png"
    },
    {
      src: "/medical-images/Stomach 1.png",
      title: "Stomach Imaging - Sample 1",
      description: "Gastric tissue analysis",
      filename: "stomach_1.png"
    },
    {
      src: "/medical-images/Stomach 2.png",
      title: "Stomach Imaging - Sample 2",
      description: "Additional gastric tissue examination",
      filename: "stomach_2.png"
    }
  ]
  
  const histologyImages = [
    {
      src: "/medical-images/histology 1.png",
      title: "Histology Sample 1",
      description: "Histological analysis of tissue sample",
      filename: "histology_1.png"
    },
    {
      src: "/medical-images/histology 2.png",
      title: "Histology Sample 2",
      description: "Secondary tissue histological examination",
      filename: "histology_2.png"
    },
    {
      src: "/medical-images/histology chest.jpg",
      title: "Histology Chest",
      description: "Chest tissue histological analysis",
      filename: "histology_chest.jpg"
    },
    {
      src: "/medical-images/histology liver.jpg",
      title: "Histology Liver",
      description: "Hepatic tissue histological analysis",
      filename: "histology_liver.jpg"
    }
  ]

  const imagesToShow = imageType === 'mri' ? mriImages : histologyImages;

  // Handle AI analysis of current image
  const handleAnalyzeImage = async () => {
    try {
      clearResult()
      const currentImage = imagesToShow[selectedImage]
      if (!currentImage) return;
      
      // Convert image URL to File object
      const file = await urlToFile(currentImage.src, currentImage.filename)
      
      // Run analysis
      const analysisResult = await analyze(file, false)
      
      if (analysisResult && analysisResult.primary_prediction) {
        toast.success(`Analysis complete: ${analysisResult.primary_prediction.condition}`, {
          description: `Confidence: ${analysisResult.primary_prediction.percentage}`
        })
      } else {
        toast.success('Analysis complete', {
          description: 'Results available in the analysis panel'
        })
      }
      
    } catch (err) {
      console.error('Analysis failed:', err)
      toast.error('Analysis failed', {
        description: 'Please try again or check your connection'
      })
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white/90">
              {patient.name === "Jane Doe" ? "Brain MRI Images" : "Lung CT and Histopathology Images"}
            </h3>
            {result && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Brain className="w-3 h-3 mr-1" />
                AI Analyzed
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => handleAnalyzeImage()}
              disabled={isLoading}
              size="sm"
              className="bg-[#4a6bff] hover:bg-[#3d5ae6] text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Analyze
            </Button>

            <Tabs value={imageType} onValueChange={setImageType} className="w-auto">
              <TabsList className="bg-[#1a1a30]">
                <TabsTrigger value="mri" className="text-xs">
                  {patient.name === "Jane Doe" ? "MRI" : "CT"}
                </TabsTrigger>
                <TabsTrigger value="histology" className="text-xs">
                  Histology
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <div className="aspect-[16/9] relative">
              <Image
                src={imagesToShow.length > 0 ? imagesToShow[selectedImage]?.src : "/placeholder.svg"}
                alt={imagesToShow.length > 0 ? imagesToShow[selectedImage]?.title : "No image"}
                fill
                className="object-contain"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {imagesToShow.length > 0 ? imagesToShow[selectedImage]?.title : "N/A"}
                  </h4>
                  <p className="text-xs text-white/70">
                    {imagesToShow.length > 0 ? imagesToShow[selectedImage]?.description : "N/A"}
                  </p>
                  {result && result.primary_prediction && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-cyan-500 text-cyan-400">
                        AI: {result.primary_prediction.condition}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                        {result.primary_prediction.percentage}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="text-xs text-white/50">
                  {patient.name === "Jane Doe" ? "August 15, 2024" : "August 12, 2024"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {imagesToShow.map((image, index) => (
              <div 
                key={image.filename}
                className={`aspect-square relative bg-black rounded-md overflow-hidden border cursor-pointer transition-all hover:border-[#4a6bff] ${selectedImage === index ? 'border-[#4a6bff] ring-2 ring-[#4a6bff]/30' : 'border-white/20'}`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1">
                  <p className="text-xs text-white/90 truncate">
                    {image.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1a1a30] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white/90 flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#4a6bff]" />
                BiomedCLIP Analysis
              </h4>
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing...
                </div>
              )}
            </div>
            
            {/* Enhanced Loading Animation */}
            {isLoading && (
              <div className="space-y-4 mb-4">
                <div className="bg-[#0a0a20] rounded-lg p-4 border border-[#4a6bff]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <Cpu className="w-5 h-5 text-[#4a6bff] animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">AI Analysis in Progress</p>
                      <p className="text-xs text-white/60">{loadingStage}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-[#1a1a30] rounded-full h-2 mb-3">
                    <div 
                      className="bg-gradient-to-r from-[#4a6bff] to-cyan-400 h-2 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Processing Steps */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className={`flex items-center gap-1 text-xs ${loadingProgress > 20 ? 'text-green-400' : 'text-white/40'}`}>
                      {loadingProgress > 20 ? <CheckCircle className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      Image Load
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${loadingProgress > 50 ? 'text-green-400' : 'text-white/40'}`}>
                      {loadingProgress > 50 ? <CheckCircle className="w-3 h-3" /> : <FileSearch className="w-3 h-3" />}
                      Analysis
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${loadingProgress > 80 ? 'text-green-400' : 'text-white/40'}`}>
                      {loadingProgress > 80 ? <CheckCircle className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                      Processing
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${loadingProgress >= 100 ? 'text-green-400' : 'text-white/40'}`}>
                      {loadingProgress >= 100 ? <CheckCircle className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                      Complete
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}
            
            {result && result.primary_prediction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">
                      {result.primary_prediction.condition}
                    </p>
                    <p className="text-xs text-white/60">
                      Confidence: {result.primary_prediction.percentage}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      result.primary_prediction.confidence > 0.8 
                        ? 'border-green-500 text-green-400' 
                        : result.primary_prediction.confidence > 0.6 
                          ? 'border-yellow-500 text-yellow-400'
                          : 'border-red-500 text-red-400'
                    }`}
                  >
                    {result.primary_prediction.confidence > 0.8 ? 'High' : result.primary_prediction.confidence > 0.6 ? 'Medium' : 'Low'} Confidence
                  </Badge>
                </div>
                
                {/* Enhanced Analysis Details */}
                {result.image_info && (
                  <div className="bg-[#0a0a20] rounded-lg p-3 border border-white/10">
                    <h5 className="text-xs font-medium text-white/80 mb-2 flex items-center gap-1">
                      <FileSearch className="w-3 h-3" />
                      Analysis Details
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-white/50">Image Type:</span>
                        <span className="text-white/80 ml-1">{result.image_info.category}</span>
                      </div>
                      {result.analysis_metadata?.processing_time && (
                        <div>
                          <span className="text-white/50">Processing:</span>
                          <span className="text-white/80 ml-1">{result.analysis_metadata.processing_time}</span>
                        </div>
                      )}
                      {result.analysis_metadata?.model && (
                        <div className="col-span-2">
                          <span className="text-white/50">Model:</span>
                          <span className="text-white/80 ml-1">{result.analysis_metadata.model}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Clinical Insights */}
                {result.clinical_insights && result.clinical_insights.length > 0 && (
                  <div className="bg-[#0a0a20] rounded-lg p-3 border border-white/10">
                    <h5 className="text-xs font-medium text-white/80 mb-2 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      Clinical Insights
                    </h5>
                    <div className="space-y-1">
                      {result.clinical_insights.slice(0, 3).map((insight, index) => (
                        <p key={index} className="text-xs text-white/70">
                          • {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                

                
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-white/50">
                    Analysis powered by Microsoft BiomedCLIP - a vision-language model trained on medical imaging data.
                  </p>
                </div>
              </div>
            ) : !isLoading && !error && (
              <p className="text-sm text-white/70">
                Click "Analyze" to run AI analysis on the current image using BiomedCLIP. 
                This will classify the medical condition and provide confidence scores.
              </p>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
