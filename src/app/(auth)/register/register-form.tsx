'use client'

import { useState } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import { Eye, EyeOff, Loader2, Mail, Phone, User, Lock, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

import { BrandLogo } from '@/components/brand/brand-logo'
import { useSettings } from '@/components/settings/settings-provider'
import { useToast } from '@/components/ui/toast-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
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
  const { getSetting } = useSettings()
  const { showToast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const pageTitle = getSetting('site.browser_title') || 'NexaT'

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
    <div className="mx-auto w-full max-w-xl space-y-6 px-4">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size={120} showText={false} className="mb-2" />
        <h1 className="text-2xl font-bold text-foreground">
          Welcome to {pageTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let&apos;s get you started with an account.
        </p>
      </div>

      <Card className="p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="relative">
                <User size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="First name"
                  className="pl-8"
                  {...register('first_name')}
                />
              </div>
              {errors.first_name && <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.first_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <User size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Last name"
                  className="pl-8"
                  {...register('last_name')}
                />
              </div>
              {errors.last_name && <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Mail size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className="pl-8"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex gap-2">
              <span className="flex h-8 w-[60px] shrink-0 items-center justify-center rounded-sm border border-input bg-muted text-sm font-medium text-muted-foreground">
                +256
              </span>
              <div className="relative flex-1">
                <Phone size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="700000000"
                  maxLength={9}
                  className="pl-8"
                  {...phoneRegister}
                />
              </div>
            </div>
            {errors.phone && <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Select
                {...register('class_id')}
              >
                <option value="">Pick Class/Club</option>
                {classes.length === 0 ? (
                  <option value="" disabled>No classes available</option>
                ) : (
                  classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                )}
              </Select>
            </div>
            {errors.class_id && <p className="text-xs" style={{ color: 'var(--danger-fg)' }}>{errors.class_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Lock size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Set Password"
                autoComplete="new-password"
                className="pl-8 pr-10"
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
              <Lock size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                autoComplete="new-password"
                className="pl-8 pr-10"
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
          
          <div className="pt-2 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/terms-of-service" target="_blank" className="font-medium hover:underline" style={{ color: 'var(--brand-primary)' }}>
              Terms
            </Link>{' '}
            &{' '}
            <Link href="/privacy-policy" target="_blank" className="font-medium hover:underline" style={{ color: 'var(--brand-primary)' }}>
              Policy
            </Link>.
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>

          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--brand-primary)' }}>
              Log in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}