'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Loader2, X } from 'lucide-react'
import { initiatePaymentClient, getPaymentStatusClient } from '@/lib/payments.client'
import type { PaymentMethod, SubscriptionPlan } from '@/types/subscription'
import { formatMoneyUGX } from '@/lib/format-money'

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 20

export function PaymentModal({
  plan,
  onClose,
  onSuccess,
}: {
  plan: SubscriptionPlan
  onClose: () => void
  onSuccess: () => void
}) {
  const [method, setMethod] = useState<PaymentMethod>('mtn')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, submitting])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatusText(null)

    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 9) {
      setError('Please enter a valid 9-digit phone number')
      return
    }

    setSubmitting(true)
    try {
      const res = await initiatePaymentClient({
        plan_id: plan.id,
        method,
        phone_number: `+256${digits}`,
      })

      setStatusText('Waiting for payment confirmation...')

      let attempts = 0
      const paymentId = res.payment.id
      const interval = setInterval(async () => {
        attempts++
        try {
          const p = await getPaymentStatusClient(paymentId)
          if (p.status === 'completed') {
            clearInterval(interval)
            setStatusText('Payment confirmed!')
            setTimeout(() => onSuccess(), 800)
            return
          }
          if (p.status === 'failed') {
            clearInterval(interval)
            setError('Payment failed or was cancelled. Please try again.')
            setSubmitting(false)
            setStatusText(null)
            return
          }
        } catch {
          // ignore transient errors, keep polling
        }
        if (attempts >= MAX_POLLS) {
          clearInterval(interval)
          setError('Payment is taking longer than expected. Check your notifications.')
          setSubmitting(false)
          setStatusText(null)
        }
      }, POLL_INTERVAL_MS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not initiate payment')
      setSubmitting(false)
      setStatusText(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <h3
            id="payment-modal-title"
            className="flex items-center gap-2 text-sm font-semibold text-white sm:text-base"
          >
            <CreditCard size={18} />
            Complete Payment
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              You&apos;re subscribing to
            </p>
            <p className="mt-1 text-base font-bold text-foreground">{plan.name} Plan</p>
            <p className="mt-2 text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
              {formatMoneyUGX(plan.price)}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Payment Network
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              disabled={submitting}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent disabled:opacity-60"
            >
              <option value="mtn">MTN Mobile Money</option>
              <option value="airtel">Airtel Money</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Mobile Money Phone Number
            </label>
            <div className="flex items-center gap-2">
              <span className="flex h-[46px] w-[60px] shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
                +256
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="772 123 456"
                disabled={submitting}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl border px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--danger-bg)',
                borderColor: 'var(--danger-border)',
                color: 'var(--danger-fg)',
              }}
            >
              {error}
            </div>
          )}

          {statusText && (
            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--warning-bg)',
                borderColor: 'var(--warning-border)',
                color: 'var(--warning-fg)',
              }}
            >
              <Loader2 size={14} className="animate-spin" />
              {statusText}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}