'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { ThemeToggle } from '@/components/theme-toggle'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

function LoginSplashOverlay() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading your dashboard"
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-200"
    >
      <img
        src="/images/logo.png"
        alt="Logo"
        className="h-32 w-32 animate-pulse object-contain sm:h-40 sm:w-40"
      />
    </div>,
    document.body,
  )
}

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const nextPath = params.get('next')
  const branding = useBranding()
  const { getSetting } = useSettings()
  const { showToast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [navigating, setNavigating] = useState(false)

  const pageTitle = getSetting('site.browser_title') || branding.schoolName

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        showToast(data?.error?.message ?? 'Invalid credentials', 'error')
        return
      }

      const role = data?.role ?? data?.user?.role ?? 'learner'
      const dest =
        role === 'admin'
          ? '/admin'
          : role === 'teacher'
            ? '/teacher/dashboard'
            : '/learner/dashboard'

      setNavigating(true)
      router.replace(nextPath || dest)
    } catch {
      setNavigating(false)
      showToast('Something went wrong. Please try again.', 'error')
    }
  }

  const busy = isSubmitting || navigating

  return (
    <>
      {navigating && <LoginSplashOverlay />}

      <div className="w-full space-y-6">
        <div className="flex flex-col items-center text-center">
          <BrandLogo size={150} showText={false} className="mb-4" />

          <h1 className="text-2xl font-semibold text-foreground">
            Login to {pageTitle}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {branding.schoolName} {branding.tagline ? ` ${branding.tagline}` : ''}
          </p>
        </div>

        <Card className="p-8 shadow-sm sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Your Email address"
                disabled={busy}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your Password"
                  disabled={busy}
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={busy}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pb-4 pt-2 text-sm">
              <a
                href="/forgot-password"
                className="font-medium hover:underline"
              >
                Forgot password?
              </a>
              <a
                href="/register"
                className="font-medium hover:underline"
              >
                Create account
              </a>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full"
            >
              {busy && <Loader2 size={16} className="mr-2 animate-spin" />}
              {navigating
                ? 'Opening dashboard...'
                : isSubmitting
                  ? 'Logging in...'
                  : 'Log in'}
            </Button>
          </form>
        </Card>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
    </>
  )
}