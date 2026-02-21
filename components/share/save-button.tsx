'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Bookmark,
  Copy,
  Check,
  Smartphone,
  Mail,
  QrCode,
  Share2,
  Download,
  ChevronDown,
  User,
  LogIn,
  Loader2,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeCanvas } from 'qrcode.react'

interface SaveButtonProps {
  petName: string
  shareToken: string
}

type DeviceType = 'ios-safari' | 'ios-other' | 'android-chrome' | 'android-other' | 'desktop'

function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop'

  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isAndroid = /android/.test(ua)
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua)
  const isChrome = /chrome/.test(ua)

  if (isIOS && isSafari) return 'ios-safari'
  if (isIOS) return 'ios-other'
  if (isAndroid && isChrome) return 'android-chrome'
  if (isAndroid) return 'android-other'
  return 'desktop'
}

export function SaveButton({ petName, shareToken }: SaveButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [shareUrl, setShareUrl] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [homeScreenDialogOpen, setHomeScreenDialogOpen] = useState(false)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)

  useEffect(() => {
    setDeviceType(getDeviceType())
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/share/${shareToken}`)
    }
    checkAuthStatus()
  }, [shareToken])

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsLoggedIn(!!user)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleSaveToAccount = async () => {
    if (!isLoggedIn) {
      setOpen(false)
      setAccountDialogOpen(true)
      return
    }

    setIsSaving(true)
    const { data, error } = await supabase.rpc('save_share_link', {
      p_share_token: shareToken,
    })

    setIsSaving(false)

    if (error || data?.error) {
      toast.error(data?.error || 'Failed to save')
      return
    }

    setIsSaved(true)
    setOpen(false)
    toast.success(`Saved to your account!`, {
      action: {
        label: 'View',
        onClick: () => router.push('/saved'),
      },
    })
  }

  const handleSaveQRCode = () => {
    const canvas = document.getElementById('hero-qr-code') as HTMLCanvasElement
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${petName.replace(/\s+/g, '-')}-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('QR code saved!')
  }

  const handleLoginRedirect = () => {
    const returnUrl = encodeURIComponent(shareUrl)
    router.push(`/login?returnTo=${returnUrl}&saveToken=${shareToken}`)
  }

  const handleSignupRedirect = () => {
    const returnUrl = encodeURIComponent(shareUrl)
    router.push(`/signup?returnTo=${returnUrl}&saveToken=${shareToken}`)
  }

  const isMobile = deviceType !== 'desktop'

  if (!shareUrl) return null

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4 bg-white/80 dark:bg-white/20 backdrop-blur-sm hover:bg-white dark:hover:bg-white/30 text-foreground gap-2"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                Save for Later
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4" align="center">
          <div className="space-y-3">
            <div className="text-center pb-2 border-b">
              <p className="font-medium text-sm">Save {petName}'s Profile</p>
              <p className="text-xs text-muted-foreground mt-1">
                Quick access whenever you need it
              </p>
            </div>

            {/* Save to Account - Featured */}
            <div className="rounded-lg bg-primary/5 p-3 space-y-2">
              <Button
                onClick={handleSaveToAccount}
                className="w-full"
                disabled={isSaving || isSaved}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isSaved ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Bookmark className="h-4 w-4 mr-2" />
                )}
                {isSaved ? 'Saved to Account' : 'Save to My Account'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Access from any device, anytime
              </p>
            </div>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-popover px-2 text-muted-foreground">other options</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Copy Link */}
              <Button
                variant="outline"
                size="sm"
                className="w-full flex-col h-auto py-3 gap-1"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
                <span className="text-xs">Copy Link</span>
              </Button>

              {/* Save QR Code */}
              <Button
                variant="outline"
                size="sm"
                className="w-full flex-col h-auto py-3 gap-1"
                onClick={() => {
                  setOpen(false)
                  setQrDialogOpen(true)
                }}
              >
                <QrCode className="h-5 w-5" />
                <span className="text-xs">QR Code</span>
              </Button>

              {/* Add to Home Screen */}
              <Button
                variant="outline"
                size="sm"
                className="w-full flex-col h-auto py-3 gap-1"
                onClick={() => {
                  setOpen(false)
                  setHomeScreenDialogOpen(true)
                }}
              >
                <Smartphone className="h-5 w-5" />
                <span className="text-xs">{isMobile ? 'Home Screen' : 'Bookmark'}</span>
              </Button>

              {/* Add to Wallet */}
              <Button
                variant="outline"
                size="sm"
                className="w-full flex-col h-auto py-3 gap-1"
                onClick={() => {
                  setOpen(false)
                  setWalletDialogOpen(true)
                }}
              >
                <Wallet className="h-5 w-5" />
                <span className="text-xs">Wallet</span>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground pt-1">
              Link stays active while the owner keeps it enabled
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {/* Login/Signup Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Save to Your Account
            </DialogTitle>
            <DialogDescription>
              Create a free account to save pet profiles shared with you
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Why create an account?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  Access saved pets from any device
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  See all pets shared with you in one place
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  It's completely free!
                </li>
              </ul>
            </div>
            <div className="grid gap-2">
              <Button onClick={handleSignupRedirect} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Create Free Account
              </Button>
              <Button variant="outline" onClick={handleLoginRedirect} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                I Already Have an Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Save QR Code
            </DialogTitle>
            <DialogDescription>
              Save to your photos for quick scanning
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeCanvas
                id="hero-qr-code"
                value={shareUrl}
                size={180}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-muted-foreground">{petName}'s Care Info</p>
            <Button onClick={handleSaveQRCode} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Save to Photos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Home Screen Dialog */}
      <Dialog open={homeScreenDialogOpen} onOpenChange={setHomeScreenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {isMobile ? 'Add to Home Screen' : 'Bookmark This Page'}
            </DialogTitle>
            <DialogDescription>
              Quick access to {petName}'s info
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {deviceType === 'ios-safari' && (
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Tap <Share2 className="inline h-4 w-4" /> at the bottom</li>
                <li>Scroll and tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong></li>
              </ol>
            )}
            {deviceType === 'android-chrome' && (
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Tap the <strong>menu</strong> (⋮) in the top right</li>
                <li>Tap <strong>"Add to Home screen"</strong></li>
                <li>Tap <strong>"Add"</strong></li>
              </ol>
            )}
            {(deviceType === 'ios-other' || deviceType === 'android-other') && (
              <p className="text-sm text-muted-foreground">
                Copy the link and open it in {deviceType.startsWith('ios') ? 'Safari' : 'Chrome'} to add to your home screen.
              </p>
            )}
            {deviceType === 'desktop' && (
              <p className="text-sm text-muted-foreground">
                Press <strong>Ctrl+D</strong> (Windows) or <strong>Cmd+D</strong> (Mac) to bookmark this page.
              </p>
            )}
            <Button variant="outline" className="w-full" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Dialog */}
      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Add to Wallet
            </DialogTitle>
            <DialogDescription>
              Access {petName}'s info from your lock screen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <QRCodeCanvas
                  id="wallet-qr-code"
                  value={shareUrl}
                  size={160}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm font-medium">{petName}'s Pet Care Info</p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              {deviceType.startsWith('ios') ? (
                <>
                  <p className="text-sm font-medium">For Apple Wallet:</p>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Save the QR code to your Photos</li>
                    <li>Open the <strong>Shortcuts</strong> app</li>
                    <li>Create a shortcut that opens this link</li>
                    <li>Add the shortcut to your Lock Screen</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2">
                    Or add a Photo Widget with the QR code for quick scanning
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">For Google Wallet:</p>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Save the QR code to your Photos</li>
                    <li>Add a <strong>Photo Widget</strong> to your home screen</li>
                    <li>Select the QR code image</li>
                    <li>Scan anytime for quick access</li>
                  </ol>
                </>
              )}
            </div>

            <Button onClick={handleSaveQRCode} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Save QR Code to Photos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
