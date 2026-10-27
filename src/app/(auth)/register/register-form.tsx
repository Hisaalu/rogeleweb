'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Mail, Phone, User, Lock, GraduationCap } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

import { BrandLogo } from '@/components/brand/brand-logo'
import { useBranding } from '@/components/brand/brand-provider'
import { useToast } from '@/components/ui/toast-provider'
import { Button } from '@/components/ui/button'
import type { Class } from '@/types/admin'

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length === 9;
  }, 'Please enter a valid 9-digit phone number'),
  class_id: z.string().optional(),
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
      phone: values.phone ? `+256${values.phone}` : undefined,
      class_id: values.class_id ? Number(values.class_id) : undefined,
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
        router.replace('/learner/dashboard')
        router.refresh()
      }, 800)
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    }
  }

  const phoneRegister = register('phone', {
    onChange: (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9)
    }
  })

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size={120} showText={false} className="mb-2" />
        <h1 className="text-2xl font-bold text-foreground">
          Welcome to {branding.schoolName || 'ROGELE'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let's get you started with an account.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">First name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="John"
                  {...register('first_name')}
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
              {errors.first_name && <p className="text-xs text-danger-fg">{errors.first_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Last name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Doe"
                  {...register('last_name')}
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
              {errors.last_name && <p className="text-xs text-danger-fg">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="john@example.com"
                autoComplete="email"
                {...register('email')}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
              />
            </div>
            {errors.email && <p className="text-xs text-danger-fg">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center justify-between">
              <span>Phone number</span>
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <span className="flex h-[42px] w-[70px] shrink-0 items-center justify-center rounded-lg border border-input bg-muted text-sm font-medium text-muted-foreground">
                +256
              </span>
              <div className="relative flex-1">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="701234567"
                  maxLength={9}
                  {...phoneRegister}
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
            </div>
            {errors.phone && <p className="text-xs text-danger-fg">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center justify-between">
              <span>Class / Club</span>
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                {...register('class_id')}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 appearance-none"
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
            </div>
            {errors.class_id && <p className="text-xs text-danger-fg">{errors.class_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...register('password')}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-12 py-2.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger-fg">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                autoComplete="new-password"
                {...register('confirm_password')}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-12 py-2.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition hover:text-foreground"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-xs text-danger-fg">{errors.confirm_password.message}</p>}
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/terms-of-service" target="_blank" className="text-brand-primary hover:underline font-medium">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy-policy" target="_blank" className="text-brand-primary hover:underline font-medium">Privacy Policy</Link>.
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-sm"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>

          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-primary hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}