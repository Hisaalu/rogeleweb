export interface Lesson {
  id: number
  title: string
  content?: string | null
  subject_id?: number | null
  subject_name?: string | null
  class_id?: number | null
  class_name?: string | null
  teacher_id?: number | null
  teacher_name?: string | null
  video_url?: string | null
  duration?: number | null
  is_published: boolean
  is_approved: boolean
  views: number
  materials_count: number
  is_bookmarked: boolean
  created_at: string
  updated_at?: string | null
}

export type LessonListItem = Lesson

export interface LessonListMeta {
  page: number
  per_page: number
  total: number
  last_page: number
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

export type UpdateLessonPayload = Partial<CreateLessonPayload>