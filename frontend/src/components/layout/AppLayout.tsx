import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transações', end: false },
  { to: '/categories', label: 'Categorias', end: false },
] as const

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">Fintech Expenses</span>
          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="topbar-user">
            <span className="muted">{user?.name}</span>
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
