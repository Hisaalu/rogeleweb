'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export interface ActivePageHeader {
  title: string
  fallbackHref?: string
  action?: ReactNode
}

interface PageHeaderContextValue {
  header: ActivePageHeader | null
  setHeader: (header: ActivePageHeader | null) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null)

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<ActivePageHeader | null>(null)

  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  )
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext)
  if (!context) {
    throw new Error('usePageHeader must be used within a PageHeaderProvider')
  }
  return context
}