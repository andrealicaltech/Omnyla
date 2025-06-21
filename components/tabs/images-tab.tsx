"use client"

import type { Patient } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import Image from "next/image"

interface ImagesTabProps {
  patient: Patient
}

export function ImagesTab({ patient }: ImagesTabProps) {
  const [imageType, setImageType] = useState("mri")
  const [selectedImage, setSelectedImage] = useState(0) // Track which thumbnail is selected

  // Brain MRI image data
  const brainMRIImages = [
    {
      src: "https://sjra.com/wp-content/uploads/2023/05/Side-By-Side-Of-Brain-MRI-Scan-Results.webp",
      title: "Brain MRI - Axial T2 Weighted",
      description: "Irregular mass with heterogeneous enhancement"
    },
    {
      src: "/medical-images/mri 2.png",
      title: "Brain MRI - Coronal T2 Weighted", 
      description: "Coronal view showing lesion extent"
    },
    {
      src: "/medical-images/pathology 1.png",
      title: "Brain Tissue Biopsy - H&E Stain",
      description: "Histopathological analysis showing tumor cells"
    },
    {
      src: "/medical-images/pathology 2.png",
      title: "Brain Tissue Biopsy - IHC Stain",
      description: "Immunohistochemical staining for tumor markers"
    }
  ]

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white/90">
            {patient.name === "Jane Doe" ? "Brain MRI Images" : "Lung CT and Histopathology Images"}
          </h3>

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
            <h4 className="text-sm font-medium mb-2 text-white/90">AI Analysis</h4>
            <p className="text-sm text-white/70">
              {patient.name === "Jane Doe"
                ? "Suspicious area detected with 92% confidence. Features suggest malignancy: irregular margins, heterogeneous enhancement, and rapid washout kinetics."
                : "Suspicious nodule detected with 94% confidence. Features suggest malignancy: spiculated margins, pleural retraction, and ground-glass opacity."}
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
