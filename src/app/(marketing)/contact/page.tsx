import type { Metadata } from 'next'
import { fetchPublicSettings } from '@/lib/settings.server'
import { ContactForm } from './contact-form'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const siteTitle = settings['site.browser_title'] || 'ROGELE'
  return {
    title: `Contact`,
    description: `Get in touch with ${siteTitle}.`,
  }
}

export default async function ContactPage() {
  const settings = await fetchPublicSettings()

  const email = settings['contact.email'] || 'info@raysofgrace.ac.ug'
  const altEmail = settings['contact.alt_email'] || 'nelson@raysofgrace.ac.ug'
  const phone = settings['contact.phone'] || '+256 786 764 239'
  const altPhone = settings['contact.alt_phone'] || '+256 751 719 313'
  const address = settings['contact.address'] || 'Njeru, Uganda'
  const hoursWeekday = settings['contact.hours_weekday'] || 'Mon-Fri: 8AM - 5PM'
  const hoursWeekend = settings['contact.hours_weekend'] || 'Sat: 9AM - 1PM'

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl" style={{ color: 'var(--brand-primary)' }}>
            Contact Us
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Have a question? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-accent">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                <Mail size={24} />
              </div>
              <h3 className="mb-2 font-bold text-foreground">Email Us</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              {altEmail && altEmail !== email && (
                <p className="text-sm text-muted-foreground">{altEmail}</p>
              )}
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-accent">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                <Phone size={24} />
              </div>
              <h3 className="mb-2 font-bold text-foreground">Call Us</h3>
              <p className="text-sm text-muted-foreground">{phone}</p>
              {altPhone && altPhone !== phone && (
                <p className="text-sm text-muted-foreground">{altPhone}</p>
              )}
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-accent">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                <MapPin size={24} />
              </div>
              <h3 className="mb-2 font-bold text-foreground">Visit Us</h3>
              <p className="text-sm text-muted-foreground">{address}</p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-accent">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                <Clock size={24} />
              </div>
              <h3 className="mb-2 font-bold text-foreground">Working Hours</h3>
              <p className="text-sm text-muted-foreground">{hoursWeekday}</p>
              {hoursWeekend && (
                <p className="text-sm text-muted-foreground">{hoursWeekend}</p>
              )}
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  )
}