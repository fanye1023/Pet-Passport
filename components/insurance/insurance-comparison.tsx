'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { petInsuranceProviders } from '@/lib/constants'
import { Shield, ExternalLink, Check } from 'lucide-react'

interface InsuranceComparisonProps {
  petName: string
}

export function InsuranceComparison({ petName }: InsuranceComparisonProps) {
  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Compare Pet Insurance for {petName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Protect {petName} with comprehensive pet insurance. Compare top providers and get a quote.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {petInsuranceProviders.map((provider) => (
            <div
              key={provider.name}
              className="relative flex flex-col p-4 rounded-xl border bg-white/50 dark:bg-white/5 hover:shadow-md transition-shadow"
            >
              {/* Highlight badge */}
              <Badge variant="secondary" className="absolute -top-2 left-3 text-xs">
                {provider.highlight}
              </Badge>

              <div className="flex items-center gap-3 mt-2 mb-3">
                <span className="text-2xl">{provider.logo}</span>
                <h3 className="font-semibold">{provider.name}</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {provider.description}
              </p>

              <ul className="space-y-1 mb-4 flex-1">
                {provider.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs">
                    <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="w-full"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Get Quote
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </a>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          We may earn a commission when you sign up through these links at no extra cost to you.
        </p>
      </CardContent>
    </Card>
  )
}
