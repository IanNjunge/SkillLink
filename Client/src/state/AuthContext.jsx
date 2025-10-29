import { createContext, useContext, useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    setUser(data.user)
    return data.user
  }

  const register = async (email, password, name, is_mentor = false) => {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, is_mentor }),
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Registration failed')
    const data = await res.json()
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  const deleteAccount = async () => {
    await fetch('/auth/me', { method: 'DELETE', credentials: 'include' })
    setUser(null)
  }

  if (loading) return <div>Loading...</div>

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      deleteAccount,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
