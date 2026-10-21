'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { BrandLogo } from '@/components/brand/brand-logo'
import { useBranding } from '@/components/brand/brand-provider'
import {
  ToastViewport,
  type ToastMessage,
  type ToastTone,
} from '@/components/ui/toast'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const nextPath = params.get('next') ?? '/dashboard'
  const branding = useBranding()

  const [showPassword, setShowPassword] = useState(false)
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
        pushToast(data?.error?.message ?? 'Invalid credentials', 'error')
        return
      }

      setTimeout(() => {
        router.replace(nextPath)
        router.refresh()
      }, 800)
    } catch {
      pushToast('Something went wrong. Please try again.', 'error')
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size={150} showText={false} className="mb-4" />
        <h1 className="text-2xl font-semibold text-foreground">
          Login to {branding.schoolName || 'ROGELE'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {branding.tagline || 'Rays of Grace E-Learning'}
        </p>
      </div>

      <div className="rounded-[10px] bg-card p-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Your Email address"
              {...register('email')}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="relative space-y-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your Password"
              {...register('password')}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground transition hover:text-brand-accent"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 pb-4 text-sm">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: 'var(--brand-accent)' }}
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>

      <ToastViewport toasts={toasts} onClose={closeToast} />
    </div>
  )
}