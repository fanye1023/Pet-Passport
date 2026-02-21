import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy - Pet ShareLink',
  description: 'Pet ShareLink Privacy Policy - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Legal
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: February 2025
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-4xl prose prose-neutral dark:prose-invert">
            <p className="lead">
              At Pet ShareLink, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>

            <h2>1. Information We Collect</h2>

            <h3>Information You Provide</h3>
            <p>We collect information you voluntarily provide when using Pet ShareLink, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Email address and password when you create an account</li>
              <li><strong>Pet Information:</strong> Pet names, species, breeds, birthdays, photos, and other details you add to pet profiles</li>
              <li><strong>Health Records:</strong> Vaccination records, medical history, veterinarian information, and health documents you upload</li>
              <li><strong>Care Information:</strong> Feeding schedules, routines, medications, and care instructions</li>
              <li><strong>Financial Information:</strong> Expense records and insurance claim details (we do not store payment card information)</li>
            </ul>

            <h3>Information Collected Automatically</h3>
            <p>When you use Pet ShareLink, we automatically collect:</p>
            <ul>
              <li><strong>Usage Data:</strong> Pages visited, features used, and actions taken within the application</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, and referring URLs</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve Pet ShareLink services</li>
              <li>Create and manage your account</li>
              <li>Store and organize your pet&apos;s health records and care information</li>
              <li>Send reminders for vaccinations, appointments, and other pet care events</li>
              <li>Enable sharing features with veterinarians, pet sitters, and family members</li>
              <li>Generate calendar feeds for your pet care events</li>
              <li>Respond to your requests, comments, or questions</li>
              <li>Monitor and analyze usage patterns to improve our service</li>
              <li>Protect against fraudulent or unauthorized activity</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>

            <h3>With Your Consent</h3>
            <p>
              When you create share links or invite collaborators, you are explicitly choosing to share specific pet information with others. You control what information is visible through share settings.
            </p>

            <h3>Service Providers</h3>
            <p>
              We work with third-party service providers who assist us in operating Pet ShareLink, including:
            </p>
            <ul>
              <li>Cloud hosting and storage providers</li>
              <li>Authentication services</li>
              <li>Analytics providers</li>
            </ul>
            <p>These providers are bound by contractual obligations to keep your information confidential and secure.</p>

            <h3>Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, court order, or government request, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
            </p>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul>
              <li>Encryption of data in transit using TLS/SSL</li>
              <li>Encryption of data at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments</li>
              <li>Access controls limiting who can access your data</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide you services. You can delete your pet profiles or account at any time. When you delete data, it is permanently removed from our systems, though some information may persist in backups for a limited period.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Delete your account and associated data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Withdraw Consent:</strong> Revoke share links and remove collaborator access at any time</li>
            </ul>

            <h2>7. Children&apos;s Privacy</h2>
            <p>
              Pet ShareLink is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>

            <h2>8. Third-Party Links</h2>
            <p>
              Pet ShareLink may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@petsharelink.com
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
