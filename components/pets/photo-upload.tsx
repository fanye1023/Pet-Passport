'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sanitizeFileName } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, X, Loader2 } from 'lucide-react'

interface PhotoUploadProps {
  value: string
  onChange: (url: string) => void
  petId?: string
}

export function PhotoUpload({ value, onChange, petId }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const safeName = sanitizeFileName(file.name)
      const fileExt = safeName.split('.').pop()
      const fileName = `${user.id}/${petId ?? 'new'}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(data.path)

      onChange(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }, [supabase, petId, onChange])

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={value || undefined} />
        <AvatarFallback>
          <Camera className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Photo'
          )}
        </Button>
        {value && !uploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4 mr-1" /> Remove
          </Button>
        )}
      </div>
    </div>
  )
}
