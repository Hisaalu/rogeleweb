import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { fetchPublicSettings } from '@/lib/settings.server'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const siteTitle = settings['site.browser_title'] || 'NexaT'
  return {
    title: `Terms of Service`,
    description: `Read the terms and conditions for using the ${siteTitle} platform.`,
  }
}

export default async function TermsOfServicePage() {
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
          <FileText size={32} style={{ color: 'var(--brand-accent)' }} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl" style={{ color: 'var(--brand-primary)' }}>
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last Updated: October 12, 2026
        </p>
      </div>

      <div className="space-y-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        
        <section id="acceptance" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            By accessing or using <Link href="/" className="font-semibold text-brand-primary hover:underline">{schoolName}</Link> ("{siteTitle}"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our platform.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            By creating an account, you also acknowledge that you have read our{' '}
            <Link href="/privacy-policy" className="font-semibold text-brand-primary hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </section>

        <section id="description" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">2. Description of Service</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            <Link href="/" className="font-semibold text-brand-primary hover:underline">{schoolName}</Link>{' '}
            provides an online learning platform that allows users to access educational content, 
            take quizzes, submit homework, track progress, and interact with teachers.
          </p>
        </section>

        <section id="accounts" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">3. User Accounts</h2>
          <h3 className="text-lg font-semibold text-foreground">3.1 Account Security</h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. 
            Notify us immediately of any unauthorized use of your account.
          </p>
          <h3 className="text-lg font-semibold text-foreground">3.2 Account Types</h3>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li><strong>Students:</strong> Access to <Link href="/learner/lessons" className="text-brand-primary hover:underline">lessons</Link>, <Link href="/learner/quizzes" className="text-brand-primary hover:underline">quizzes</Link>, <Link href="/learner/homework" className="text-brand-primary hover:underline">homework</Link> and other learning materials</li>
            <li><strong>Teachers:</strong> Create and manage lessons, quizzes, homeworks and assess student progress</li>
            <li><strong>Administrators:</strong> Platform management and user administration</li>
            <li><strong>Other Users:</strong> Access to materials</li>
          </ul>
        </section>

        <section id="subscriptions" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">4. Subscription and Payments</h2>
          <h3 className="text-lg font-semibold text-foreground">4.1 Free Trial</h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Users are eligible for a free trial period upon account creation. During the trial period, you have full access to all platform features. 
            After the trial period, a <Link href="/learner/subscription" className="font-semibold text-brand-primary hover:underline">subscription</Link> is required to continue accessing premium content.
          </p>
          <h3 className="text-lg font-semibold text-foreground">4.2 Payments &amp; Renewal</h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            All fees are non-refundable except as required by law. Payments are processed securely through{' '}
            <a href="https://www.airtel.co.ug/airtel-money" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary hover:underline">Airtel Money</a> and{' '}
            <a href="https://www.mtn.co.ug/momo/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary hover:underline">MTN Mobile Money</a>. 
            Subscriptions prompt you to renew at the end of each billing period.
          </p>
        </section>

        <section id="conduct" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">5. User Conduct</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">You agree not to:</p>
          <ul className="list-inside list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Share your account credentials with others</li>
            <li>Use the platform for any illegal purpose</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Upload malicious code or attempt to bypass security measures</li>
            <li>Copy, distribute, or modify platform content without permission</li>
            <li>Use automated scripts to access the platform</li>
            <li>Impersonate another person or entity</li>
          </ul>
        </section>

        <section id="ownership" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">6. Content Ownership</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            All content provided on the platform, including lessons, text, graphics, logos, and software, is the property of <Link href="/" className="font-semibold text-brand-primary hover:underline">{schoolName}</Link>{' '}
            and is protected by copyright laws. You may not reproduce or distribute it without explicit permission.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Teachers retain ownership of the lessons they create but grant the platform a license to host and distribute this content to enrolled students.
          </p>
        </section>

        <section id="termination" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">7. Termination</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            You can request to delete your account at any time through your <Link href="/learner/profile" className="font-semibold text-brand-primary hover:underline">profile settings</Link>. 
            We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent activity, or misuse the platform.
          </p>
        </section>

        <section id="liability" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">8. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            To the maximum extent permitted by law, <Link href="/" className="font-semibold text-brand-primary hover:underline">{siteTitle}</Link>{' '}
            shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. 
            Our total liability shall not exceed the amount paid by you for using the platform during the twelve months preceding the claim.
          </p>
        </section>

        <section id="law" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">9. Governing Law</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            These terms shall be governed by and construed in accordance with the laws of Uganda. 
            Any disputes shall be resolved in the courts of Kampala, Uganda.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24 space-y-4 border-t border-border pt-8">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">10. Contact Information</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            For questions about these terms, please visit our <Link href="/contact" className="font-semibold text-brand-primary hover:underline">Contact Page</Link> or reach us directly:
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