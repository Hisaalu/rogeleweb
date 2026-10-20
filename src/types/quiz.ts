export interface Quiz {
  id: number
  title: string
  description?: string | null
  subject_id?: number | null
  subject_name?: string | null
  class_id?: number | null
  class_name?: string | null
  teacher_id?: number | null
  time_limit?: number | null
  passing_score?: number | null
  max_attempts?: number | null
  end_date?: string | null
  is_published: boolean
  question_count?: number
  attempt_count?: number
  created_at: string
}

export interface QuizQuestion {
  id: number
  quiz_id: number
  question_text: string
  options?: string[]
  option_a?: string
  option_b?: string
  option_c?: string
  option_d?: string
  correct_option: number
  points: number
  explanation?: string | null
}

export interface QuizAttempt {
  id: number
  quiz_id: number
  user_id: number
  score?: number | null
  total_questions?: number | null
  correct_answers?: number | null
  time_taken?: number | null
  status: 'in_progress' | 'completed' | 'expired'
  started_at: string
  completed_at?: string | null
  student_email?: string
  student_first_name?: string
  student_last_name?: string
}

export interface QuizResultDetails extends QuizAttempt {
  passing_score?: number
  questions: QuizQuestion[]
  user_answers: Record<string, number>
}