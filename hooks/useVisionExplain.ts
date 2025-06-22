/**
 * Custom hook for Gemini vision explanations
 */

import { useState, useCallback } from 'react';

interface ExplanationResult {
  explanation: string;
  source: string;
  latency_ms: number;
}

interface UseVisionExplainReturn {
  explanation: ExplanationResult | null;
  isLoading: boolean;
  error: string | null;
  explainImage: (file: File, query?: string) => Promise<void>;
  clearExplanation: () => void;
}

export const useVisionExplain = (): UseVisionExplainReturn => {
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explainImage = useCallback(async (file: File, query?: string) => {
    setIsLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (query) {
        formData.append('query', query);
      }

      // Use the vision API endpoint
      const response = await fetch('http://localhost:8000/explain', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Gemini quota exceeded. Please try again later.');
        } else if (response.status === 503) {
          throw new Error('Gemini service unavailable. Check API configuration.');
        } else {
          throw new Error(errorData.detail || `HTTP ${response.status}: Request failed`);
        }
      }

      const result = await response.json();
      setExplanation(result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to explain image';
      setError(errorMessage);
      console.error('Vision explanation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearExplanation = useCallback(() => {
    setExplanation(null);
    setError(null);
  }, []);

  return {
    explanation,
    isLoading,
    error,
    explainImage,
    clearExplanation,
  };
}; 