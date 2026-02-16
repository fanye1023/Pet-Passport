'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Shield, Sparkles, FileText, Check } from 'lucide-react'

interface InsuranceExtractionProgressProps {
  open: boolean
  stage: 'uploading' | 'analyzing' | 'complete'
}

export function InsuranceExtractionProgress({
  open,
  stage,
}: InsuranceExtractionProgressProps) {
  const stages = [
    { id: 'uploading', label: 'Uploading document', icon: FileText },
    { id: 'analyzing', label: 'Analyzing with AI', icon: Sparkles },
    { id: 'complete', label: 'Extraction complete', icon: Check },
  ]

  const currentIndex = stages.findIndex((s) => s.id === stage)

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Processing Insurance Document
          </DialogTitle>
          <DialogDescription>
            Please wait while we extract your policy information...
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="space-y-4">
            {stages.map((s, index) => {
              const Icon = s.icon
              const isActive = index === currentIndex
              const isComplete = index < currentIndex

              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/10 border border-primary/20'
                      : isComplete
                      ? 'bg-green-500/10'
                      : 'bg-muted/50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isComplete
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-foreground'
                          : isComplete
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {s.label}
                      {isActive && (
                        <span className="inline-flex ml-1">
                          <span className="animate-[pulse_1s_ease-in-out_infinite]">.</span>
                          <span className="animate-[pulse_1s_ease-in-out_0.2s_infinite]">.</span>
                          <span className="animate-[pulse_1s_ease-in-out_0.4s_infinite]">.</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
