'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, ChevronRight, ArrowUp, Globe } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { useBranding } from '@/components/brand/brand-provider'
import { useSettings } from '@/components/settings/settings-provider'
import { useEffect, useState } from 'react'

export function PublicFooter() {
  const branding = useBranding()
  const { getSetting } = useSettings()
  const [showBackToTop, setShowBackToTop] = useState(false)
  const currentYear = new Date().getFullYear()

  const phone = getSetting('contact.phone')
  const email = getSetting('contact.email') || branding.supportEmail
  const address = getSetting('contact.address')
  const facebook = getSetting('social.facebook')
  const twitter = getSetting('social.twitter')
  const linkedin = getSetting('social.linkedin')
  const youtube = getSetting('social.youtube')
  const website = branding.websiteUrl
  
  // Added siteTitle to fix the copyright line below
  const siteTitle = getSetting('site.browser_title') || branding.schoolName

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative mt-20 border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="space-y-6">
            <BrandLogo size={45} />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {'Providing quality education through innovative E-learning solutions.'}
            </p>
            
            {(facebook || twitter || linkedin || youtube) && (
              <div className="flex items-center gap-4">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noreferrer" className="text-muted-foreground transition hover:text-brand-accent">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {twitter && (
                  <a href={twitter} target="_blank" rel="noreferrer" className="text-muted-foreground transition hover:text-brand-accent">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground transition hover:text-brand-accent">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
                {youtube && (
                  <a href={youtube} target="_blank" rel="noreferrer" className="text-muted-foreground transition hover:text-brand-accent">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/#about' },
                { label: 'Pricing', href: '/#pricing' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group flex items-center gap-2 text-sm text-muted-foreground transition hover:text-brand-accent">
                    <ChevronRight size={14} className="text-brand-accent opacity-0 transition group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="space-y-3">
              {[
                { label: 'Terms of Service', href: '/terms-of-service' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Login', href: '/login' },
                { label: 'Register', href: '/register' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group flex items-center gap-2 text-sm text-muted-foreground transition hover:text-brand-accent">
                    <ChevronRight size={14} className="text-brand-accent opacity-0 transition group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Contact Us</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {phone && (
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-0.5 shrink-0 text-brand-accent" />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-brand-accent">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 shrink-0 text-brand-accent" />
                  <a href={`mailto:${email}`} className="hover:text-brand-accent">{email}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand-accent" />
                  <span>{address}</span>
                </li>
              )}
              {website && (
                <li className="flex items-start gap-3">
                  <Globe size={16} className="mt-0.5 shrink-0 text-brand-accent" />
                  <a href={website} target="_blank" rel="noreferrer" className="hover:text-brand-accent">{website.replace(/^https?:\/\//, '')}</a>
                </li>
              )}
            </ul>
          </div>

        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            {/* Only this line changed from site.browser_title to siteTitle */}
            &copy; {currentYear} {siteTitle}. All rights reserved.
          </p>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'
        }`}
        style={{ backgroundColor: 'var(--brand-primary)' }}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  )
}