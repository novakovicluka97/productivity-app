import { redirect } from 'next/navigation'

/**
 * Root page – forward visitors to the public dashboard.
 */
export default function RootPage() {
  redirect('/app')
}
