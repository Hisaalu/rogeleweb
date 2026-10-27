import type { Metadata } from 'next'
import { fetchPublicSettings } from '@/lib/settings.server.public'
import { LoginForm } from './login-form'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const customTitle = settings['site.browser_title']?.trim()
  return {
    title: customTitle ? `Login` : 'Login',
  }
}

export default function LoginPage() {
  return <LoginForm />
}