'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { BrandLogo } from '@/components/brand/brand-logo'
import { useBranding } from '@/components/brand/brand-provider'
import { useToast } from '@/components/ui/toast-provider'
import type { Class } from '@/types/admin'

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(9, 'Please enter a valid 9-digit phone number').max(9, 'Please enter a valid 9-digit phone number'),
  class_id: z.string().min(1, 'Please select your class'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type FormValues = z.infer<typeof schema>

export function RegisterForm({ classes }: { classes: Class[] }) {
  const router = useRouter()
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
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      class_id: '',
      password: '',
      confirm_password: '',
    },
  })

  async function onSubmit(values: FormValues) {
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: `+256${values.phone}`,
      class_id: Number(values.class_id),
      password: values.password,
      role: 'learner' as const,
    }

    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const regData = await regRes.json().catch(() => null)

      if (!regRes.ok) {
        showToast(regData?.error?.message ?? 'Registration failed', 'error')
        return
      }
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      })

      if (!loginRes.ok) {
        showToast('Account created. Please log in.', 'success')
        setTimeout(() => router.push('/login'), 1200)
        return
      }

      showToast('Account created successfully', 'success')
      setTimeout(() => {
        router.replace('/dashboard')
        router.refresh()
      }, 800)
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size={150} showText={false} className="mb-4" />
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome to {branding.schoolName || 'ROGELE'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let&apos;s create your account
        </p>
      </div>

      <div className="rounded-[10px] bg-card p-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <input
                type="text"
                placeholder="First name"
                {...register('first_name')}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
              />
              {errors.first_name && <p className="mt-1 text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Last name"
                {...register('last_name')}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
              />
              {errors.last_name && <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-[46px] w-[70px] shrink-0 items-center justify-center rounded-lg border border-input bg-muted text-sm text-muted-foreground">
                +256
              </span>
              <input
                type="tel"
                placeholder="e.g 701234567"
                {...register('phone')}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div>
            <select
              {...register('class_id')}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
            >
              <option value="">Select Class/Club</option>
              {classes.length === 0 ? (
                <option value="" disabled>No classes available</option>
              ) : (
                classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
            {errors.class_id && <p className="mt-1 text-xs text-destructive">{errors.class_id.message}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
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
                placeholder="Confirm password"
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

          <div className="pt-2 text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="/terms-of-service" target="_blank" className="text-brand-primary hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy-policy" target="_blank" className="text-brand-primary hover:underline">Privacy Policy</a>.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: 'var(--brand-accent)' }}
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>

          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-brand-primary hover:underline">
              Log in
            </a>
          </div>
        </form>
      </div>

    </div>
  )
}