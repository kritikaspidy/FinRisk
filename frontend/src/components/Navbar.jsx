import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const L = ({ to, children }) => <NavLink to={to}>{children}</NavLink>
  return (
    <header className="top">
      <Link to="/" className="logo">FinRisk</Link>
      <nav aria-label="Main">
        {user && <L to="/apply">New assessment</L>}
        {user && <L to="/my-applications">My history</L>}
        {isAdmin && <L to="/admin">The book</L>}
        {user
          ? <button className="btn sm" onClick={() => { logout(); navigate('/login') }}>Log out</button>
          : <><L to="/login">Log in</L><Link to="/signup" className="btn pri sm">Sign up</Link></>}
      </nav>
    </header>
  )
}
