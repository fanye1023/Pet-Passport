'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Wallet,
  User,
  LogIn,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeCanvas } from 'qrcode.react'

interface SaveForLaterProps {
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

function AddToHomeScreenInstructions({ deviceType }: { deviceType: DeviceType }) {
  if (deviceType === 'ios-safari') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">To add this page to your home screen:</p>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Tap the <strong>Share</strong> button <Share2 className="inline h-4 w-4" /> at the bottom of the screen</li>
          <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
          <li>Tap <strong>"Add"</strong> in the top right corner</li>
        </ol>
        <p className="text-xs text-muted-foreground">The page will appear as an app icon on your home screen for quick access.</p>
      </div>
    )
  }

  if (deviceType === 'ios-other') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">For the best experience, open this link in Safari:</p>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Copy the link below</li>
          <li>Open Safari and paste the link</li>
          <li>Tap Share <Share2 className="inline h-4 w-4" /> then "Add to Home Screen"</li>
        </ol>
      </div>
    )
  }

  if (deviceType === 'android-chrome') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">To add this page to your home screen:</p>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Tap the <strong>menu</strong> (three dots) in the top right corner</li>
          <li>Tap <strong>"Add to Home screen"</strong></li>
          <li>Tap <strong>"Add"</strong> to confirm</li>
        </ol>
        <p className="text-xs text-muted-foreground">The page will appear as an app icon on your home screen.</p>
      </div>
    )
  }

  if (deviceType === 'android-other') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">For the best experience, open this link in Chrome:</p>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Copy the link below</li>
          <li>Open Chrome and paste the link</li>
          <li>Tap menu (three dots) then "Add to Home screen"</li>
        </ol>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">To save this page for quick access:</p>
      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
        <li>Press <strong>Ctrl+D</strong> (Windows) or <strong>Cmd+D</strong> (Mac) to bookmark</li>
        <li>Or drag the URL to your bookmarks bar</li>
      </ol>
    </div>
  )
}

export function SaveForLater({ petName, shareToken }: SaveForLaterProps) {
  const router = useRouter()
  const supabase = createClient()
  const [copied, setCopied] = useState(false)
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [email, setEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [homeScreenDialogOpen, setHomeScreenDialogOpen] = useState(false)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setDeviceType(getDeviceType())
    // Construct full URL client-side
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/share/${shareToken}`)
    }
    // Check if user is logged in
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
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleEmailToSelf = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    // Open mailto link with pre-filled content
    const subject = encodeURIComponent(`${petName}'s Pet Care Info`)
    const body = encodeURIComponent(`Here's the link to ${petName}'s care information:\n\n${shareUrl}\n\nSave this email for easy access!`)
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    toast.success('Opening your email app...')
  }

  const handleSaveQRCode = () => {
    const canvas = document.getElementById('save-qr-code') as HTMLCanvasElement
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${petName.replace(/\s+/g, '-')}-pet-care-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('QR code saved!')
  }

  const handleSaveToAccount = async () => {
    if (!isLoggedIn) {
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
    toast.success(`${petName} saved to your account!`, {
      action: {
        label: 'View Saved',
        onClick: () => router.push('/saved'),
      },
    })
  }

  const handleLoginRedirect = () => {
    // Save current URL to redirect back after login
    const returnUrl = encodeURIComponent(shareUrl)
    router.push(`/login?returnTo=${returnUrl}&saveToken=${shareToken}`)
  }

  const handleSignupRedirect = () => {
    const returnUrl = encodeURIComponent(shareUrl)
    router.push(`/signup?returnTo=${returnUrl}&saveToken=${shareToken}`)
  }

  const isMobile = deviceType !== 'desktop'

  // Don't render until URL is ready
  if (!shareUrl) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bookmark className="h-5 w-5 text-primary" />
          Save for Easy Access
        </CardTitle>
        <CardDescription>
          Don't lose this link! Save it for quick access later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save to Account - Featured prominently */}
        <Button
          onClick={handleSaveToAccount}
          className="w-full"
          size="lg"
          disabled={isSaving || isSaved}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved to Account
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 mr-2" />
              Save to My Account
            </>
          )}
        </Button>

        {isSaved && (
          <p className="text-xs text-center text-muted-foreground">
            <Link href="/saved" className="text-primary hover:underline">
              View your saved pets
            </Link>
          </p>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-primary/5 px-2 text-muted-foreground">or save without account</span>
          </div>
        </div>

        {/* Copy Link */}
        <div className="flex gap-2">
          <Input
            value={shareUrl}
            readOnly
            className="text-sm bg-background"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyLink}
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Add to Home Screen */}
          <Dialog open={homeScreenDialogOpen} onOpenChange={setHomeScreenDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="truncate">{isMobile ? 'Add to Home' : 'Bookmark'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  {isMobile ? 'Add to Home Screen' : 'Save as Bookmark'}
                </DialogTitle>
                <DialogDescription>
                  Access {petName}'s info with one tap
                </DialogDescription>
              </DialogHeader>
              <AddToHomeScreenInstructions deviceType={deviceType} />
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Save QR Code */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <QrCode className="h-4 w-4" />
                <span className="truncate">Save QR Code</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Save QR Code
                </DialogTitle>
                <DialogDescription>
                  Save this QR code to your photos for quick scanning
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeCanvas
                    id="save-qr-code"
                    value={shareUrl}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {petName}'s Pet Care Info
                </p>
                <Button onClick={handleSaveQRCode} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Save to Photos
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Email to Self */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">Email to Self</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email This Link
                </DialogTitle>
                <DialogDescription>
                  Send yourself an email with the link for easy retrieval
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  onClick={handleEmailToSelf}
                  className="w-full"
                  disabled={sendingEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Open Email App
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  This will open your default email app with the link ready to send
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add to Wallet */}
          <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Wallet className="h-4 w-4" />
                <span className="truncate">Add to Wallet</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Save to Wallet
                </DialogTitle>
                <DialogDescription>
                  Access from your lock screen
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeCanvas
                      id="wallet-qr-code"
                      value={shareUrl}
                      size={160}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Save this QR code as a photo, then:
                  </p>
                  {deviceType.startsWith('ios') ? (
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Open the <strong>Photos</strong> app</li>
                      <li>Find the QR code image</li>
                      <li>Tap the share button and select <strong>"Create Watch Face"</strong> or add to a <strong>Photo Widget</strong></li>
                    </ol>
                  ) : (
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Save the QR code to your photos</li>
                      <li>Add a photo widget to your home screen</li>
                      <li>Select the QR code image for quick access</li>
                    </ol>
                  )}
                </div>
                <Button onClick={handleSaveQRCode} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Save QR Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          This link will stay active as long as the pet owner keeps it enabled
        </p>
      </CardContent>

      {/* Login/Signup Dialog for Save to Account */}
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
                  Access all saved pets from any device
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  Get notified if a link expires
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
    </Card>
  )
}
