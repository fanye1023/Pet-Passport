'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PawPrint, Camera, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { sanitizeFileName } from '@/lib/utils'

interface PetPhotoEditorProps {
  petId: string
  petName: string
  photoUrl: string | null
  size?: 'md' | 'lg'
}

// Read EXIF orientation from image file
async function getExifOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer)
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(1)
        return
      }

      let offset = 2
      while (offset < view.byteLength) {
        const marker = view.getUint16(offset, false)
        offset += 2

        if (marker === 0xFFE1) {
          if (view.getUint32(offset + 2, false) !== 0x45786966) {
            resolve(1)
            return
          }

          const little = view.getUint16(offset + 8, false) === 0x4949
          const tags = view.getUint16(offset + 16, little)

          for (let i = 0; i < tags; i++) {
            const tagOffset = offset + 18 + i * 12
            if (view.getUint16(tagOffset, little) === 0x0112) {
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
      resolve(1)
    }
    reader.onerror = () => resolve(1)
    reader.readAsArrayBuffer(file.slice(0, 65536))
  })
}

// Optimize image with EXIF orientation fix
async function optimizeImage(file: File, maxSize = 1600, quality = 0.92): Promise<Blob> {
  const orientation = await getExifOrientation(file)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      const needsSwap = orientation >= 5 && orientation <= 8
      if (needsSwap) {
        [width, height] = [height, width]
      }

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

      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

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

      const drawWidth = needsSwap ? newHeight : newWidth
      const drawHeight = needsSwap ? newWidth : newHeight
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight)
      ctx.restore()

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

export function PetPhotoEditor({ petId, petName, photoUrl, size = 'lg' }: PetPhotoEditorProps) {
  const [open, setOpen] = useState(false)
  const [currentPhoto, setCurrentPhoto] = useState(photoUrl)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const supabase = createClient()

  const sizeClasses = size === 'lg'
    ? 'h-28 w-28'
    : 'h-20 w-20'

  const iconSize = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10'

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const optimizedBlob = await optimizeImage(file, 1600, 0.92)
      const fileName = `${user.id}/${petId}/${Date.now()}.jpg`

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

      // Update pet record
      const { error: updateError } = await supabase
        .from('pets')
        .update({ photo_url: publicUrl })
        .eq('id', petId)

      if (updateError) throw updateError

      setCurrentPhoto(publicUrl)
      toast.success('Photo updated!')
      setOpen(false)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }, [supabase, petId])

  const handleRemove = async () => {
    setRemoving(true)

    try {
      const { error } = await supabase
        .from('pets')
        .update({ photo_url: null })
        .eq('id', petId)

      if (error) throw error

      setCurrentPhoto(null)
      toast.success('Photo removed')
      setOpen(false)
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('Failed to remove photo')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative cursor-pointer"
        aria-label="Change photo"
      >
        <Avatar className={`${sizeClasses} ring-4 ring-white/50 dark:ring-white/10 shadow-xl group-hover:ring-primary/50 transition-all`}>
          <AvatarImage src={currentPhoto || undefined} alt={petName} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
            <PawPrint className={`${iconSize} text-primary/60`} />
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-32 w-32 ring-4 ring-white/50 dark:ring-white/10 shadow-xl">
              <AvatarImage src={currentPhoto || undefined} alt={petName} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
                <PawPrint className="h-16 w-16 text-primary/60" />
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <input
                type="file"
                id="photo-change"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading || removing}
              />
              <Button
                onClick={() => document.getElementById('photo-change')?.click()}
                disabled={uploading || removing}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Upload New Photo
                  </>
                )}
              </Button>
              {currentPhoto && (
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  disabled={uploading || removing}
                >
                  {removing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
