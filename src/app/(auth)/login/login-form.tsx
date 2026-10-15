'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { useBranding } from '@/components/brand/brand-provider'
import { BrandLogo } from '@/components/brand/brand-logo'
import { ApiClientError } from '@/lib/api-client'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const branding = useBranding()
  const router = useRouter()
  const params = useSearchParams()
  const nextPath = params.get('next') ?? '/dashboard'

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.error?.message ?? 'Login failed'
        throw new ApiClientError(message, data?.error?.code ?? 'LOGIN_FAILED', res.status)
      }

      router.replace(nextPath)
      router.refresh()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="rounded-2xl bg-card p-8 shadow-lg">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandLogo size={64} showText={false} />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Sign in to {branding.schoolName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{branding.tagline}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-brand-accent"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <a
            href="/forgot-password"
            className="font-medium text-brand-primary hover:underline"
          >
            Forgot password?
          </a>
          <a
            href="/register"
            className="font-medium text-brand-primary hover:underline"
          >
            Create account
          </a>
        </div>

        {serverError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          style={{ backgroundColor: branding.colorPrimary }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}