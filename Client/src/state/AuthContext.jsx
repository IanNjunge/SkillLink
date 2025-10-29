import { createContext, useContext, useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
// debug: show where requests go
console.log('[Auth] BASE_URL =', BASE_URL)
const TOKEN_KEY = 'sl_token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      // invalid or missing token; don't call /auth/me
      if (token) localStorage.removeItem(TOKEN_KEY)
      setLoading(false)
      return
    }
    fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async r => {
        if (!r.ok) {
          const t = await r.text().catch(()=> '')
          console.error('[Auth] /auth/me failed', r.status, t)
          if (r.status === 401 || r.status === 422) {
            localStorage.removeItem(TOKEN_KEY)
          }
          throw new Error('me failed')
        }
        return r.json()
      })
      .then(identity => setUser(identity))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const e = (email || '').trim().toLowerCase()
    const p = (password || '')
    console.log('[Auth] logging in to', `${BASE_URL}/auth/login`, 'email=', e)
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: e, password: p })
    })
    if (!res.ok) {
      const text = await res.text().catch(()=> '')
      console.error('[Auth] login failed', res.status, text)
      localStorage.removeItem(TOKEN_KEY)
      throw new Error(text || 'Login failed')
    }
    const data = await res.json()
    const token = data.access_token
    if (!token) throw new Error('No token')
    localStorage.setItem(TOKEN_KEY, token)
    // if server returned user alongside token, use it directly
    if (data.user && data.user.role) {
      setUser(data.user)
      return data.user
    }
    // otherwise fetch identity
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
    if (!meRes.ok) {
      const text = await meRes.text().catch(()=> '')
      console.error('[Auth] /auth/me failed', meRes.status, text)
      if (meRes.status === 401 || meRes.status === 422) {
        localStorage.removeItem(TOKEN_KEY)
      }
      throw new Error(text || 'Unable to fetch identity')
    }
    const identity = await meRes.json()
    setUser(identity)
    return identity
  }

  const register = async (email, password, name, role = 'learner') => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role })
    })
    if (!res.ok) throw new Error('Registration failed')
    // After register, prompt to login
    return true
  }

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY)
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
