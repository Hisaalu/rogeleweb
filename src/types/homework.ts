export interface Homework {
  id: number
  title: string
  description?: string | null
  class_id: number
  class_name?: string | null
  subject_id: number
  subject_name?: string | null
  teacher_id: number
  due_date: string
  is_active: boolean
  submissions_count?: number
  created_at: string
  submission?: HomeworkSubmission | null
}

export interface HomeworkAttachment {
  id: number
  homework_id: number
  file_name: string
  file_path: string
  file_size: number
  created_at: string
}

export interface HomeworkSubmissionFile {
  id: number
  submission_id: number
  file_name: string
  file_path: string
  file_size: number
  created_at: string
}

export interface HomeworkSubmission {
  id: number
  homework_id: number
  student_id: number
  student_first_name?: string
  student_last_name?: string
  student_email?: string
  text_answer?: string | null
  grade?: number | null
  feedback?: string | null
  status: 'pending' | 'submitted' | 'late' | 'graded'
  submitted_at: string
  files?: HomeworkSubmissionFile[]
}