'use client'

import React from 'react'

export interface ProtectedLayoutPortalContextValue {
  headerContainerRef: React.RefObject<HTMLDivElement>
}

export const ProtectedLayoutPortalContext = React.createContext<
  ProtectedLayoutPortalContextValue | null
>(null)

export function useProtectedLayoutPortals() {
  const context = React.useContext(ProtectedLayoutPortalContext)
  if (!context) {
    throw new Error('useProtectedLayoutPortals must be used within ProtectedLayout')
  }
  return context
}
