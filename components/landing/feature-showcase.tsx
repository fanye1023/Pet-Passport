'use client'

import {
  Sparkles,
  Upload,
  CheckCircle2,
  Calendar,
  Users,
  Mail,
  ChevronDown,
  AlertTriangle,
  Phone,
  Share2,
  Syringe,
  FileText,
  Heart,
  Clock,
  Shield,
} from 'lucide-react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

// ─── Mock: AI Extraction ────────────────────────────────────────────────────

function MockExtraction() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-transparent p-4">
      <div className="rounded-xl bg-card/80 backdrop-blur border shadow-2xl overflow-hidden p-5 animate-float-slow">
        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-5">
          {[
            { label: 'Upload', done: true },
            { label: 'AI Analyzing', done: true },
            { label: 'Complete', done: true },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              {i > 0 && (
                <div className="w-6 h-px bg-primary/40" />
              )}
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  step.done
                    ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {step.label}
              </div>
            </div>
          ))}
        </div>

        {/* Upload area */}
        <div className="border-2 border-dashed border-primary/20 rounded-lg p-3 mb-4 flex items-center gap-3 bg-primary/5">
          <Upload className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs font-medium">vaccine_record.pdf</p>
            <p className="text-[10px] text-muted-foreground">Uploaded successfully</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
        </div>

        {/* Extracted data card */}
        <div className="rounded-lg border bg-card p-3 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Extracted Data
          </div>

          <div className="space-y-2">
            {[
              { label: 'Rabies Vaccine', date: 'Mar 15, 2025', status: 'Current' },
              { label: 'DHPP Vaccine', date: 'Jan 8, 2025', status: 'Current' },
              { label: 'Bordetella', date: 'Nov 22, 2024', status: 'Due Soon' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Syringe className="w-3.5 h-3.5 text-primary" />
                  <div>
                    <p className="text-[11px] font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    item.status === 'Current'
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mock: Multi-Pet Calendar ───────────────────────────────────────────────

const petColors = [
  { name: 'Max', color: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-500/15' },
  { name: 'Luna', color: 'bg-green-500', text: 'text-green-500', light: 'bg-green-500/15' },
  { name: 'Bella', color: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-500/15' },
]

function MockCalendar() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dates = [12, 13, 14, 15, 16, 17, 18]

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-transparent p-4">
      <div className="rounded-xl bg-card/80 backdrop-blur border shadow-2xl overflow-hidden p-5 animate-float-slow">
        {/* Pet legend */}
        <div className="flex items-center gap-4 mb-4">
          {petColors.map((pet) => (
            <div key={pet.name} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${pet.color}`} />
              <span className="text-[11px] font-medium">{pet.name}</span>
            </div>
          ))}
        </div>

        {/* Month header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">January 2025</p>
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {days.map((d) => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">
              {d}
            </div>
          ))}
          {dates.map((date, i) => (
            <div
              key={date}
              className={`text-center text-[11px] rounded-md py-1.5 ${
                i === 2 ? 'bg-primary/10 font-semibold text-primary' : ''
              }`}
            >
              {date}
            </div>
          ))}
        </div>

        {/* Event list */}
        <div className="space-y-2">
          {[
            { pet: petColors[0], event: 'Vet Checkup', time: '10:00 AM' },
            { pet: petColors[1], event: 'Medication Due', time: '2:00 PM' },
            { pet: petColors[2], event: 'Grooming Appt', time: '4:30 PM' },
          ].map((item) => (
            <div
              key={item.event}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 ${item.pet.light}`}
            >
              <div className={`w-1 h-6 rounded-full ${item.pet.color}`} />
              <div className="flex-1">
                <p className="text-[11px] font-medium">{item.event}</p>
                <p className="text-[10px] text-muted-foreground">{item.pet.name}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Mock: Collaborative Access ─────────────────────────────────────────────

function MockCollaborators() {
  const collaborators = [
    { name: 'Sarah Johnson', email: 'sarah@email.com', role: 'Owner', initials: 'SJ', color: 'bg-primary' },
    { name: 'Mike Chen', email: 'mike@email.com', role: 'Editor', initials: 'MC', color: 'bg-blue-500' },
    { name: 'Emily Davis', email: 'emily@email.com', role: 'Viewer', initials: 'ED', color: 'bg-green-500' },
  ]

  const roleBadge = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-primary/15 text-primary'
      case 'Editor':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
      case 'Viewer':
        return 'bg-green-500/15 text-green-600 dark:text-green-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-transparent p-4">
      <div className="rounded-xl bg-card/80 backdrop-blur border shadow-2xl overflow-hidden p-5 animate-float-slow">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Pet Collaborators</p>
        </div>

        {/* Collaborator list */}
        <div className="space-y-2 mb-5">
          {collaborators.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2.5"
            >
              <div
                className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center text-white text-[10px] font-bold`}
              >
                {c.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{c.email}</p>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleBadge(c.role)}`}
              >
                {c.role}
              </span>
            </div>
          ))}
        </div>

        {/* Invite form */}
        <div className="rounded-lg border bg-card p-3 space-y-2.5">
          <p className="text-[11px] font-semibold text-primary flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            Invite Someone
          </p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-md border bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
              email@example.com
            </div>
            <div className="flex items-center gap-1 rounded-md border bg-muted/30 px-2 py-1.5 text-[11px]">
              Editor
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <div className="w-full rounded-md bg-primary px-3 py-1.5 text-center text-[11px] font-medium text-primary-foreground">
            Send Invite
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mock: Share & Emergency ────────────────────────────────────────────────

function MockSharePage() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-transparent p-4">
      <div className="rounded-xl bg-card/80 backdrop-blur border shadow-2xl overflow-hidden p-5 animate-float-slow">
        {/* Pet header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-lg">
            🐕
          </div>
          <div>
            <p className="text-sm font-semibold">Charlie</p>
            <p className="text-[11px] text-muted-foreground">Golden Retriever · 3 years</p>
          </div>
          <Share2 className="w-4 h-4 text-muted-foreground ml-auto" />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: Heart, label: 'Food', detail: 'Blue Buffalo, 2 cups/day' },
            { icon: Clock, label: 'Routine', detail: 'Walks at 8am & 6pm' },
            { icon: FileText, label: 'Allergies', detail: 'Chicken, dust mites' },
            { icon: Shield, label: 'Insurance', detail: 'Healthy Paws #4821' },
          ].map((card) => (
            <div key={card.label} className="rounded-md border bg-muted/30 p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <card.icon className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </span>
              </div>
              <p className="text-[11px] font-medium leading-tight">{card.detail}</p>
            </div>
          ))}
        </div>

        {/* Emergency banner */}
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
              Emergency Access
            </p>
            <p className="text-[10px] text-muted-foreground">
              One-tap vet contacts & nearest ER
            </p>
          </div>
          <Phone className="w-4 h-4 text-red-500" />
        </div>
      </div>
    </div>
  )
}

// ─── Feature Section Data ───────────────────────────────────────────────────

interface FeatureSection {
  title: string
  description: string
  bullets: string[]
  mock: React.ReactNode
  reversed: boolean
  muted: boolean
}

const sections: FeatureSection[] = [
  {
    title: 'AI-Powered Document Extraction',
    description:
      'Upload vaccine records or insurance PDFs and AI automatically extracts all relevant data — vaccine names, dates, policy numbers, coverage details.',
    bullets: ['Vaccine records', 'Insurance policies', 'Instant data extraction'],
    mock: <MockExtraction />,
    reversed: false,
    muted: false,
  },
  {
    title: 'Unified Calendar for All Your Pets',
    description:
      'See appointments, medications, and care events for all your pets in one calendar. Color-coded by pet so you never miss a thing.',
    bullets: ['Multi-pet support', 'Color-coded events', 'Medication reminders'],
    mock: <MockCalendar />,
    reversed: true,
    muted: true,
  },
  {
    title: 'Share With Your Whole Family',
    description:
      'Invite family members, vets, or caretakers with role-based access. Owners control everything, editors can update records, viewers can see but not change.',
    bullets: ['Role-based permissions', 'Easy email invites', 'Full audit control'],
    mock: <MockCollaborators />,
    reversed: false,
    muted: false,
  },
  {
    title: 'Instant Sharing with Emergency Access',
    description:
      'Generate a shareable link for pet sitters, dog walkers, or boarding facilities. Includes a one-tap emergency button with vet contacts and nearest emergency vet finder.',
    bullets: ['Shareable pet profiles', 'Key info at a glance', 'One-tap emergency contacts'],
    mock: <MockSharePage />,
    reversed: true,
    muted: true,
  },
]

// ─── Showcase Section ───────────────────────────────────────────────────────

function ShowcaseSection({ section }: { section: FeatureSection }) {
  const { ref: textRef, isVisible: textVisible } = useScrollAnimation()
  const { ref: mockRef, isVisible: mockVisible } = useScrollAnimation(0.05)

  return (
    <section className={section.muted ? 'bg-muted/30' : ''}>
      <div className="container mx-auto px-4 py-20">
        <div
          className={`grid gap-12 lg:grid-cols-2 items-center ${
            section.reversed ? 'lg:direction-rtl' : ''
          }`}
          style={section.reversed ? { direction: 'rtl' } : undefined}
        >
          {/* Text side */}
          <div
            ref={textRef}
            className={`transition-all duration-700 ${
              textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={section.reversed ? { direction: 'ltr' } : undefined}
          >
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              {section.title}
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg mb-6 max-w-lg">
              {section.description}
            </p>
            <ul className="space-y-2">
              {section.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock screenshot side */}
          <div
            ref={mockRef}
            className={`transition-all duration-700 delay-150 ${
              mockVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={section.reversed ? { direction: 'ltr' } : undefined}
          >
            {section.mock}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Exported Component ─────────────────────────────────────────────────────

export function FeatureShowcase() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()

  return (
    <div id="features">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div
          ref={headerRef}
          className={`text-center transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything you need for your pet
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform makes managing your pet&apos;s health records simple and stress-free.
          </p>
        </div>
      </div>

      {sections.map((section) => (
        <ShowcaseSection key={section.title} section={section} />
      ))}
    </div>
  )
}
