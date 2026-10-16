'use client'

import { getInitials, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminUser } from '@/types/admin'

function displayName(u: AdminUser): string {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || u.email
}

export function AdminProfileView({ profile }: { profile: AdminUser }) {
  const name = displayName(profile)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your admin account details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 text-center">
            {profile.profile_photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_photo}
                alt={name}
                className="h-24 w-24 rounded-full border-4 border-background object-cover shadow"
              />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background text-2xl font-semibold text-white shadow"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              >
                {getInitials(name)}
              </div>
            )}
            <h2 className="mt-4 text-lg font-semibold">{name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Badge tone="info">{profile.role}</Badge>
              {profile.is_active && !profile.is_suspended ? (
                <Badge tone="success">Active</Badge>
              ) : (
                <Badge tone="danger">Inactive</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Row label="User ID" value={`#${profile.id}`} />
              <Row label="Email" value={profile.email} />
              <Row label="Phone" value={profile.phone ?? '—'} />
              <Row label="Role" value={profile.role} />
              <Row label="Joined" value={formatDate(profile.created_at)} />
              <Row
                label="Last login"
                value={profile.last_login ? formatDate(profile.last_login) : 'Never'}
              />
            </dl>

            {profile.bio && (
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Bio
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{profile.bio}</p>
              </div>
            )}

            <div className="mt-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              To update your profile details, edit your account under{' '}
              <span className="font-medium">Users</span> in the admin panel.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium">{value}</dd>
    </div>
  )
}