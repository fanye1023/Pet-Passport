import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { FileText } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service - Pet ShareLink',
  description: 'Pet ShareLink Terms of Service - The terms and conditions governing your use of our service.',
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FileText className="h-4 w-4" />
              Legal
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: March 2025
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-4xl prose prose-neutral dark:prose-invert">
            <p className="lead">
              Welcome to Pet ShareLink. By using our service, you agree to these Terms of Service. Please read them carefully.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Pet ShareLink (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Service.
            </p>
            <p>
              We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms. We will notify users of material changes through the Service or via email.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Pet ShareLink is a digital platform that allows users to:
            </p>
            <ul>
              <li>Create and manage profiles for their pets</li>
              <li>Store and organize pet health records, vaccinations, and medical documents</li>
              <li>Track veterinarian information and appointments</li>
              <li>Manage pet care schedules and reminders</li>
              <li>Share pet information with authorized individuals</li>
              <li>Track pet-related expenses and insurance claims</li>
            </ul>

            <h2>3. User Accounts</h2>

            <h3>Registration</h3>
            <p>
              To use Pet ShareLink, you must create an account by providing a valid email address and password. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h3>Account Requirements</h3>
            <ul>
              <li>You must be at least 13 years old to use the Service</li>
              <li>You must provide accurate and complete information when creating your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>You may not share your account credentials with others</li>
            </ul>

            <h2>4. User Content</h2>

            <h3>Your Content</h3>
            <p>
              You retain ownership of all content you upload to Pet ShareLink, including pet photos, documents, and information (&quot;User Content&quot;). By uploading User Content, you grant us a limited license to store, display, and process your content solely for the purpose of providing the Service.
            </p>

            <h3>Content Responsibilities</h3>
            <p>You are responsible for ensuring that your User Content:</p>
            <ul>
              <li>Does not violate any applicable laws or regulations</li>
              <li>Does not infringe on the rights of any third party</li>
              <li>Does not contain malicious code or harmful content</li>
              <li>Is accurate and not misleading</li>
            </ul>

            <h3>Content Removal</h3>
            <p>
              We reserve the right to remove any User Content that violates these Terms or is otherwise objectionable, without prior notice.
            </p>

            <h2>5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload viruses, malware, or other harmful code</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Impersonate any person or entity</li>
              <li>Collect or harvest user information without consent</li>
              <li>Use the Service to spam or harass others</li>
            </ul>

            <h2>6. Sharing and Collaboration</h2>
            <p>
              Pet ShareLink allows you to share pet information with others through share links and collaborator invitations. When you share information:
            </p>
            <ul>
              <li>You are responsible for choosing what information to share</li>
              <li>You grant the recipient access to view (and in some cases edit) the shared information</li>
              <li>You can revoke access at any time</li>
              <li>Recipients must also comply with these Terms</li>
            </ul>
            <p>
              Share links may optionally be protected with a PIN code. You are responsible for securely communicating any PIN codes to intended recipients. We are not responsible for unauthorized access resulting from shared or compromised PIN codes.
            </p>

            <h2>7. Subscriptions and Payments</h2>
            <p>
              Pet ShareLink offers both free and paid subscription plans. For paid subscriptions:
            </p>
            <ul>
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>You authorize us to charge your payment method for all fees associated with your subscription</li>
              <li>Subscriptions automatically renew unless you cancel before the renewal date</li>
              <li>You may cancel your subscription at any time; access continues until the end of the current billing period</li>
              <li>Refunds are provided in accordance with our refund policy or as required by applicable law</li>
            </ul>
            <p>
              We may change subscription pricing with 30 days&apos; notice. Price changes will take effect at the start of your next billing cycle.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              The Service, including its design, features, and content (excluding User Content), is owned by Pet ShareLink and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the Service without our express written permission.
            </p>

            <h2>9. Medical Disclaimer</h2>
            <p>
              <strong>IMPORTANT: Pet ShareLink is a record-keeping and information management tool only.</strong>
            </p>
            <ul>
              <li>The Service is NOT a substitute for professional veterinary advice, diagnosis, or treatment</li>
              <li>Always seek the advice of a qualified veterinarian with any questions regarding your pet&apos;s health</li>
              <li>Never disregard professional veterinary advice or delay seeking it because of information stored or displayed in the Service</li>
              <li>We do not verify the accuracy of health information you enter or upload</li>
              <li>In case of a pet emergency, contact your veterinarian or emergency animal hospital immediately</li>
            </ul>
            <p>
              We are not responsible for any pet health outcomes, injuries, or deaths resulting from reliance on information stored in or shared through the Service.
            </p>

            <h2>10. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that:
            </p>
            <ul>
              <li>The Service will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>The Service is free of viruses or harmful components</li>
              <li>The information stored will be accurate or complete</li>
            </ul>

            <h2>11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PET SHARELINK AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR LOSS OF GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
            </p>
            <p>
              This includes, but is not limited to, any damages related to pet health, injury, or death, even if we have been advised of the possibility of such damages.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Pet ShareLink and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney&apos;s fees) arising from your use of the Service or violation of these Terms.
            </p>

            <h2>13. Termination</h2>
            <p>
              You may terminate your account at any time by deleting your account through the Service settings. We may suspend or terminate your account if you violate these Terms or for any other reason at our discretion.
            </p>
            <p>
              Upon termination:
            </p>
            <ul>
              <li>Your right to use the Service will immediately cease</li>
              <li>We may delete your User Content after a reasonable retention period</li>
              <li>Provisions that by their nature should survive termination will remain in effect</li>
            </ul>

            <h2>14. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any disputes arising from these Terms or the Service shall be resolved in the courts of competent jurisdiction.
            </p>

            <h2>15. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>

            <h2>16. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Pet ShareLink regarding the Service and supersede any prior agreements.
            </p>

            <h2>17. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@petsharelink.com
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
