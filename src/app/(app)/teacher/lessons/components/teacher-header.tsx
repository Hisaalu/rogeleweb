'use client'

import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TeacherHeader() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Lessons
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and organize your Lessons
        </p>
      </div>

      <Link href="/teacher/lessons/create" className="shrink-0">
        <Button className="w-full sm:w-auto">
          <PlusCircle size={16} className="mr-2" />
          Create Lesson
        </Button>
      </Link>
    </div>
  )
}