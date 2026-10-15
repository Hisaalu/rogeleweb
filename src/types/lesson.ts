export interface Lesson {
  id: number
  title: string
  content?: string
  subject_id?: number
  class_id?: number
  teacher_id?: number
  video_url?: string
  duration?: number
  is_published: boolean
  is_approved: boolean
  views: number
  created_at: string
  updated_at?: string
}

export interface LessonMaterial {
  id: number
  lesson_id?: number
  file_name?: string
  file_path?: string
  file_type?: string
  file_size?: number
  download_count: number
  created_at: string
}

export interface CreateLessonPayload {
  title: string
  content?: string
  subject_id?: number
  class_id?: number
  video_url?: string
  duration?: number
  is_published?: boolean
}

export interface UpdateLessonPayload {
  title?: string
  content?: string
  subject_id?: number
  class_id?: number
  video_url?: string
  duration?: number
  is_published?: boolean
}

export interface Class {
  id: number
  name: string
  level: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface Subject {
  id: number
  name: string
  code?: string
  description?: string
  class_id?: number
  teacher_id?: number
  is_active: boolean
  created_at: string
}