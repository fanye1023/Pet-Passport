'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Phone, Stethoscope, MapPin, X } from 'lucide-react'
import { EmergencyContact, Veterinarian } from '@/lib/types/pet'

interface EmergencyBannerProps {
  emergencyContacts: EmergencyContact[]
  veterinarians: Veterinarian[]
  petName: string
}

export function EmergencyBanner({ emergencyContacts, veterinarians, petName }: EmergencyBannerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const primaryVet = veterinarians?.find(v => v.is_primary) || veterinarians?.[0]

  const openEmergencySearch = () => {
    window.open('https://www.google.com/maps/search/24+hour+emergency+vet+near+me', '_blank')
  }

  return (
    <>
      {/* Expanded Emergency Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Emergency Options
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Emergency Contacts */}
              {emergencyContacts && emergencyContacts.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Phone className="h-5 w-5 text-red-600" />
                    Emergency Contacts
                  </h3>
                  <div className="space-y-3">
                    {emergencyContacts.map((contact) => (
                      <a
                        key={contact.id}
                        href={`tel:${contact.phone}`}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          {contact.relationship && (
                            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-red-600 font-medium">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Vet */}
              {primaryVet && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Stethoscope className="h-5 w-5 text-red-600" />
                    {petName}&apos;s Veterinarian
                  </h3>
                  {primaryVet.phone ? (
                    <a
                      href={`tel:${primaryVet.phone}`}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{primaryVet.clinic_name}</p>
                        {primaryVet.name && (
                          <p className="text-sm text-muted-foreground">{primaryVet.name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-red-600 font-medium">
                        <Phone className="h-4 w-4" />
                        {primaryVet.phone}
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{primaryVet.clinic_name}</p>
                      {primaryVet.name && (
                        <p className="text-sm text-muted-foreground">{primaryVet.name}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">No phone number on file</p>
                    </div>
                  )}
                </div>
              )}

              {/* 24/7 Emergency Rooms */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                  24/7 Emergency Vet Clinics
                </h3>
                <Button
                  onClick={openEmergencySearch}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Nearest Emergency Vet
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Opens Google Maps to search for 24-hour emergency vets near you
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Emergency Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            className="w-full border-red-400 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium py-5 shadow-sm bg-white/95 backdrop-blur-sm"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency
          </Button>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the fixed button */}
      <div className="h-20" />
    </>
  )
}
