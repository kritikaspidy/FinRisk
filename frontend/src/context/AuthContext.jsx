import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('token'))
  const [user,  setUser]    = useState(() => {
    const t = localStorage.getItem('token')
    if (!t) return null
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      return payload
    } catch { return null }
  })

  const login = (accessToken) => {
    localStorage.setItem('token', accessToken)
    setToken(accessToken)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      setUser(payload)
    } catch { setUser(null) }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
