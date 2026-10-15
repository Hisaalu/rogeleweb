import type { Metadata } from 'next'
import {
  listClassesForFilterServer,
  listUsersServer,
} from '@/lib/users.server'
import type { AdminUser, Class, UserListMeta } from '@/types/admin'
import { UsersView } from './users-view'

export const metadata: Metadata = {
  title: 'Users',
}

export default async function AdminUsersPage() {
  let users: AdminUser[] = []
  let meta: UserListMeta = { page: 1, per_page: 20, total: 0, last_page: 1 }
  let classes: Class[] = []

  try {
    const result = await listUsersServer({ page: 1, per_page: 20 })
    users = result.users
    meta = result.meta
  } catch {
    users = []
  }
  try {
    classes = await listClassesForFilterServer()
  } catch {
    classes = []
  }

  return <UsersView initialUsers={users} initialMeta={meta} classes={classes} />
}