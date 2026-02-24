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

// Read EXIF orientation from image file
async function getExifOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer)
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(1) // Not a JPEG
        return
      }

      let offset = 2
      while (offset < view.byteLength) {
        const marker = view.getUint16(offset, false)
        offset += 2

        if (marker === 0xFFE1) { // APP1 marker (EXIF)
          if (view.getUint32(offset + 2, false) !== 0x45786966) {
            resolve(1) // Not EXIF
            return
          }

          const little = view.getUint16(offset + 8, false) === 0x4949
          const tags = view.getUint16(offset + 16, little)

          for (let i = 0; i < tags; i++) {
            const tagOffset = offset + 18 + i * 12
            if (view.getUint16(tagOffset, little) === 0x0112) { // Orientation tag
              resolve(view.getUint16(tagOffset + 8, little))
              return
            }
          }
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break
        } else {
          offset += view.getUint16(offset, false)
        }
      }
      resolve(1) // Default orientation
    }
    reader.onerror = () => resolve(1)
    reader.readAsArrayBuffer(file.slice(0, 65536)) // Read first 64KB for EXIF
  })
}

// Optimize image: resize if too large, fix orientation, maintain high quality
async function optimizeImage(file: File, maxSize = 1600, quality = 0.92): Promise<Blob> {
  const orientation = await getExifOrientation(file)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img

      // Swap dimensions for orientations 5-8 (rotated 90 or 270 degrees)
      const needsSwap = orientation >= 5 && orientation <= 8
      if (needsSwap) {
        [width, height] = [height, width]
      }

      // Calculate new dimensions maintaining aspect ratio
      let newWidth = width
      let newHeight = height

      if (newWidth > maxSize || newHeight > maxSize) {
        if (newWidth > newHeight) {
          newHeight = Math.round((newHeight * maxSize) / newWidth)
          newWidth = maxSize
        } else {
          newWidth = Math.round((newWidth * maxSize) / newHeight)
          newHeight = maxSize
        }
      }

      // Create canvas with correct dimensions
      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Use high-quality image smoothing
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Apply transformations based on EXIF orientation
      // 1: normal, 2: flip H, 3: rotate 180, 4: flip V
      // 5: rotate 90 CW + flip H, 6: rotate 90 CW, 7: rotate 90 CCW + flip H, 8: rotate 90 CCW
      ctx.save()
      switch (orientation) {
        case 2:
          ctx.scale(-1, 1)
          ctx.translate(-newWidth, 0)
          break
        case 3:
          ctx.translate(newWidth, newHeight)
          ctx.rotate(Math.PI)
          break
        case 4:
          ctx.scale(1, -1)
          ctx.translate(0, -newHeight)
          break
        case 5:
          ctx.rotate(Math.PI / 2)
          ctx.scale(1, -1)
          break
        case 6:
          ctx.rotate(Math.PI / 2)
          ctx.translate(0, -newHeight)
          break
        case 7:
          ctx.rotate(-Math.PI / 2)
          ctx.scale(1, -1)
          ctx.translate(-newWidth, 0)
          break
        case 8:
          ctx.rotate(-Math.PI / 2)
          ctx.translate(-newWidth, 0)
          break
      }

      // Draw image with correct scaling
      const drawWidth = needsSwap ? newHeight : newWidth
      const drawHeight = needsSwap ? newWidth : newHeight
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight)
      ctx.restore()

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
