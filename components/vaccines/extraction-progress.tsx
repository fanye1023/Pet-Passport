'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

interface ExtractionProgressProps {
  open: boolean
  stage: 'uploading' | 'analyzing' | 'complete' | 'error'
  error?: string
}

const stages = [
  { key: 'uploading', label: 'Uploading PDF', icon: FileText },
  { key: 'analyzing', label: 'AI analyzing document', icon: Sparkles },
  { key: 'complete', label: 'Extraction complete', icon: CheckCircle2 },
]

export function ExtractionProgress({ open, stage, error }: ExtractionProgressProps) {
  const [dots, setDots] = useState('')

  // Animated dots for loading states
  useEffect(() => {
    if (stage === 'uploading' || stage === 'analyzing') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.')
      }, 500)
      return () => clearInterval(interval)
    }
  }, [stage])

  const currentStageIndex = stages.findIndex(s => s.key === stage)

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Processing Vaccination Record
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {error ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-sm text-destructive font-medium">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">
                The document will still be saved. You can add records manually.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stages.map((s, index) => {
                const isActive = s.key === stage
                const isComplete = index < currentStageIndex
                const isPending = index > currentStageIndex
                const Icon = s.icon

                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary/10 border border-primary/20'
                        : isComplete
                        ? 'bg-green-500/10'
                        : 'opacity-40'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-primary/20'
                          : isComplete
                          ? 'bg-green-500/20'
                          : 'bg-muted'
                      }`}
                    >
                      {isActive && stage !== 'complete' ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : isComplete || stage === 'complete' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isPending ? 'text-muted-foreground' : 'text-primary'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : isComplete ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {s.label}
                        {isActive && stage !== 'complete' && dots}
                      </p>
                      {isActive && s.key === 'analyzing' && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          This may take a few seconds
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
