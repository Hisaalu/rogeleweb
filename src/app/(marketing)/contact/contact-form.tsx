'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

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
    <Card className="p-6 shadow-sm sm:p-10">
      <div className="mb-8 flex items-center gap-3">
        <BrandLogo size={40} showText={false} />
        <h2 className="text-2xl font-bold text-foreground">Send us a message</h2>
      </div>

      {status === 'success' && (
        <div className="mb-6 flex items-center gap-3 rounded-sm p-4 text-sm font-medium" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)' }}>
          <CheckCircle2 size={20} className="shrink-0" />
          Thank you! Your message has been sent successfully.
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 flex items-center gap-3 rounded-sm p-4 text-sm font-medium" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
          <AlertCircle size={20} className="shrink-0" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Your Name</label>
          <Input type="text" name="name" required placeholder="John Doe" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Email Address</label>
          <Input type="email" name="email" required placeholder="john@example.com" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Subject</label>
          <Input type="text" name="subject" required placeholder="How can we help?" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Message</label>
          <Textarea name="message" required rows={5} placeholder="Tell us more about your inquiry..." />
        </div>

        <Button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full"
        >
          {status === 'loading' ? (
            <><Loader2 size={18} className="animate-spin mr-2" /> Sending...</>
          ) : (
            <><Send size={18} className="mr-2" /> Send Message</>
          )}
        </Button>
      </form>
    </Card>
  )
}