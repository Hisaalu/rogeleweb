import Link from 'next/link'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { fetchPublicSettings } from '@/lib/settings.server'
import { Card } from '@/components/ui/card'
import { ContactForm } from '@/app/(marketing)/contact/contact-form'

export async function ContactContent() {
  const settings = await fetchPublicSettings()

  const email = settings['contact.email']?.trim() || 'info@raysofgrace.ac.ug'
  const altEmail = settings['contact.alt_email']?.trim() || 'nelson@raysofgrace.ac.ug'
  const phone = settings['contact.phone']?.trim() || '+256 786 764 239'
  const altPhone = settings['contact.alt_phone']?.trim() || '+256 751 719 313'
  const address = settings['contact.address']?.trim() || 'Njeru, Uganda'
  const hoursWeekday = settings['contact.hours_weekday']?.trim() || 'Mon-Fri: 8AM - 5PM'
  const hoursWeekend = settings['contact.hours_weekend']?.trim() || 'Sat: 9AM - 1PM'

  const iconStyle = {
    backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
    color: 'var(--brand-accent)',
  } as const

  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Have a question? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          <div className="md:order-2">
            <ContactForm />
          </div>

          <div className="md:order-1 grid grid-cols-2 gap-4">
            <Card className="flex flex-col items-center justify-center p-4 text-center transition hover:-translate-y-1 hover:border-brand-accent sm:p-6">
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-sm sm:mb-4 sm:h-14 sm:w-14"
                style={iconStyle}
              >
                <Mail size={22} />
              </div>
              <h3 className="mb-1 text-sm font-bold text-foreground sm:mb-2 sm:text-base">
                Email Us
              </h3>
              <p className="break-all text-xs text-muted-foreground sm:text-sm">
                {email}
              </p>
              {altEmail && altEmail !== email && (
                <p className="break-all text-xs text-muted-foreground sm:text-sm">
                  {altEmail}
                </p>
              )}
            </Card>

            <Card className="flex flex-col items-center justify-center p-4 text-center transition hover:-translate-y-1 hover:border-brand-accent sm:p-6">
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-sm sm:mb-4 sm:h-14 sm:w-14"
                style={iconStyle}
              >
                <Phone size={22} />
              </div>
              <h3 className="mb-1 text-sm font-bold text-foreground sm:mb-2 sm:text-base">
                Call Us
              </h3>
              <p className="break-all text-xs text-muted-foreground sm:text-sm">
                {phone}
              </p>
              {altPhone && altPhone !== phone && (
                <p className="break-all text-xs text-muted-foreground sm:text-sm">
                  {altPhone}
                </p>
              )}
            </Card>

            <Card className="flex flex-col items-center justify-center p-4 text-center transition hover:-translate-y-1 hover:border-brand-accent sm:p-6">
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-sm sm:mb-4 sm:h-14 sm:w-14"
                style={iconStyle}
              >
                <MapPin size={22} />
              </div>
              <h3 className="mb-1 text-sm font-bold text-foreground sm:mb-2 sm:text-base">
                Visit Us
              </h3>
              <p className="break-all text-xs text-muted-foreground sm:text-sm">
                {address}
              </p>
            </Card>

            <Card className="flex flex-col items-center justify-center p-4 text-center transition hover:-translate-y-1 hover:border-brand-accent sm:p-6">
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-sm sm:mb-4 sm:h-14 sm:w-14"
                style={iconStyle}
              >
                <Clock size={22} />
              </div>
              <h3 className="mb-1 text-sm font-bold text-foreground sm:mb-2 sm:text-base">
                Working Hours
              </h3>
              <p className="break-all text-xs text-muted-foreground sm:text-sm">
                {hoursWeekday}
              </p>
              {hoursWeekend && (
                <p className="break-all text-xs text-muted-foreground sm:text-sm">
                  {hoursWeekend}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}