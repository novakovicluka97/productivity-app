'use client'

import React from 'react'

export interface ProtectedLayoutPortalContextValue {
  headerContainerRef: React.RefObject<HTMLDivElement>
}

const ProtectedLayoutPortalContext =
  React.createContext<ProtectedLayoutPortalContextValue | null>(null)

export function ProtectedLayoutPortalProvider({
  value,
  children,
}: {
  value: ProtectedLayoutPortalContextValue
  children: React.ReactNode
}) {
  return (
    <ProtectedLayoutPortalContext.Provider value={value}>
      {children}
    </ProtectedLayoutPortalContext.Provider>
  )
}

export function useProtectedLayoutPortals() {
  const context = React.useContext(ProtectedLayoutPortalContext)
  if (!context) {
    throw new Error('useProtectedLayoutPortals must be used within ProtectedLayout')
  }
  return context
}
