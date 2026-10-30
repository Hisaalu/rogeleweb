import type { Metadata } from 'next'
import { fetchPublicSettings } from '@/lib/settings.server'
import { ResetPasswordForm } from './reset-password-form'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const customTitle = settings['site.browser_title']?.trim()
  return {
    title: customTitle ? `Reset Password` : 'Reset Password',
  }
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}