import type { Metadata } from 'next'
import { listClassesServer, listSubjectsServer } from '@/lib/lessons.server'
import { HomeworkForm } from '../components/homework-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Create Homework' }

export default async function CreateHomeworkPage() {
  const [classes, subjects] = await Promise.all([listClassesServer(), listSubjectsServer()])
  return <HomeworkForm classes={classes} subjects={subjects} mode="create" />
}