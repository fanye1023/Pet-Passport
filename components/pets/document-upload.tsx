'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sanitizeFileName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileText, X, Loader2, ExternalLink } from 'lucide-react'

interface DocumentUploadProps {
  value: string
  onChange: (url: string) => void
  petId: string
  folder?: string
  label?: string
}

export function DocumentUpload({
  value,
  onChange,
  petId,
  folder = 'documents',
  label = 'Upload PDF'
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const safeName = sanitizeFileName(file.name)
      const fileName = `${user.id}/${petId}/${folder}/${Date.now()}-${safeName}`

      const { data, error } = await supabase.storage
        .from('pet-documents')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('pet-documents')
        .getPublicUrl(data.path)

      onChange(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }, [supabase, petId, folder, onChange])

  const inputId = `doc-upload-${folder}-${Date.now()}`

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-sm flex-1 truncate">Document attached</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => window.open(value, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <input
            type="file"
            id={inputId}
            accept="application/pdf"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById(inputId)?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {label}
              </>
            )}
          </Button>
        </>
      )}
    </div>
  )
}
