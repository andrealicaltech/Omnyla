import { useState } from 'react'

interface VisionAnalysisResult {
  success: boolean
  primary_prediction: {
    condition: string
    confidence: number
    percentage: string
  }
  top_predictions: Array<{
    condition: string
    confidence: number
    percentage: string
  }>
  specialty_analysis: Record<string, Array<{
    0: string // condition
    1: number // confidence
  }>>
  image_info: {
    category: string
    size: string
    mode: string
    hash?: string
  }
  clinical_insights: string[]
  analysis_metadata: {
    model: string
    conditions_analyzed: number
    specialties_covered: number
    processing_time?: string
  }
  heatmap_available?: boolean
  attention_regions?: Array<{
    region: string
    attention: number
  }>
}

interface AnalysisResponse {
  status: string
  filename: string
  analysis: VisionAnalysisResult
}

export function useVisionAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<Record<string, VisionAnalysisResult>>({})
  const [error, setError] = useState<string | null>(null)

  const analyzeImage = async (imageFile: File): Promise<VisionAnalysisResult | null> => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const apiUrl = process.env.NEXT_PUBLIC_VISION_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const data: AnalysisResponse = await response.json()
      
      if (data.status === 'success' && data.analysis.success) {
        setResults(prev => ({
          ...prev,
          [imageFile.name]: data.analysis
        }))
        return data.analysis
      } else {
        throw new Error('Analysis failed - invalid response')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      console.error('Vision analysis error:', err)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeImageWithHeatmap = async (imageFile: File): Promise<VisionAnalysisResult | null> => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const apiUrl = process.env.NEXT_PUBLIC_VISION_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/predict-with-heatmap`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Heatmap analysis failed: ${response.statusText}`)
      }

      const data: AnalysisResponse = await response.json()
      
      if (data.status === 'success' && data.analysis.success) {
        setResults(prev => ({
          ...prev,
          [imageFile.name]: data.analysis
        }))
        return data.analysis
      } else {
        throw new Error('Heatmap analysis failed - invalid response')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Heatmap analysis failed'
      setError(errorMessage)
      console.error('Heatmap analysis error:', err)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getResult = (filename: string): VisionAnalysisResult | null => {
    return results[filename] || null
  }

  const clearResults = () => {
    setResults({})
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  // Backward compatibility aliases
  const analyze = async (file: File, withHeatmap: boolean = false) => {
    return withHeatmap ? analyzeImageWithHeatmap(file) : analyzeImage(file)
  }

  const clearResult = clearResults
  const isLoading = isAnalyzing
  const result = results[Object.keys(results)[0]] || null

  return {
    analyzeImage,
    analyzeImageWithHeatmap,
    getResult,
    clearResults,
    clearError,
    isAnalyzing,
    results,
    error,
    // Backward compatibility
    analyze,
    clearResult,
    isLoading,
    result,
  }
}

// Utility function to convert image URL to File object
export async function urlToFile(url: string, filename: string): Promise<File> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    return new File([blob], filename, { type: blob.type })
  } catch (error) {
    throw new Error(`Failed to convert URL to file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Utility function to handle file selection
export function createFileFromBlob(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type })
} 