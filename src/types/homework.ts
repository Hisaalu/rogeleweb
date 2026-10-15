export type HomeworkStatus = 'pending' | 'submitted' | 'late' | 'graded'

export interface Homework {
  id: number
  teacher_id: number
  class_id: number
  subject_id: number
  title: string
  description?: string
  due_date: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface HomeworkAttachment {
  id: number
  homework_id: number
  file_name: string
  file_path: string
  file_type?: string
  file_size?: number
  uploaded_at: string
}

export interface HomeworkSubmission {
  id: number
  homework_id: number
  student_id: number
  text_answer?: string
  grade?: number
  feedback?: string
  status: HomeworkStatus
  submitted_at?: string
  graded_at?: string
  created_at: string
  updated_at?: string
}

export interface SubmissionFile {
  id: number
  submission_id: number
  file_name: string
  file_path: string
  file_type?: string
  file_size?: number
  uploaded_at: string
}

export interface CreateHomeworkPayload {
  class_id: number
  subject_id: number
  title: string
  description?: string
  due_date: string
}

export interface UpdateHomeworkPayload {
  class_id?: number
  subject_id?: number
  title?: string
  description?: string
  due_date?: string
  is_active?: boolean
}