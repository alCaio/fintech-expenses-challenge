import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from './useAuth'

interface RedirectState {
  from?: string
}

export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <Spinner fullPage />
  }

  if (status === 'anonymous') {
    const state: RedirectState = { from: `${location.pathname}${location.search}` }
    return <Navigate to="/login" replace state={state} />
  }

  return <Outlet />
}

export function GuestOnly() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <Spinner fullPage />
  }

  if (status === 'authenticated') {
    const from = (location.state as RedirectState | null)?.from ?? '/'
    return <Navigate to={from} replace />
  }

  return <Outlet />
}
