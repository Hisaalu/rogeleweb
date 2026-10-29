'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { BrandLogo } from '@/components/brand/brand-logo'
import { useBranding } from '@/components/brand/brand-provider'
import { useSettings } from '@/components/settings/settings-provider'
import { useToast } from '@/components/ui/toast-provider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const { showToast } = useToast()
  const branding = useBranding()
  const { getSetting } = useSettings()
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const pageTitle = getSetting('site.browser_title') || branding.schoolName || 'NexaT'

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
        showToast(data?.error?.message ?? 'Failed to send reset email', 'error')
        return
      }

      showToast('Reset link sent to your email', 'success')
      setSubmittedEmail(values.email)
      setSubmitted(true)
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
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

      <Card className="p-8 shadow-sm sm:p-10">
        {submitted ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--success-bg)' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--success-fg)' }} />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>.
              Follow the instructions to reset your password.
            </p>
            <Link href="/login" className="mt-8 font-medium hover:underline" style={{ color: 'var(--brand-primary)' }}>
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Enter your {pageTitle} account email address and we&apos;ll send you a password reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  type="email"
                  placeholder={`Your ${pageTitle} Email address`}
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>

              <div className="pt-4 text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--brand-primary)' }}>
                  Remember password? Login
                </Link>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}