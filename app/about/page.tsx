import Link from 'next/link'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { PawPrint, Heart, Shield, Users, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'About - Pet ShareLink',
  description: 'Learn about Pet ShareLink and our mission to simplify pet care management for pet parents everywhere.',
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <PawPrint className="h-4 w-4" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Making Pet Care{' '}
              <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Simple & Organized
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pet ShareLink was born from a simple idea: pet parents deserve a better way to keep track of their furry family members&apos; health and care information.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  We believe every pet deserves the best care possible, and every pet parent deserves peace of mind. Our mission is to empower pet owners with the tools they need to manage their pets&apos; health records, vaccinations, and care schedules effortlessly.
                </p>
                <p className="text-muted-foreground">
                  Whether you&apos;re heading to the vet, traveling with your pet, or simply want to keep everything organized, Pet ShareLink is your trusted companion for all things pet care.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-2xl p-6 text-center shadow-sm">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Pet-First</h3>
                  <p className="text-sm text-muted-foreground">Designed with your pet&apos;s wellbeing in mind</p>
                </div>
                <div className="bg-background rounded-2xl p-6 text-center shadow-sm">
                  <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Secure</h3>
                  <p className="text-sm text-muted-foreground">Your data is encrypted and protected</p>
                </div>
                <div className="bg-background rounded-2xl p-6 text-center shadow-sm">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Collaborative</h3>
                  <p className="text-sm text-muted-foreground">Share access with family and caregivers</p>
                </div>
                <div className="bg-background rounded-2xl p-6 text-center shadow-sm">
                  <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Modern</h3>
                  <p className="text-sm text-muted-foreground">Beautiful, intuitive interface</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">What We Offer</h2>
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-2">Complete Health Records</h3>
                <p className="text-muted-foreground">
                  Store and organize all your pet&apos;s vaccination records, medical history, allergies, and health conditions in one secure place. Never scramble for paperwork at the vet again.
                </p>
              </div>
              <div className="bg-muted/30 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-2">Smart Reminders</h3>
                <p className="text-muted-foreground">
                  Get notified when vaccinations are due, medications need refilling, or appointments are coming up. Our calendar sync feature works with Google Calendar, Apple Calendar, and Outlook.
                </p>
              </div>
              <div className="bg-muted/30 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-2">Easy Sharing</h3>
                <p className="text-muted-foreground">
                  Share your pet&apos;s profile with veterinarians, pet sitters, family members, or anyone who helps care for your pet. Control exactly what information they can see.
                </p>
              </div>
              <div className="bg-muted/30 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-2">Expense Tracking</h3>
                <p className="text-muted-foreground">
                  Keep track of pet care expenses and manage insurance claims. See spending summaries and track reimbursements all in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of pet parents who trust Pet ShareLink to keep their furry friends&apos; information organized and accessible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
