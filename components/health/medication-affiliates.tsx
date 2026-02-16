'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { petPharmacyProviders } from '@/lib/constants'
import { Pill, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MedicationAffiliatesProps {
  petName: string
}

export function MedicationAffiliates({ petName }: MedicationAffiliatesProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Pill className="h-4 w-4 text-primary" />
          Order Medications for {petName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Save on prescriptions from trusted pet pharmacies.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {petPharmacyProviders.map((provider) => (
            <a
              key={provider.name}
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-white/50 dark:bg-white/5 hover:shadow-md hover:border-primary/30 transition-all text-center group"
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white text-lg',
                provider.color
              )}>
                {provider.logo}
              </div>
              <div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {provider.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {provider.description}
                </p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          We may earn a commission on purchases at no extra cost to you.
        </p>
      </CardContent>
    </Card>
  )
}
