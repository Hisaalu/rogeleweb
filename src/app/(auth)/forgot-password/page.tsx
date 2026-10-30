import type { Metadata } from 'next'
import { fetchPublicSettings } from '@/lib/settings.server'
import { ForgotPasswordForm } from './forgot-password-form'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const customTitle = settings['site.browser_title']?.trim()
  return {
    title: customTitle ? `Forgot Password` : 'Forgot Password',
  }
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}