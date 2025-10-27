 import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('sl_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const login = (data) => {
    // data may include: { email, name, role }
    setUser(data)
    localStorage.setItem('sl_user', JSON.stringify(data))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sl_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
