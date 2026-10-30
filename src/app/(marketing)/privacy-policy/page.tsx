import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { fetchPublicSettings } from '@/lib/settings.server'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const siteTitle = settings['site.browser_title'] || 'NexaT'
  return {
    title: `Privacy Policy`,
    description: `Learn how ${siteTitle} collects, uses, and protects your personal data.`,
  }
}

export default async function PrivacyPolicyPage() {
  const settings = await fetchPublicSettings()
  const siteTitle = settings['site.browser_title']?.trim() || 'NexaT'
  const schoolName = settings['branding.school_name']?.trim() || siteTitle
  const contactEmail = settings['contact.email'] || 'info@raysofgrace.ac.ug'
  const contactPhone = settings['contact.phone'] || '+256 786 764 239'
  const contactAddress = settings['contact.address'] || 'Njeru, Uganda'

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      
      <div className="border-b border-border pb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)' }}>
          <ShieldAlert size={32} style={{ color: 'var(--brand-accent)' }} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl" style={{ color: 'var(--brand-primary)' }}>
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last Updated: October 12, 2026
        </p>
      </div>

      <div className="space-y-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        
        <section id="introduction" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">1. Introduction</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            <Link href="/" className="font-semibold text-brand-primary hover:underline">{schoolName}</Link>{' '}
            respects your privacy and is committed to protecting your personal data. 
            This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our e-learning platform.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Please read this privacy policy carefully. By accessing our platform, you also agree to our{' '}
            <Link href="/terms-of-service" className="font-semibold text-brand-primary hover:underline">
              Terms of Service
            </Link>.
          </p>
        </section>

        <section id="collection" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">2. Information We Collect</h2>
          <h3 className="text-lg font-semibold text-foreground">2.1 Personal Information You Provide</h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            We collect personal information that you voluntarily provide through:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Registering for an account</li>
            <li>Enrolling for lessons</li>
            <li>Taking quizzes, homework and assessments</li>
            <li>Contacting our <Link href="/contact" className="font-semibold text-brand-primary hover:underline">support team</Link></li>
          </ul>
          <p className="text-sm font-medium text-foreground sm:text-base">This information includes:</p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Class</li>
            <li>Payment information (Airtel Money &amp; MTN Mobile Money)</li>
          </ul>
          
          <h3 className="mt-6 text-lg font-semibold text-foreground">2.2 Automatically Collected Information</h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            When you access and use our platform, we automatically collect certain information about your device and usage, including:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>IP address, Browser type, Operating system</li>
            <li>Pages visited, time spent, and interaction data</li>
            <li>Course progress and quiz results</li>
          </ul>
        </section>

        <section id="usage" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">3. How We Use Your Information</h2>
          <h3 className="text-lg font-semibold text-foreground">3.1 Core Functionality</h3>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Create and manage your account</li>
            <li>Provide access to Lessons, homework and quizzes</li>
            <li>Track your progress and performance</li>
            <li>Process payments and manage <Link href="/learner/subscription" className="font-semibold text-brand-primary hover:underline">subscriptions</Link></li>
          </ul>
          
          <h3 className="mt-4 text-lg font-semibold text-foreground">3.2 Communication</h3>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Send important account notifications</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Provide lesson updates and announcements</li>
          </ul>

          <h3 className="mt-4 text-lg font-semibold text-foreground">3.3 Improvement and Security</h3>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Analyze platform usage patterns to improve user experience</li>
            <li>Identify and fix technical issues</li>
            <li>Protect against unauthorized access, fraud, and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section id="sharing" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">4. Sharing Your Information</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">We may share your information with:</p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              <strong>Service Providers:</strong> Payment processors like{' '}
              <a href="https://www.mtn.co.ug/momo/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary hover:underline">MTN Mobile Money</a> and{' '}
              <a href="https://www.airtel.co.ug/airtel-money" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary hover:underline">Airtel Money</a>, cloud hosting, and email service providers.
            </li>
            <li><strong>Educational Partners:</strong> Teachers and schools affiliated with your account, or with your explicit consent.</li>
            <li><strong>Legal Requirements:</strong> If required by law, court order, or to protect our rights and user safety.</li>
          </ul>
        </section>

        <section id="retention" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">5. Data Retention</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Account information: Until account deletion</li>
            <li>Lesson and Quiz progress: Duration of account plus 1 year</li>
            <li>Payment records: 7 years (for tax and accounting purposes)</li>
          </ul>
        </section>

        <section id="rights" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">6. Your Rights and Choices</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">Depending on your location, you may have the right to:</p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Access and correct your personal data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Request a copy of your data in a machine-readable format</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            To exercise these rights, contact us at <a href={`mailto:${contactEmail}`} className="font-semibold text-brand-primary hover:underline">{contactEmail}</a>.
          </p>
        </section>

        <section id="children" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">7. Children's Privacy</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Our platform is designed for students of all ages. We take special care to protect children's privacy:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>We only collect information necessary for educational purposes</li>
            <li>We do not target advertising to children</li>
            <li>Parents/guardians have full access to their child's account and can review, update, or delete information</li>
          </ul>
        </section>

        <section id="security" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">8. Data Security</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            We implement appropriate technical and organizational measures to protect your information:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>SSL/TLS encryption for data transmission</li>
            <li>Encrypted database storage</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
          </ul>
        </section>

        <section id="contact" className="scroll-mt-24 space-y-4 border-t border-border pt-8">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">9. Contact Information</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            If you have questions about this privacy policy, please visit our{' '}
            <Link href="/contact" className="font-semibold text-brand-primary hover:underline">Contact Page</Link> or reach us directly:
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li><strong className="text-foreground">Email:</strong> <a href={`mailto:${contactEmail}`} className="text-brand-primary hover:underline">{contactEmail}</a></li>
            <li><strong className="text-foreground">Phone:</strong> {contactPhone}</li>
            <li><strong className="text-foreground">Address:</strong> {contactAddress}</li>
          </ul>
        </section>

      </div>
    </div>
  )
}