'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch('https://formspree.io/f/xnneyjlj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.errors?.[0]?.message || 'Failed to send message.')
      }

      setStatus('success')
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl" style={{ color: 'var(--brand-primary)' }}>
            Contact Us
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Have a question? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          
          {/* Contact Info Sidebar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-accent">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                <Mail size={24} />
              </div>
              <h3 className="mb-2 font-bold text-foreground">Email Us</h3>
              <p className="text-sm text-muted-foreground">info@raysofgrace.ac.ug</p>
              <p className="text-sm text-muted-foreground">nelson@raysofgrace.ac.ug</p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-accent">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                <Phone size={24} />
              </div>
              <h3 className="mb-2 font-bold text-foreground">Call Us</h3>
              <p className="text-sm text-muted-foreground">+256 786 764 239</p>
              <p className="text-sm text-muted-foreground">+256 751 719 313</p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-accent">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                <MapPin size={24} />
              </div>
              <h3 className="mb-2 font-bold text-foreground">Visit Us</h3>
              <p className="text-sm text-muted-foreground">Njeru, Uganda</p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-accent">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                <Clock size={24} />
              </div>
              <h3 className="mb-2 font-bold text-foreground">Working Hours</h3>
              <p className="text-sm text-muted-foreground">Mon-Fri: 8AM - 5PM</p>
              <p className="text-sm text-muted-foreground">Sat: 9AM - 1PM</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <div className="mb-8 flex items-center gap-3">
              <BrandLogo size={40} showText={false} />
              <h2 className="text-2xl font-bold text-foreground">Send us a message</h2>
            </div>

            {status === 'success' && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm font-medium" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)' }}>
                <CheckCircle2 size={20} className="shrink-0" />
                Thank you! Your message has been sent successfully.
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm font-medium" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
                <AlertCircle size={20} className="shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Your Name</label>
                <input type="text" name="name" required placeholder="John Doe" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Email Address</label>
                <input type="email" name="email" required placeholder="john@example.com" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Subject</label>
                <input type="text" name="subject" required placeholder="How can we help?" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Message</label>
                <textarea name="message" required rows={5} placeholder="Tell us more about your inquiry..." className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent" />
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                {status === 'loading' ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={18} /> Send Message</>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}