import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Shield, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Pet ShareLink',
  description: 'Pet ShareLink Privacy Policy - Learn how we collect, use, and protect your personal information.',
}

const sections = [
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Information' },
  { id: 'information-sharing', title: 'Information Sharing' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'your-rights', title: 'Your Rights' },
  { id: 'children', title: "Children's Privacy" },
  { id: 'cookies', title: 'Cookies and Tracking' },
  { id: 'ccpa', title: 'California Privacy Rights' },
  { id: 'international', title: 'International Data Transfers' },
  { id: 'third-party', title: 'Third-Party Links' },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact Us' },
]

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 px-4 border-b bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Legal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
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
                At Pet ShareLink, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </div>

            {/* Section 1 */}
            <section id="information-we-collect" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                Information We Collect
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Information You Provide</h3>
                  <p className="text-muted-foreground mb-4">
                    We collect information you voluntarily provide when using Pet ShareLink, including:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Account Information:</strong> Email address and password when you create an account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Pet Information:</strong> Pet names, species, breeds, birthdays, photos, and other details you add to pet profiles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Health Records:</strong> Vaccination records, medical history, veterinarian information, and health documents you upload</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Care Information:</strong> Feeding schedules, routines, medications, and care instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Financial Information:</strong> Expense records and insurance claim details (we do not store payment card information)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Information Collected Automatically</h3>
                  <p className="text-muted-foreground mb-4">
                    When you use Pet ShareLink, we automatically collect:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Usage Data:</strong> Pages visited, features used, and actions taken within the application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Device Information:</strong> Browser type, operating system, and device identifiers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Log Data:</strong> IP address, access times, and referring URLs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="how-we-use" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                How We Use Your Information
              </h2>

              <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Provide, maintain, and improve Pet ShareLink services</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Create and manage your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Store and organize your pet&apos;s health records and care information</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Send reminders for vaccinations, appointments, and other pet care events</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Enable sharing features with veterinarians, pet sitters, and family members</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Generate calendar feeds for your pet care events</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Respond to your requests, comments, or questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Monitor and analyze usage patterns to improve our service</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Protect against fraudulent or unauthorized activity</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="information-sharing" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
                Information Sharing
              </h2>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  We do not sell your personal information.
                </p>
              </div>

              <p className="text-muted-foreground mb-6">We may share your information in the following circumstances:</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">With Your Consent</h3>
                  <p className="text-muted-foreground">
                    When you create share links or invite collaborators, you are explicitly choosing to share specific pet information with others. You control what information is visible through share settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Service Providers</h3>
                  <p className="text-muted-foreground mb-3">
                    We work with third-party service providers who assist us in operating Pet ShareLink, including:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Cloud hosting and storage providers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Authentication services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Analytics providers</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    These providers are bound by contractual obligations to keep your information confidential and secure.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Legal Requirements</h3>
                  <p className="text-muted-foreground">
                    We may disclose your information if required by law, court order, or government request, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="data-security" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
                Data Security
              </h2>

              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Encryption of data in transit using TLS/SSL</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Encryption of data at rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Secure authentication mechanisms</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Regular security assessments</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Access controls limiting who can access your data</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 5 */}
            <section id="data-retention" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
                Data Retention
              </h2>

              <p className="text-muted-foreground">
                We retain your information for as long as your account is active or as needed to provide you services. You can delete your pet profiles or account at any time. When you delete data, it is permanently removed from our systems, though some information may persist in backups for a limited period.
              </p>
            </section>

            {/* Section 6 */}
            <section id="your-rights" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
                Your Rights
              </h2>

              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Access:</strong> Request a copy of the personal information we hold about you</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Correction:</strong> Update or correct inaccurate information</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Deletion:</strong> Delete your account and associated data</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Export:</strong> Download your data in a portable format</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Withdraw Consent:</strong> Revoke share links and remove collaborator access at any time</span>
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="children" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
                Children&apos;s Privacy
              </h2>

              <p className="text-muted-foreground">
                Pet ShareLink is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            {/* Section 8 */}
            <section id="cookies" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
                Cookies and Tracking Technologies
              </h2>

              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Essential Cookies:</strong> Required for the Service to function properly, including authentication and security</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Preference Cookies:</strong> Remember your settings and preferences (like dark mode)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how you use Pet ShareLink so we can improve it</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of the Service.
              </p>
            </section>

            {/* Section 9 */}
            <section id="ccpa" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">9</span>
                California Privacy Rights (CCPA)
              </h2>

              <p className="text-muted-foreground mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Right to Know:</strong> Request information about the categories and specific pieces of personal information we&apos;ve collected</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Right to Delete:</strong> Request deletion of your personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Right to Opt-Out:</strong> Opt out of the &quot;sale&quot; of personal information (we do not sell your data)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                To exercise these rights, contact us at privacy@petsharelink.com.
              </p>
            </section>

            {/* Section 10 */}
            <section id="international" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">10</span>
                International Data Transfers
              </h2>

              <p className="text-muted-foreground">
                Pet ShareLink is operated from the United States. If you are accessing the Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located. By using the Service, you consent to this transfer.
              </p>
            </section>

            {/* Section 11 */}
            <section id="third-party" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">11</span>
                Third-Party Links
              </h2>

              <p className="text-muted-foreground">
                Pet ShareLink may contain links to third-party websites or services, such as veterinary clinic websites or pet supply stores. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            {/* Section 12 */}
            <section id="changes" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">12</span>
                Changes to This Policy
              </h2>

              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
              </p>
            </section>

            {/* Section 13 */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">13</span>
                Contact Us
              </h2>

              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="font-medium">Email</p>
                <a href="mailto:privacy@petsharelink.com" className="text-primary hover:underline">
                  privacy@petsharelink.com
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
