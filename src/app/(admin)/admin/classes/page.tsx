import type { Metadata } from 'next'
import { listClassesServer } from '@/lib/classes.server'
import type { Class } from '@/types/admin'
import { ClassesView } from './classes-view'

export const metadata: Metadata = {
  title: 'Classes',
}

export default async function AdminClassesPage() {
  let classes: Class[] = []
  try {
    classes = await listClassesServer({ per_page: 100 })
  } catch {
    classes = []
  }

  return <ClassesView initialClasses={classes} />
}