import Link from 'next/link'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle } from 'lucide-react'

export const metadata = {
  title: 'FAQ - Pet ShareLink',
  description: 'Frequently asked questions about Pet ShareLink - your digital pet health record manager.',
}

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is Pet ShareLink?',
        a: 'Pet ShareLink is a digital platform that helps pet owners organize and manage their pets\' health records, vaccinations, medications, appointments, and care information all in one secure place. Think of it as a digital health folder for your furry family members.',
      },
      {
        q: 'Is Pet ShareLink free to use?',
        a: 'Yes! Pet ShareLink offers a generous free tier that includes up to 2 pet profiles with full access to health records, vaccinations, shareable links, emergency contacts, food & routine tracking, and calendar sync. For families with more pets or those who want expense tracking and insurance claim management, we offer a Pro plan at $5/month.',
      },
      {
        q: 'How do I add my pet?',
        a: 'After creating an account, click "Add Pet" on your dashboard. You\'ll be guided through entering your pet\'s basic information like name, species, breed, and birthday. You can also upload a photo to personalize their profile.',
      },
      {
        q: 'Can I add multiple pets?',
        a: 'Yes! The free plan includes up to 2 pet profiles, which is perfect for most households. If you have more pets, our Pro plan ($5/month) gives you unlimited pet profiles.',
      },
      {
        q: 'What\'s included in the Pro plan?',
        a: 'The Pro plan includes everything in Free, plus: unlimited pet profiles, expense tracking with reports, insurance claim management, priority support, and early access to new features. It\'s perfect for families with multiple pets or those who want to track pet-related spending.',
      },
    ],
  },
  {
    category: 'Health Records & Vaccinations',
    questions: [
      {
        q: 'How do I add vaccination records?',
        a: 'Navigate to your pet\'s profile and click on "Vaccines." You can manually enter vaccination details or upload a PDF of your vaccination certificate. Our system can automatically extract information from uploaded documents.',
      },
      {
        q: 'Will I get reminders when vaccinations are due?',
        a: 'Yes! Pet ShareLink tracks expiration dates for all vaccinations and will alert you when vaccines are expiring soon or have expired. You can also sync these dates to your personal calendar.',
      },
      {
        q: 'Can I store medical documents?',
        a: 'Yes, you can upload PDF documents for vaccinations, health records, insurance policies, and more. All documents are securely stored and easily accessible whenever you need them.',
      },
      {
        q: 'How do I track my pet\'s medical history?',
        a: 'Use the "Health" section to log checkups, surgeries, treatments, allergies, and ongoing conditions. Each entry can include dates, descriptions, veterinarian notes, and attached documents.',
      },
    ],
  },
  {
    category: 'Sharing & Collaboration',
    questions: [
      {
        q: 'Can I share my pet\'s information with others?',
        a: 'Yes! You can create shareable links to give veterinarians, pet sitters, or family members access to your pet\'s profile. You control exactly which sections they can see, and you can set PIN protection for extra security.',
      },
      {
        q: 'Can multiple people manage the same pet?',
        a: 'Yes, you can invite collaborators to help manage your pet\'s profile. Assign them as "Editors" who can make changes, or "Viewers" who can only see information. Perfect for families or shared pet ownership.',
      },
      {
        q: 'How do I invite a collaborator?',
        a: 'Go to your pet\'s "Collaborators" section and enter the email address of the person you want to invite. They\'ll receive an email with a link to accept the invitation and create an account if needed.',
      },
    ],
  },
  {
    category: 'Calendar & Reminders',
    questions: [
      {
        q: 'How does the calendar work?',
        a: 'The calendar lets you schedule and track all pet care events including vet appointments, grooming sessions, medication schedules, and more. You can set one-time or recurring events.',
      },
      {
        q: 'Can I sync events to my phone\'s calendar?',
        a: 'Yes! Pet ShareLink generates an ICS feed URL that you can subscribe to in Google Calendar, Apple Calendar, Outlook, or any calendar app that supports subscriptions. Your pet care events will automatically appear in your calendar.',
      },
      {
        q: 'How do recurring events work?',
        a: 'When creating an event, you can set it to repeat daily, weekly, bi-weekly, monthly, or yearly. Great for regular medications, grooming appointments, or feeding schedules.',
      },
    ],
  },
  {
    category: 'Expenses & Insurance',
    questions: [
      {
        q: 'Can I track pet expenses?',
        a: 'Yes! The Expenses feature lets you log all pet-related spending including vet visits, medications, grooming, food, and supplies. You can attach receipts and see spending summaries by category.',
      },
      {
        q: 'How do I manage insurance claims?',
        a: 'You can file and track insurance claims directly in Pet ShareLink. Link expenses to claims, track claim status from submission to reimbursement, and see your total reimbursement amounts.',
      },
    ],
  },
  {
    category: 'Security & Privacy',
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes, security is a top priority. All data is encrypted in transit and at rest. We use industry-standard security practices and your information is never sold to third parties.',
      },
      {
        q: 'Can I delete my data?',
        a: 'Yes, you have full control over your data. You can delete individual records, entire pet profiles, or your entire account at any time. When deleted, your data is permanently removed from our systems.',
      },
      {
        q: 'Who can see my pet\'s information?',
        a: 'Only you and people you explicitly share with can see your pet\'s information. You control all sharing through share links and collaborator invitations.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="h-4 w-4" />
              Help Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about Pet ShareLink. Can&apos;t find what you&apos;re looking for? Feel free to contact us.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-8 px-4 pb-20">
          <div className="container mx-auto max-w-3xl">
            {faqs.map((category, categoryIndex) => (
              <div key={category.category} className="mb-10">
                <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="bg-muted/30 rounded-lg px-4 border-none"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;re here to help. Reach out to our support team and we&apos;ll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="mailto:support@petsharelink.com">
                <Button variant="outline">Contact Support</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started Free</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
