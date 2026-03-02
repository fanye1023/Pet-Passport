import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { FileText, ChevronRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Pet ShareLink',
  description: 'Pet ShareLink Terms of Service - The terms and conditions governing your use of our service.',
}

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'description', title: 'Description of Service' },
  { id: 'accounts', title: 'User Accounts' },
  { id: 'content', title: 'User Content' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'sharing', title: 'Sharing and Collaboration' },
  { id: 'subscriptions', title: 'Subscriptions and Payments' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'medical-disclaimer', title: 'Medical Disclaimer' },
  { id: 'warranties', title: 'Disclaimer of Warranties' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'termination', title: 'Termination' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'severability', title: 'Severability' },
  { id: 'entire-agreement', title: 'Entire Agreement' },
  { id: 'contact', title: 'Contact Us' },
]

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 px-4 border-b bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FileText className="h-4 w-4" />
              Legal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: March 2025
            </p>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-8 px-4 border-b">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">On This Page</h2>
            <nav className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {sections.map((section, index) => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  <span className="text-primary font-medium">{index + 1}.</span>
                  {section.title}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Intro */}
            <div className="mb-12 p-6 bg-muted/50 rounded-lg border">
              <p className="text-lg leading-relaxed">
                Welcome to Pet ShareLink. By using our service, you agree to these Terms of Service. Please read them carefully.
              </p>
            </div>

            {/* Section 1 */}
            <section id="acceptance" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                Acceptance of Terms
              </h2>

              <div className="space-y-4 text-muted-foreground">
                <p>
                  By accessing or using Pet ShareLink (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Service.
                </p>
                <p>
                  We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms. We will notify users of material changes through the Service or via email.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="description" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                Description of Service
              </h2>

              <p className="text-muted-foreground mb-4">
                Pet ShareLink is a digital platform that allows users to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Create and manage profiles for their pets</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Store and organize pet health records, vaccinations, and medical documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Track veterinarian information and appointments</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Manage pet care schedules and reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Share pet information with authorized individuals</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Track pet-related expenses and insurance claims</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="accounts" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
                User Accounts
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Registration</h3>
                  <p className="text-muted-foreground">
                    To use Pet ShareLink, you must create an account by providing a valid email address and password. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Account Requirements</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>You must be at least 13 years old to use the Service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>You must provide accurate and complete information when creating your account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>You must notify us immediately of any unauthorized use of your account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>You may not share your account credentials with others</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="content" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
                User Content
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Content</h3>
                  <p className="text-muted-foreground">
                    You retain ownership of all content you upload to Pet ShareLink, including pet photos, documents, and information (&quot;User Content&quot;). By uploading User Content, you grant us a limited license to store, display, and process your content solely for the purpose of providing the Service.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Content Responsibilities</h3>
                  <p className="text-muted-foreground mb-3">You are responsible for ensuring that your User Content:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Does not violate any applicable laws or regulations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Does not infringe on the rights of any third party</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Does not contain malicious code or harmful content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Is accurate and not misleading</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Content Removal</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to remove any User Content that violates these Terms or is otherwise objectionable, without prior notice.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="acceptable-use" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
                Acceptable Use
              </h2>

              <p className="text-muted-foreground mb-4">You agree not to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Use the Service for any illegal purpose</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Attempt to gain unauthorized access to the Service or other users&apos; accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Interfere with or disrupt the Service or servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Upload viruses, malware, or other harmful code</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Use automated systems to access the Service without permission</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Impersonate any person or entity</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Collect or harvest user information without consent</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Use the Service to spam or harass others</span>
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="sharing" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
                Sharing and Collaboration
              </h2>

              <p className="text-muted-foreground mb-4">
                Pet ShareLink allows you to share pet information with others through share links and collaborator invitations. When you share information:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>You are responsible for choosing what information to share</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>You grant the recipient access to view (and in some cases edit) the shared information</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>You can revoke access at any time</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Recipients must also comply with these Terms</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                Share links may optionally be protected with a PIN code. You are responsible for securely communicating any PIN codes to intended recipients. We are not responsible for unauthorized access resulting from shared or compromised PIN codes.
              </p>
            </section>

            {/* Section 7 */}
            <section id="subscriptions" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
                Subscriptions and Payments
              </h2>

              <p className="text-muted-foreground mb-4">
                Pet ShareLink offers both free and paid subscription plans. For paid subscriptions:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Subscriptions are billed in advance on a monthly or annual basis</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>You authorize us to charge your payment method for all fees associated with your subscription</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Subscriptions automatically renew unless you cancel before the renewal date</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>You may cancel your subscription at any time; access continues until the end of the current billing period</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Refunds are provided in accordance with our refund policy or as required by applicable law</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                We may change subscription pricing with 30 days&apos; notice. Price changes will take effect at the start of your next billing cycle.
              </p>
            </section>

            {/* Section 8 */}
            <section id="intellectual-property" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
                Intellectual Property
              </h2>

              <p className="text-muted-foreground">
                The Service, including its design, features, and content (excluding User Content), is owned by Pet ShareLink and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the Service without our express written permission.
              </p>
            </section>

            {/* Section 9 - Medical Disclaimer */}
            <section id="medical-disclaimer" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">9</span>
                Medical Disclaimer
              </h2>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Pet ShareLink is a record-keeping and information management tool only. It is NOT a substitute for professional veterinary advice.
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>The Service is NOT a substitute for professional veterinary advice, diagnosis, or treatment</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Always seek the advice of a qualified veterinarian with any questions regarding your pet&apos;s health</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Never disregard professional veterinary advice or delay seeking it because of information stored or displayed in the Service</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>We do not verify the accuracy of health information you enter or upload</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>In case of a pet emergency, contact your veterinarian or emergency animal hospital immediately</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                We are not responsible for any pet health outcomes, injuries, or deaths resulting from reliance on information stored in or shared through the Service.
              </p>
            </section>

            {/* Section 10 */}
            <section id="warranties" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">10</span>
                Disclaimer of Warranties
              </h2>

              <div className="p-4 bg-muted rounded-lg border mb-6">
                <p className="text-sm font-medium uppercase">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </div>

              <p className="text-muted-foreground mb-4">We do not warrant that:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>The Service will be uninterrupted or error-free</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Defects will be corrected</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>The Service is free of viruses or harmful components</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>The information stored will be accurate or complete</span>
                </li>
              </ul>
            </section>

            {/* Section 11 */}
            <section id="liability" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">11</span>
                Limitation of Liability
              </h2>

              <div className="p-4 bg-muted rounded-lg border mb-6">
                <p className="text-sm font-medium uppercase">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, PET SHARELINK AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR LOSS OF GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
                </p>
              </div>

              <p className="text-muted-foreground">
                This includes, but is not limited to, any damages related to pet health, injury, or death, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            {/* Section 12 */}
            <section id="indemnification" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">12</span>
                Indemnification
              </h2>

              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless Pet ShareLink and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney&apos;s fees) arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            {/* Section 13 */}
            <section id="termination" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">13</span>
                Termination
              </h2>

              <p className="text-muted-foreground mb-4">
                You may terminate your account at any time by deleting your account through the Service settings. We may suspend or terminate your account if you violate these Terms or for any other reason at our discretion.
              </p>
              <p className="text-muted-foreground mb-4">Upon termination:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Your right to use the Service will immediately cease</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>We may delete your User Content after a reasonable retention period</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Provisions that by their nature should survive termination will remain in effect</span>
                </li>
              </ul>
            </section>

            {/* Section 14 */}
            <section id="governing-law" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">14</span>
                Governing Law
              </h2>

              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any disputes arising from these Terms or the Service shall be resolved in the courts of competent jurisdiction.
              </p>
            </section>

            {/* Section 15 */}
            <section id="severability" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">15</span>
                Severability
              </h2>

              <p className="text-muted-foreground">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            {/* Section 16 */}
            <section id="entire-agreement" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">16</span>
                Entire Agreement
              </h2>

              <p className="text-muted-foreground">
                These Terms, together with our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, constitute the entire agreement between you and Pet ShareLink regarding the Service and supersede any prior agreements.
              </p>
            </section>

            {/* Section 17 */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">17</span>
                Contact Us
              </h2>

              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="font-medium">Email</p>
                <a href="mailto:legal@petsharelink.com" className="text-primary hover:underline">
                  legal@petsharelink.com
                </a>
              </div>
            </section>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
