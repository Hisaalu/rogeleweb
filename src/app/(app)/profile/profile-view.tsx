'use client'

import { useBranding } from '@/components/brand/brand-provider'
import { getInitials, formatDate } from '@/lib/utils'
import type { User } from '@/types/api'

export function ProfileView({ profile }: { profile: User }) {
  const branding = useBranding()
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {profile.profile_photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_photo}
                alt={fullName}
                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white text-3xl font-semibold text-white shadow-lg"
                style={{ backgroundColor: branding.colorAccent }}
              >
                {getInitials(fullName)}
              </div>
            )}
            <h2 className="mt-4 text-lg font-semibold">{fullName}</h2>
            <p className="text-sm capitalize text-muted-foreground">{profile.role}</p>
          </div>

          <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
            <Row label="Email" value={profile.email} />
            <Row label="Phone" value={profile.phone ?? '—'} />
            <Row label="Member since" value={formatDate(profile.created_at)} />
            {profile.last_login && (
              <Row label="Last login" value={formatDate(profile.last_login)} />
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h3 className="text-base font-semibold">Personal information</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates to your profile will be saved when you submit the form.
          </p>

          <form className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="First name" name="first_name" defaultValue={profile.first_name ?? ''} />
            <Field label="Last name" name="last_name" defaultValue={profile.last_name ?? ''} />
            <Field label="Email" name="email" type="email" defaultValue={profile.email} readOnly />
            <Field label="Phone" name="phone" defaultValue={profile.phone ?? ''} />

            <div className="sm:col-span-2">
              <button
                type="button"
                disabled
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white opacity-60"
                style={{ backgroundColor: branding.colorPrimary }}
              >
                Save changes (coming soon)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium text-foreground">{value}</dd>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  readOnly,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  readOnly?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25 read-only:bg-muted read-only:text-muted-foreground"
      />
    </label>
  )
}