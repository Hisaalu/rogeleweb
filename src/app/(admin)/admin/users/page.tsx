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
  const [usersResult, classesResult] = await Promise.allSettled([
    listUsersServer({ page: 1, per_page: 20 }),
    listClassesForFilterServer(),
  ])

  const users = usersResult.status === 'fulfilled' ? usersResult.value.users : []
  const meta = usersResult.status === 'fulfilled' 
    ? usersResult.value.meta 
    : { page: 1, per_page: 20, total: 0, last_page: 1 }
  const classes = classesResult.status === 'fulfilled' ? classesResult.value : []

  return <UsersView initialUsers={users} initialMeta={meta} classes={classes} />
}