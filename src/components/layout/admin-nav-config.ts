import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  CreditCard,
  DollarSign,
  GraduationCap,
  Mail,
  Settings,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface AdminNavSection {
  id: string
  label: string
  items: AdminNavItem[]
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { label: 'ROGELE Dashboard', href: '/admin', icon: BarChart3 },
      { label: 'ROGELE Activity', href: '/admin/activity', icon: Activity },
      { label: 'ROGELE Analytics', href: '/admin/analytics', icon: ClipboardList },
    ],
  },
  {
    id: 'manage',
    label: 'Manage',
    items: [
      { label: 'User Manager', href: '/admin/users', icon: Users },
      { label: 'Classes', href: '/admin/classes', icon: GraduationCap },
      { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    items: [
      { label: 'Plans & Trial', href: '/admin/plans', icon: CreditCard },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: DollarSign },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    id: 'comms',
    label: 'Communication',
    items: [
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
      { label: 'Email campaigns', href: '/admin/email-campaigns', icon: Mail },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Profile', href: '/admin/profile', icon: User },
    ],
  },
]

function isItemActive(item: AdminNavItem, pathname: string): boolean {
  if (item.href === '/admin') return pathname === '/admin'
  return pathname === item.href || pathname.startsWith(item.href + '/')
}

export function resolveActiveHref(pathname: string): string | null {
  for (const section of ADMIN_NAV_SECTIONS) {
    for (const item of section.items) {
      if (isItemActive(item, pathname)) return item.href
    }
  }
  return null
}

export function resolveActiveLabel(pathname: string): string {
  for (const section of ADMIN_NAV_SECTIONS) {
    for (const item of section.items) {
      if (isItemActive(item, pathname)) return item.label
    }
  }
  return ''
}