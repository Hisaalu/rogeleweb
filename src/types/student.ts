import type { AdminUser } from './admin'
import type { QuizAttempt } from './quiz'

export interface StudentListItem extends AdminUser {
  class_name?: string
  quizzes_taken?: number
  avg_score?: number
}

export interface StudentDetailsResponse {
  user: AdminUser
  attempts: QuizAttempt[]
}