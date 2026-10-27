'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'

export function ContactForm() {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error. Please try again.'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
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
  )
}