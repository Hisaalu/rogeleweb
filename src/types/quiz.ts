export interface Quiz {
  id: number
  title: string
  description?: string
  subject_id?: number
  class_id?: number
  teacher_id?: number
  time_limit?: number
  passing_score: number
  max_attempts: number
  is_published: boolean
  is_approved: boolean
  approved_at?: string
  approved_by?: number
  start_date?: string
  end_date?: string
  status: string
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: number
  quiz_id?: number
  question: string
  option_a?: string
  option_b?: string
  option_c?: string
  option_d?: string
  correct_answer?: 'A' | 'B' | 'C' | 'D' | null
  points: number
  explanation?: string
  created_at: string
}

export type QuizAttemptStatus = 'in_progress' | 'completed' | 'expired'

export interface QuizAttempt {
  id: number
  quiz_id?: number
  user_id?: number
  score?: number
  total_questions?: number
  correct_answers?: number
  time_taken?: number
  status: QuizAttemptStatus
  started_at: string
  completed_at?: string
  student_email?: string
  student_first_name?: string
  student_last_name?: string
  student_registration_number?: string
}

export interface QuizAttemptAnswer {
  id: number
  attempt_id: number
  question_id: number
  selected_answer?: number
  is_correct: boolean
  created_at: string
}

export interface CreateQuizPayload {
  title: string
  description?: string
  subject_id?: number
  class_id?: number
  time_limit?: number
  passing_score?: number
  max_attempts?: number
  start_date?: string
  end_date?: string
}

export interface UpdateQuizPayload {
  title?: string
  description?: string
  subject_id?: number
  class_id?: number
  time_limit?: number
  passing_score?: number
  max_attempts?: number
  is_published?: boolean
  start_date?: string
  end_date?: string
}

export interface CreateQuestionPayload {
  question: string
  option_a?: string
  option_b?: string
  option_c?: string
  option_d?: string
  correct_answer?: 'A' | 'B' | 'C' | 'D'
  points?: number
  explanation?: string
}

export interface AnswerInput {
  question_id: number
  selected_answer?: number
}