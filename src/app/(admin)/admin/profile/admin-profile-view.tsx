'use client'

import React from 'react'
import { Mail, Phone, Shield, Calendar, Clock, User } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminUser } from '@/types/admin'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function displayName(u: AdminUser): string {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || u.email
}

const ProfileRow = React.memo(function ProfileRow({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType
  label: string
  value: string 
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
          {value}
        </dd>
      </div>
    </div>
  )
})

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
        
        <Card className="lg:col-span-1 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col items-center pt-8 pb-6 text-center">
            {profile.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={name}
                className="h-28 w-28 rounded-full border-4 border-background object-cover shadow-sm"
                loading="lazy"
              />
            ) : (
              <div
                className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-background text-3xl font-semibold text-white shadow-sm"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              >
                {getInitials(name)}
              </div>
            )}
            
            <h2 className="mt-4 text-xl font-bold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Mail size={12} />
              {profile.email}
            </p>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge tone="info" className="capitalize">{profile.role}</Badge>
              {profile.is_active && !profile.is_suspended ? (
                <Badge tone="success">Active</Badge>
              ) : (
                <Badge tone="danger">Inactive</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="border-b border-border bg-muted/10 pb-3">
            <CardTitle className="text-base">Account information</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              <ProfileRow icon={User} label="User ID" value={`#${profile.id}`} />
              <ProfileRow icon={Mail} label="Email" value={profile.email} />
              <ProfileRow icon={Phone} label="Phone" value={profile.phone ?? '—'} />
              <ProfileRow icon={Shield} label="Role" value={profile.role} />
              <ProfileRow icon={Calendar} label="Joined" value={dateFormatter.format(new Date(profile.created_at))} />
              <ProfileRow icon={Clock} label="Last login" value={profile.last_login ? dateFormatter.format(new Date(profile.last_login)) : 'Never'} />
            </div>

            {profile.bio && (
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bio
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {profile.bio}
                </p>
              </div>
            )}

            <div className="mt-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              To update your profile details, edit your account under{' '}
              <span className="font-semibold text-foreground">Users</span> in the admin panel.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}