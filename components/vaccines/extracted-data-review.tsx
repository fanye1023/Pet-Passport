'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Syringe, CalendarPlus, Trash2, Sparkles, AlertCircle } from 'lucide-react'

interface ExtractedVaccine {
  vaccine_name: string
  administered_date: string | null
  expiration_date: string | null
  veterinarian: string | null
  notes: string | null
  selected?: boolean
}

interface ExtractedReminder {
  title: string
  due_date: string
  event_type: 'vet_appointment' | 'medication'
  notes: string | null
  selected?: boolean
}

interface ExtractedDataReviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaccines: ExtractedVaccine[]
  reminders: ExtractedReminder[]
  clinicName: string | null
  onConfirm: (vaccines: ExtractedVaccine[], reminders: ExtractedReminder[]) => Promise<void>
  saving: boolean
}

export function ExtractedDataReview({
  open,
  onOpenChange,
  vaccines: initialVaccines,
  reminders: initialReminders,
  clinicName,
  onConfirm,
  saving
}: ExtractedDataReviewProps) {
  const [vaccines, setVaccines] = useState<ExtractedVaccine[]>([])
  const [reminders, setReminders] = useState<ExtractedReminder[]>([])

  // Reset state when dialog opens with new data
  useEffect(() => {
    if (open && initialVaccines.length > 0) {
      setVaccines(initialVaccines.map(v => ({ ...v, selected: true })))
    }
    if (open && initialReminders.length > 0) {
      setReminders(initialReminders.map(r => ({ ...r, selected: true })))
    }
    // Reset when dialog closes
    if (!open) {
      setVaccines([])
      setReminders([])
    }
  }, [open, initialVaccines, initialReminders])

  const handleVaccineChange = (index: number, field: keyof ExtractedVaccine, value: string | boolean) => {
    setVaccines(prev => prev.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    ))
  }

  const handleReminderChange = (index: number, field: keyof ExtractedReminder, value: string | boolean) => {
    setReminders(prev => prev.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    ))
  }

  const removeVaccine = (index: number) => {
    setVaccines(prev => prev.filter((_, i) => i !== index))
  }

  const removeReminder = (index: number) => {
    setReminders(prev => prev.filter((_, i) => i !== index))
  }

  const handleConfirm = async () => {
    const selectedVaccines = vaccines.filter(v => v.selected)
    const selectedReminders = reminders.filter(r => r.selected)
    await onConfirm(selectedVaccines, selectedReminders)
  }

  // Use props for hasData check to avoid timing issues with useEffect
  const hasData = initialVaccines.length > 0 || initialReminders.length > 0
  const selectedVaccineCount = vaccines.filter(v => v.selected).length
  const selectedReminderCount = reminders.filter(r => r.selected).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Extracted Vaccination Data
          </DialogTitle>
          <DialogDescription>
            {hasData
              ? 'Review and edit the extracted information before saving.'
              : 'No vaccination data could be extracted from this document.'}
            {clinicName && (
              <span className="block mt-1 text-foreground">
                Clinic: <strong>{clinicName}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {!hasData ? (
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              The PDF may be scanned, image-based, or in an unsupported format.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You can still save the document and add records manually.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Vaccines Section */}
            {vaccines.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Syringe className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold">Vaccinations ({selectedVaccineCount} selected)</h3>
                </div>
                <div className="space-y-3">
                  {vaccines.map((vaccine, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-colors ${
                        vaccine.selected
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                          : 'bg-muted/50 border-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={vaccine.selected}
                          onCheckedChange={(checked) =>
                            handleVaccineChange(index, 'selected', !!checked)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 grid gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={vaccine.vaccine_name}
                              onChange={(e) =>
                                handleVaccineChange(index, 'vaccine_name', e.target.value)
                              }
                              className="font-medium"
                              placeholder="Vaccine name"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVaccine(index)}
                              className="flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Administered</Label>
                              <Input
                                type="date"
                                value={vaccine.administered_date || ''}
                                onChange={(e) =>
                                  handleVaccineChange(index, 'administered_date', e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Expires</Label>
                              <Input
                                type="date"
                                value={vaccine.expiration_date || ''}
                                onChange={(e) =>
                                  handleVaccineChange(index, 'expiration_date', e.target.value)
                                }
                              />
                            </div>
                          </div>
                          {vaccine.veterinarian && (
                            <p className="text-xs text-muted-foreground">
                              Vet: {vaccine.veterinarian}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reminders Section */}
            {reminders.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarPlus className="h-4 w-4 text-green-500" />
                  <h3 className="font-semibold">
                    Upcoming Reminders ({selectedReminderCount} selected)
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    Will be added to calendar
                  </Badge>
                </div>
                <div className="space-y-3">
                  {reminders.map((reminder, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-colors ${
                        reminder.selected
                          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                          : 'bg-muted/50 border-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={reminder.selected}
                          onCheckedChange={(checked) =>
                            handleReminderChange(index, 'selected', !!checked)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 grid gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={reminder.title}
                              onChange={(e) =>
                                handleReminderChange(index, 'title', e.target.value)
                              }
                              placeholder="Reminder title"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeReminder(index)}
                              className="flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">Due Date</Label>
                              <Input
                                type="date"
                                value={reminder.due_date}
                                onChange={(e) =>
                                  handleReminderChange(index, 'due_date', e.target.value)
                                }
                              />
                            </div>
                            <Badge
                              variant={reminder.event_type === 'medication' ? 'default' : 'secondary'}
                              className="mt-5"
                            >
                              {reminder.event_type === 'medication' ? 'Medication' : 'Vet Appointment'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {hasData ? 'Skip' : 'Close'}
          </Button>
          {hasData && (
            <Button
              onClick={handleConfirm}
              disabled={saving || (selectedVaccineCount === 0 && selectedReminderCount === 0)}
            >
              {saving ? 'Saving...' : `Save ${selectedVaccineCount + selectedReminderCount} Items`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
