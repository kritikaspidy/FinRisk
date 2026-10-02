import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const onLanding = useLocation().pathname === '/'
  const L = ({ to, children }) => <NavLink to={to}>{children}</NavLink>
  return (
    <header className="top">
      <div className="top-in">
        <Link to={user ? '/home' : '/'} className="logo">FinRisk</Link>
        <nav aria-label="Main">
          {user ? <>
            <L to="/home">Home</L>
            <L to="/apply">Calculate score</L>
            <L to="/my-applications">My history</L>
            {isAdmin && <L to="/admin">Review queue</L>}
            <button className="btn sm" onClick={() => { logout(); navigate('/') }}>Log out</button>
          </> : <>
            {onLanding && <><a href="#how">How it works</a><a href="#verdict">The verdict</a><a href="#inputs">What it checks</a></>}
            <L to="/login">Log in</L>
            <Link to="/signup" className="btn pri sm">Sign up</Link>
          </>}
        </nav>
      </div>
    </header>
  )
}
