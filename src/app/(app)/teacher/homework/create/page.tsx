import { listClassesServer, listSubjectsServer } from '@/lib/lessons.server'
import { HomeworkForm } from '../components/homework-form'

export default async function CreateHomeworkPage() {
  const [classes, subjects] = await Promise.all([listClassesServer(), listSubjectsServer()])
  return <HomeworkForm classes={classes} subjects={subjects} mode="create" />
}