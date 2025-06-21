import { useState, useCallback } from 'react'

interface VisionAnalysisResult {
  label: string
  confidence: number
  heatmap?: string
}

interface VisionAnalysisError {
  message: string
  detail?: string
}

interface UseVisionAnalysisReturn {
  analyze: (file: File, withHeatmap?: boolean) => Promise<VisionAnalysisResult>
  isLoading: boolean
  error: VisionAnalysisError | null
  result: VisionAnalysisResult | null
  clearResult: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_VISION_API_URL || 'http://localhost:8000'

export function useVisionAnalysis(): UseVisionAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<VisionAnalysisError | null>(null)
  const [result, setResult] = useState<VisionAnalysisResult | null>(null)

  const analyze = useCallback(async (
    file: File, 
    withHeatmap: boolean = false
  ): Promise<VisionAnalysisResult> => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Validate file type
      const allowedTypes = [
        'application/dicom',
        'application/octet-stream', // DICOM files often have this MIME type
        'image/png',
        'image/jpeg',
        'image/jpg'
      ]

      const allowedExtensions = ['.dcm', '.png', '.jpg', '.jpeg']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        throw new Error(`Unsupported file type: ${file.type}. Allowed types: DICOM (.dcm), PNG, JPEG`)
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Choose endpoint
      const endpoint = withHeatmap ? '/predict-with-heatmap' : '/predict'
      const url = `${API_BASE_URL}${endpoint}`

      // Make API request
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      const analysisResult: VisionAnalysisResult = await response.json()

      // Validate response
      if (!analysisResult.label || typeof analysisResult.confidence !== 'number') {
        throw new Error('Invalid response format from vision API')
      }

      setResult(analysisResult)
      return analysisResult

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      const visionError: VisionAnalysisError = {
        message: 'Analysis failed - retry',
        detail: errorMessage
      }
      
      setError(visionError)
      throw visionError

    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    analyze,
    isLoading,
    error,
    result,
    clearResult
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