import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth()
  if (!token)   return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/apply" replace />
  return children
}
