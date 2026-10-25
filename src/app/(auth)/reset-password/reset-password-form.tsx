'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BrandLogo } from '@/components/brand/brand-logo'
import { useBranding } from '@/components/brand/brand-provider'
import { useToast } from '@/components/ui/toast-provider'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type FormValues = z.infer<typeof schema>

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const branding = useBranding()
  const { showToast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm_password: '' },
  })

  async function onSubmit(values: FormValues) {
    if (!token) {
      showToast('Invalid or missing reset token. Please request a new link.', 'error')
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error?.message ?? 'Failed to reset password')
      }

      showToast('Password reset successfully! Redirecting to login...', 'success')
      
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      showToast(message, 'error')
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Invalid Link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password" className="inline-block w-full rounded-full py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-primary)' }}>
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size={150} showText={false} className="mb-4" />
        <h1 className="text-2xl font-semibold text-foreground">
          Reset Password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          for your {branding.schoolName || 'ROGELE'} account
        </p>
      </div>

      <div className="rounded-[10px] bg-card p-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                autoComplete="new-password"
                {...register('password')}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground transition hover:text-brand-accent"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm New Password"
                autoComplete="new-password"
                {...register('confirm_password')}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground transition hover:text-brand-accent"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirm_password && <p className="mt-1 text-xs text-destructive">{errors.confirm_password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: 'var(--brand-accent)' }}
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>

    </div>
  )
}