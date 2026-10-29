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
import { useSettings } from '@/components/settings/settings-provider'
import { useToast } from '@/components/ui/toast-provider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
  const { getSetting } = useSettings()
  const { showToast } = useToast()

  const pageTitle = getSetting('site.browser_title') || branding.schoolName || 'NexaT'

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
        <Card className="w-full max-w-md space-y-6 p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Invalid Link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password" className="block w-full">
            <Button className="w-full">
              Request New Link
            </Button>
          </Link>
        </Card>
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
          for your {pageTitle} account
        </p>
      </div>

      <Card className="p-8 shadow-sm sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                autoComplete="new-password"
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm New Password"
                autoComplete="new-password"
                className="pr-10"
                {...register('confirm_password')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition hover:text-foreground"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.confirm_password.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}