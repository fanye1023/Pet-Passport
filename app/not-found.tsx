import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, PawPrint } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <PawPrint className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">
            Looks like this page went for a walk and got lost!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button size="lg" asChild className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="w-full">
            <Link href="/pets">
              <Search className="h-4 w-4 mr-2" />
              Find Your Pets
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
