import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getHomePageData } from '@/lib/home.server'
import { fetchPublicSettings } from '@/lib/settings.server.public'
import { PlanCard } from '@/components/subscription/plan-card'
import {
  ArrowRight,
  PlayCircle,
  UserPlus,
  GraduationCap,
  Rocket,
  BookOpen,
  Pencil,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Home',
    description:
      'Join our innovative E-learning Environment. Interactive lessons, smart quizzes, and progress tracking.',
  }
}

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create Account',
    body: 'Sign up for free and get access to our trial period.',
  },
  {
    icon: GraduationCap,
    title: 'Choose Your Class',
    body: 'Select your class and start exploring lessons and materials.',
  },
  {
    icon: Rocket,
    title: 'Start Learning',
    body: 'Access lessons, take quizzes, and track your progress.',
  },
] as const

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Interactive Lessons',
    body: 'Engaging video lessons and downloadable materials.',
  },
  {
    icon: Pencil,
    title: 'Smart Quizzes',
    body: 'Automatically graded quizzes with instant feedback and analytics.',
  },
  {
    icon: CheckCircle2,
    title: 'Homework Support',
    body: 'Do and submit your homework through the system itself.',
  },
] as const

const eyebrowStyle = {
  backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
  color: 'var(--brand-accent)',
} as const

export default async function HomePage() {
  const [data, settings] = await Promise.all([
    getHomePageData(),
    fetchPublicSettings(),
  ])

  const { plans, classes, stats, classRange: range } = data

  const siteTitle = settings['site.browser_title']?.trim() || 'NexaT'
  const schoolName = settings['branding.school_name']?.trim() || siteTitle

  const classRange = `${range.first} to ${range.last}`

  const recommendedId =
    plans.length >= 2 ? plans[Math.floor(plans.length / 2)].id : null

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <section
        className="relative w-full overflow-hidden py-16 sm:py-24 lg:py-32"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col items-start text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Welcome to {siteTitle}
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Quality Education
                <span className="mt-2 block">
                  For Every Child
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg text-white/90">
                Join our innovative {schoolName} E-Learning Environment from {classRange}.
                Interactive lessons, smart quizzes, and progress tracking all in one place.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  Start Free Trial <ArrowRight size={16} />
                </Link>
                <a
                  href="https://youtu.be/8DrZ80nR2o0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                >
                  <PlayCircle size={16} /> See How It Works
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 rounded-2xl bg-white/10 p-5 backdrop-blur-sm sm:gap-10 sm:px-8">
                <Stat label="Students" value={stats.students} />
                <Divider />
                <Stat label="Teachers" value={stats.teachers} />
                <Divider />
                <Stat label="Lessons" value={stats.lessons} />
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative rounded-3xl bg-white/10 p-4 backdrop-blur-sm sm:p-8">
                <Image
                  src="/images/logo.jpg"
                  alt={`${schoolName} Logo`}
                  width={320}
                  height={320}
                  priority
                  className="h-auto w-full max-w-[280px] rounded-2xl object-contain drop-shadow-2xl sm:max-w-[320px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={eyebrowStyle}
          >
            Getting Started
          </span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Start Learning in{' '}
            <span style={{ color: 'var(--brand-primary)' }}>3 Easy Steps</span>
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="flex flex-col items-center rounded-3xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-lg"
                >
                  <div
                    className="mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  >
                    {i + 1}
                  </div>
                  <Icon size={32} className="mb-4" style={{ color: 'var(--brand-accent)' }} />
                  <h3 className="mb-2 text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-center text-sm text-muted-foreground">{step.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={eyebrowStyle}
          >
            Why {siteTitle}?
          </span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Everything You Need For{' '}
            <span style={{ color: 'var(--brand-primary)' }}>Quality Education</span>
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm transition hover:-translate-y-2 hover:border-brand-accent hover:shadow-lg"
                >
                  <div
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
                      color: 'var(--brand-accent)',
                    }}
                  >
                    <Icon size={36} />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-20 bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={eyebrowStyle}
          >
            Pricing Plans
          </span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Choose Your{' '}
            <span style={{ color: 'var(--brand-primary)' }}>Learning Path</span>
          </h2>

          {plans.length === 0 ? (
            <div className="mx-auto mt-16 max-w-md rounded-3xl border border-border bg-card p-8 text-center">
              <p className="text-sm font-semibold text-foreground">
                Plans are being updated
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pricing will be available shortly. Create a free account to get
                started in the meantime.
              </p>
              <Link
                href="/register"
                className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Create Free Account <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  allPlans={plans}
                  recommended={plan.id === recommendedId}
                  href="/register"
                  buttonLabel="Get Started"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={eyebrowStyle}
          >
            Got Questions?
          </span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Frequently Asked{' '}
            <span style={{ color: 'var(--brand-primary)' }}>Questions</span>
          </h2>

          <div className="mt-12 space-y-4 text-left">
            {[
              {
                q: 'How does the free trial work?',
                a: `When you sign up for a new account on ${siteTitle}, you automatically receive complimentary full access to all features, including interactive lessons and quizzes.`,
              },
              {
                q: 'Can I switch subscription plans later?',
                a: 'Yes, you can upgrade or change your plan at any time. Simply visit the subscriptions page from your dashboard and select the plan that best fits your needs.',
              },
              {
                q: `Can I access ${siteTitle} on mobile phones?`,
                a: `${siteTitle} is fully responsive and optimized for all web browsers, smartphones, tablets, and computers.`,
              },
              {
                q: 'How do parents and teachers track student progress?',
                a: 'Our built-in analytics dashboard automatically records quiz scores, homework completion rates, and lesson activities.',
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-border bg-card p-5 transition open:border-brand-accent open:shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-foreground outline-none">
                  {faq.q}
                  <ChevronDown
                    size={18}
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: 'var(--brand-primary)' }}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Start Learning?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Join thousands of students already learning on {schoolName}.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-xl"
            style={{ color: 'var(--brand-primary)' }}
          >
            Create Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-extrabold text-white tabular-nums">
        {value.toLocaleString('en-US')}+
      </span>
      <span className="text-xs font-medium uppercase tracking-wider text-white/80">
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="hidden h-10 w-px bg-white/20 sm:block" />
}