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

// Optimize image: resize if too large, maintain high quality
async function optimizeImage(file: File, maxSize = 1600, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Only resize if image is larger than maxSize
      let { width, height } = img
      if (width <= maxSize && height <= maxSize) {
        // Image is small enough, return original
        resolve(file)
        return
      }

      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Use high-quality image smoothing
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob with high quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Could not create blob'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = URL.createObjectURL(file)
  })
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

      // Optimize image (resize if > 1600px, 92% quality JPEG)
      const optimizedBlob = await optimizeImage(file, 1600, 0.92)
      const fileName = `${user.id}/${petId ?? 'new'}/${Date.now()}.jpg`

      const { data, error } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, optimizedBlob, {
          upsert: true,
          contentType: 'image/jpeg'
        })

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
