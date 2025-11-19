'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { useProtectedLayoutPortals } from '@/app/(protected)/protected-layout-context'

interface ProtectedHeaderPortalProps {
  children: React.ReactNode
}

/**
 * Mounts header content inside the protected layout's fixed header region.
 * Keeps per-page header logic colocated while rendering it above the sidebar.
 */
export function ProtectedHeaderPortal({ children }: ProtectedHeaderPortalProps) {
  const { headerContainerRef } = useProtectedLayoutPortals()
  const [mounted, setMounted] = React.useState(false)

  // Only attempt portal after client-side mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything during SSR or before mount
  if (!mounted || !headerContainerRef.current) {
    return null
  }

  return createPortal(children, headerContainerRef.current)
}
