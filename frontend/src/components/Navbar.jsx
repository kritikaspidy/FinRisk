import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  const navLink = (to, label) => (
    <Link to={to} style={{
      fontSize: 13, fontWeight: 500, textDecoration: 'none',
      color: pathname === to ? 'var(--accent)' : 'var(--muted)',
      transition: 'color 0.2s', padding: '4px 0',
      borderBottom: pathname === to ? '1px solid var(--accent)' : '1px solid transparent',
    }}>{label}</Link>
  )

  return (
    <nav style={{
      background: 'var(--card)', borderBottom: '1px solid var(--border)',
      padding: '0 32px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, background: 'var(--accent)', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>F</span>
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#e2e8f0' }}>
          FinRisk
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {user && navLink('/apply', 'Apply')}
        {user && navLink('/my-applications', 'My Applications')}
        {isAdmin && navLink('/admin', 'Admin')}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isAdmin ? 'rgba(147,197,253,0.15)' : 'var(--green-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: isAdmin ? 'var(--blue)' : 'var(--green)',
              }}>
                {isAdmin ? 'A' : 'U'}
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {isAdmin ? 'Admin' : 'User'}
              </span>
            </div>
            <button onClick={handleLogout} style={{
              background: 'transparent', border: '1px solid var(--border2)',
              borderRadius: 6, padding: '5px 12px', fontSize: 12,
              color: 'var(--muted)', cursor: 'pointer',
            }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>Login</Link>
            <Link to="/signup" style={{
              fontSize: 13, fontWeight: 600, color: 'var(--ink)',
              background: 'var(--accent)', padding: '6px 14px',
              borderRadius: 6, textDecoration: 'none',
            }}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
