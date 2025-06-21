"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBoardMode } from './BoardModeContext'
import { notes } from '@/lib/api/notes'
import { useSocket } from '@/hooks/useSocket'
import { toast } from 'sonner'
import { Save, Download, FileText } from 'lucide-react'
import { generateTumorBoardMinutes } from '@/lib/pdf-generator'

export function DecisionPad() {
  const [content, setContent] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  
  const { currentCase, emitPadUpdate } = useBoardMode()
  const { emitMinutesReady } = useSocket()

  const handleContentChange = useCallback((value: string) => {
    setContent(value)
    emitPadUpdate(value)
  }, [emitPadUpdate])

  const handleSaveDraft = async () => {
    if (!currentCase || !content.trim()) return

    setIsSaving(true)
    try {
      await notes.store({
        caseId: currentCase.id,
        content,
        type: 'draft',
        author: 'Current User' // Would get from auth context
      })
      toast.success('Draft saved successfully')
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinalize = async () => {
    if (!currentCase || !content.trim()) return

    setIsFinalizing(true)
    try {
      // Generate PDF directly using our new PDF generator
      generateTumorBoardMinutes(currentCase, content)

      // Emit minutes ready event for other board members
      emitMinutesReady({
        caseId: currentCase.id,
        url: `tumor-board-minutes-${currentCase.id}.pdf`
      })

      toast.success('Tumor board minutes generated and downloaded as PDF')
      
      // Clear the pad after finalization
      setContent('')
    } catch (error) {
      toast.error('Failed to generate minutes')
      console.error('PDF generation error:', error)
    } finally {
      setIsFinalizing(false)
    }
  }

  if (!currentCase) {
    return (
      <div className="h-[22%] border-t border-white/10 bg-gray-950/50 flex items-center justify-center">
        <p className="text-white/50">No case selected</p>
      </div>
    )
  }

  return (
    <div className="h-[22%] border-t border-white/10 bg-gray-950/50 p-4">
      <Card className="h-full bg-[#1a1a2e] border-white/10">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white/90 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Decision Pad - {currentCase.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                className="text-white/70 hover:text-white"
              >
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving || !content.trim()}
                className="text-white/70 border-white/20 hover:bg-white/10"
              >
                <Save className="w-3 h-3 mr-1" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                size="sm"
                onClick={handleFinalize}
                disabled={isFinalizing || !content.trim()}
                className="bg-[#4a6bff] hover:bg-[#3a5bef] text-white"
              >
                <Download className="w-3 h-3 mr-1" />
                {isFinalizing ? 'Finalizing...' : 'Finalize'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 h-[calc(100%-3rem)]">
          {isPreview ? (
            <div className="h-full overflow-auto prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-white/80 text-sm">
                {content || 'No content to preview'}
              </div>
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter your clinical notes, diagnosis, staging, treatment recommendations...

Example format:
## Clinical Summary
Patient presents with...

## Genomic Findings
VCF analysis shows...

## Recommendations
1. Treatment plan...
2. Follow-up...

## Next Steps
..."
              className="h-full resize-none bg-[#121225] border-white/20 text-white/90 text-sm"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 