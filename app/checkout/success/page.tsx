import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Crown, ArrowRight } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Welcome to Pet Passport Premium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-4">
            <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
              <Crown className="h-5 w-5" />
              <span className="font-semibold">Premium Unlocked</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You now have lifetime access to all premium features.
            </p>
          </div>

          <div className="text-left space-y-2">
            <p className="text-sm font-medium">What's included:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Unlimited pet profiles</li>
              <li>• Unlimited share links</li>
              <li>• Unlimited collaborators</li>
              <li>• Calendar sync (Google, Apple, Outlook)</li>
              <li>• SMS reminders for appointments</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <Link href="/dashboard" className="block">
            <Button className="w-full" size="lg">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
