'use client'

import { Badge } from '@/components/ui/badge'
import { getInitials, formatDate } from '@/lib/utils'
import type { AdminUser, Class } from '@/types/admin'

function displayName(u: AdminUser): string {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || u.email
}

function roleTone(role: string): 'default' | 'info' | 'warning' | 'success' {
  switch (role) {
    case 'admin':
      return 'info'
    case 'teacher':
      return 'warning'
    case 'learner':
      return 'success'
    default:
      return 'default'
  }
}

export function UserProfileCard({
  user,
  classes,
}: {
  user: AdminUser
  classes: Class[]
}) {
  const classObj = user.class_id ? classes.find((c) => c.id === user.class_id) : null
  const name = displayName(user)

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center border-b border-border px-5 py-6 text-center">
        {user.profile_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profile_photo}
            alt={name}
            className="h-20 w-20 rounded-full border-4 border-background object-cover shadow"
          />
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background text-2xl font-semibold text-white shadow"
            style={{ backgroundColor: 'var(--brand-accent)' }}
          >
            {getInitials(name)}
          </div>
        )}
        <h2 className="mt-3 text-lg font-semibold">{name}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Badge tone={roleTone(user.role)}>{user.role}</Badge>
          {user.is_suspended ? (
            <Badge tone="danger">Suspended</Badge>
          ) : user.is_active ? (
            <Badge tone="success">Active</Badge>
          ) : (
            <Badge>Deactivated</Badge>
          )}
          {user.email_verified && <Badge tone="info">Verified</Badge>}
        </div>
      </div>

      <dl className="divide-y divide-border">
        <Row label="User ID" value={`#${user.id}`} />
        <Row label="Class" value={classObj?.name ?? '—'} />
        <Row label="Phone" value={user.phone ?? '—'} />
        <Row label="Joined" value={formatDate(user.created_at)} />
        <Row
          label="Last login"
          value={user.last_login ? formatDate(user.last_login) : 'Never'}
        />
        <Row label="Trial started" value={formatDate(user.trial_start_date)} />
      </dl>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  )
}