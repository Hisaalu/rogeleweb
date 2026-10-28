'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogIn, UserPlus, Home, Info, Tags, Mail, Sun, Moon } from 'lucide-react'
import { useBranding } from '@/components/brand/brand-provider'
import { useTheme } from '@/components/theme-provider'

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentHash, setCurrentHash] = useState('')
  const branding = useBranding()
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash)
    }

    handleHashChange()

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [pathname])

  const getIsActive = (href: string) => {
    if (href === '/') return pathname === '/' && !currentHash
    if (href === '/#about') return pathname === '/' && currentHash === '#about'
    if (href === '/#pricing') return pathname === '/' && currentHash === '#pricing'
    if (href === '/contact') return pathname === '/contact'
    return false
  }

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/#about', icon: Info },
    { name: 'Pricing', href: '/#pricing', icon: Tags },
    { name: 'Contact', href: '/contact', icon: Mail },
  ]

  const handleNavClick = (href: string, e?: React.MouseEvent) => {
    setIsOpen(false)

    if (href.startsWith('/#')) {
      e?.preventDefault()
      
      const hash = href.replace('/', '')
      
      if (pathname === '/') {
        const el = document.getElementById(hash.replace('#', ''))
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          window.history.replaceState(null, '', hash)
          setCurrentHash(hash)
        }
      } else {
        router.push(`/${hash}`)
        setCurrentHash(hash)
      }
    } else {
      setCurrentHash('')
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <Link href="/" onClick={(e) => handleNavClick('/', e)} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              {branding.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt={branding.schoolName}
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                  priority
                  unoptimized
                />
              ) : (
                <div 
                  className="flex h-full w-full items-center justify-center font-bold text-white"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  {branding.schoolName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold leading-tight truncate max-w-[200px]" style={{ color: 'var(--brand-primary)' }}>
                {branding.schoolName}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight truncate max-w-[200px]">
                {branding.tagline}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => {
              const active = getIsActive(link.href)
              const Icon = link.icon
              const isHashLink = link.href.startsWith('/#')
              
              if (isHashLink) {
                return (
                  <a 
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(link.href, e)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand-accent ${
                      active ? 'text-brand-accent' : 'text-foreground'
                    }`}
                  >
                    <Icon size={16} /> {link.name}
                  </a>
                )
              }

              return (
                <Link 
                  key={link.name}
                  href={link.href} 
                  onClick={(e) => handleNavClick(link.href, e)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand-accent ${
                    active ? 'text-brand-accent' : 'text-foreground'
                  }`}
                >
                  <Icon size={16} /> {link.name}
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link href="/login" className="flex items-center gap-2 rounded-full border-2 border-brand-primary px-5 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white">
              <LogIn size={16} /> Login
            </Link>
            <Link href="/register" className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-primary)' }}>
              <UserPlus size={16} /> Sign Up
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button onClick={() => setIsOpen(true)} className="rounded-lg p-2 hover:bg-muted">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="flex h-full w-[80%] max-w-sm flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                  {branding.logoUrl ? (
                    <Image
                      src={branding.logoUrl}
                      alt={branding.schoolName}
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <div 
                      className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    >
                      {branding.schoolName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-bold leading-tight truncate max-w-[150px]" style={{ color: 'var(--brand-primary)' }}>
                    {branding.schoolName}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight truncate max-w-[150px]">
                    {branding.tagline}
                  </span>
                </div>
              </div>
              
              <button onClick={() => setIsOpen(false)} className="rounded-full bg-muted p-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 space-y-2 p-4">
              {navLinks.map((link) => {
                const active = getIsActive(link.href)
                const Icon = link.icon
                const isHashLink = link.href.startsWith('/#')

                if (isHashLink) {
                  return (
                    <a 
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavClick(link.href, e)}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                        active ? 'bg-brand-accent/10 text-brand-accent' : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <Icon size={18} /> {link.name}
                    </a>
                  )
                }

                return (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    onClick={(e) => handleNavClick(link.href, e)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      active ? 'bg-brand-accent/10 text-brand-accent' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Icon size={18} /> {link.name}
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-border p-4 space-y-3">
              <Link href="/login" onClick={() => setIsOpen(false)} className="flex w-full items-center justify-center rounded-full border-2 border-brand-primary py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white">
                <LogIn size={16} className="mr-2" /> Login
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <UserPlus size={16} className="mr-2" /> Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}