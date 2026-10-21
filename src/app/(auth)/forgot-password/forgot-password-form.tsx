'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { BrandLogo } from '@/components/brand/brand-logo'
import {
  ToastViewport,
  type ToastMessage,
  type ToastTone,
} from '@/components/ui/toast'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const pushToast = (message: string, tone: ToastTone) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }])
  }
  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        pushToast(data?.error?.message ?? 'Failed to send reset email', 'error')
        return
      }

      pushToast('Reset link sent to your email', 'success')
      setSubmittedEmail(values.email)
      setSubmitted(true)
    } catch {
      pushToast('Something went wrong. Please try again.', 'error')
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size={150} showText={false} className="mb-4" />
        <h1 className="text-2xl font-semibold text-foreground">
          Reset your password
        </h1>
      </div>

      <div className="rounded-[10px] bg-card p-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-10">
        {submitted ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
              <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>.
              Follow the instructions to reset your password.
            </p>
            <Link href="/login" className="mt-8 font-medium text-brand-primary hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Enter your ROGELE account email address and we&apos;ll send you a password reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Your ROGELE Email address"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>

              <div className="pt-4 text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-brand-primary hover:underline">
                  Remember password? Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>

      <ToastViewport toasts={toasts} onClose={closeToast} />
    </div>
  )
}