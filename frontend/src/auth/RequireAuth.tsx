import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from './useAuth'

export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <Spinner fullPage />
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function GuestOnly() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <Spinner fullPage />
  }

  return status === 'authenticated' ? <Navigate to="/" replace /> : <Outlet />
}
