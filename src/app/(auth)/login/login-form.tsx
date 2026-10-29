'use client'

import { useState } from 'react'
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

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const nextPath = params.get('next')
  const branding = useBranding()
  const { getSetting } = useSettings()
  const { showToast } = useToast()

  const [showPassword, setShowPassword] = useState(false)

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

      router.replace(nextPath || dest)
      router.refresh()
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    }
  }

  return (
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
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your Password"
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 pb-4 text-sm">
            <a
              href="/forgot-password"
              className="font-medium hover:underline"
              style={{ color: 'var(--brand-primary)' }}
            >
              Forgot password?
            </a>
            <a
              href="/register"
              className="font-medium hover:underline"
              style={{ color: 'var(--brand-primary)' }}
            >
              Create account
            </a>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </Button>
        </form>
      </Card>
    </div>
  )
}