"use client"

import type { Patient } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import Image from "next/image"
import { Brain, Loader2, AlertCircle, Sparkles } from "lucide-react"
import { useVisionAnalysis, urlToFile } from "@/hooks/useVisionAnalysis"
import { toast } from "sonner"

interface ImagesTabProps {
  patient: Patient
}

export function ImagesTab({ patient }: ImagesTabProps) {
  const [imageType, setImageType] = useState("mri")
  const [selectedImage, setSelectedImage] = useState(0) // Track which thumbnail is selected
  const { analyze, isLoading, error, result, clearResult } = useVisionAnalysis()

  // Brain MRI image data
  const brainMRIImages = [
    {
      src: "https://sjra.com/wp-content/uploads/2023/05/Side-By-Side-Of-Brain-MRI-Scan-Results.webp",
      title: "Brain MRI - Axial T2 Weighted",
      description: "Irregular mass with heterogeneous enhancement",
      filename: "brain_mri_axial.png"
    },
    {
      src: "/medical-images/mri 2.png",
      title: "Brain MRI - Coronal T2 Weighted", 
      description: "Coronal view showing lesion extent",
      filename: "brain_mri_coronal.png"
    },
    {
      src: "/medical-images/pathology 1.png",
      title: "Brain Tissue Biopsy - H&E Stain",
      description: "Histopathological analysis showing tumor cells",
      filename: "brain_pathology_he.png"
    },
    {
      src: "/medical-images/pathology 2.png",
      title: "Brain Tissue Biopsy - IHC Stain",
      description: "Immunohistochemical staining for tumor markers",
      filename: "brain_pathology_ihc.png"
    }
  ]

  // Handle AI analysis of current image
  const handleAnalyzeImage = async (withHeatmap: boolean = false) => {
    try {
      clearResult()
      const currentImage = brainMRIImages[selectedImage]
      
      // Convert image URL to File object
      const file = await urlToFile(currentImage.src, currentImage.filename)
      
      // Run analysis
      const analysisResult = await analyze(file, withHeatmap)
      
      toast.success(`Analysis complete: ${analysisResult.label}`, {
        description: `Confidence: ${Math.round(analysisResult.confidence * 100)}%`
      })
      
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
            <div className="flex gap-2">
              <Button 
                onClick={() => handleAnalyzeImage(false)}
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
              
              <Button 
                onClick={() => handleAnalyzeImage(true)}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="border-[#4a6bff] text-[#4a6bff] hover:bg-[#4a6bff] hover:text-white"
              >
                With Heatmap
              </Button>
            </div>

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
              {imageType === "mri" ? (
                <>
                  <Image
                    src={patient.name === "Jane Doe" ? brainMRIImages[selectedImage].src : brainMRIImages[0].src}
                    alt="Medical scan"
                    fill
                    className="object-contain"
                  />
                  {patient.name === "Jane Doe" && selectedImage === 0 && (
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full border-2 border-red-500 animate-pulse"></div>
                      <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                </>
              ) : (
                <Image
                  src={patient.name === "Jane Doe" ? brainMRIImages[selectedImage].src : "/placeholder.svg?height=600&width=1000"}
                  alt="Histology image"
                  fill
                  className="object-contain"
                />
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {imageType === "mri"
                      ? patient.name === "Jane Doe"
                        ? brainMRIImages[selectedImage].title
                        : "Chest CT - Axial View"
                      : patient.name === "Jane Doe"
                        ? "Brain Tissue Biopsy - H&E Stain"
                        : "Lung Tissue Biopsy - H&E Stain"}
                  </h4>
                  <p className="text-xs text-white/70">
                    {imageType === "mri"
                      ? patient.name === "Jane Doe"
                        ? brainMRIImages[selectedImage].description
                        : "Spiculated nodule in left lower lobe"
                      : patient.name === "Jane Doe"
                        ? "Invasive ductal carcinoma"
                        : "Lung adenocarcinoma"}
                  </p>
                  {result && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-cyan-500 text-cyan-400">
                        AI: {result.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                        {Math.round(result.confidence * 100)}% confidence
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
            {patient.name === "Jane Doe" ? (
              <>
                {brainMRIImages.map((image, index) => (
                  <div 
                    key={index}
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
                      <p className="text-xs text-white/90">
                        {index === 0 ? 'Axial T2' : 
                         index === 1 ? 'Coronal T2' : 
                         index === 2 ? 'H&E Stain' : 'IHC Stain'}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Keep original placeholder structure for other cases
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square relative bg-black rounded-md overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=200&width=200"
                    alt={`Thumbnail ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))
            )}
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
                  Analyzing...
                </div>
              )}
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-sm text-red-400">{error.message}</p>
                  {error.detail && (
                    <p className="text-xs text-red-400/70 mt-1">{error.detail}</p>
                  )}
                </div>
              </div>
            )}
            
            {result ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">
                      {result.label}
                    </p>
                    <p className="text-xs text-white/60">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      result.confidence > 0.8 
                        ? 'border-green-500 text-green-400' 
                        : result.confidence > 0.6 
                          ? 'border-yellow-500 text-yellow-400'
                          : 'border-red-500 text-red-400'
                    }`}
                  >
                    {result.confidence > 0.8 ? 'High' : result.confidence > 0.6 ? 'Medium' : 'Low'} Confidence
                  </Badge>
                </div>
                
                {result.heatmap && (
                  <div className="mt-4">
                    <p className="text-xs text-white/60 mb-2">Attention Heatmap:</p>
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <Image
                        src={result.heatmap}
                        alt="Analysis heatmap"
                        fill
                        className="object-contain"
                      />
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
