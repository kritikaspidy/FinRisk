import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Apply from './pages/Apply'
import MyApplications from './pages/MyApplications'
import Admin from './pages/Admin'

export default function App() {
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', background: 'var(--ink)' }}>
        <Navbar />
        <Routes>
          <Route path="/"        element={<Navigate to="/apply" replace />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/signup"  element={<Signup />} />
          <Route path="/apply"   element={<ProtectedRoute><Apply /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="/admin"   element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
