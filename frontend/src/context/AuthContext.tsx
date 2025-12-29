import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, AuthState } from '@/types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'todo_app_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY)
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch {
        setState({ user: null, isAuthenticated: false, isLoading: false })
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }, [])

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Симуляция API запроса
    await new Promise((resolve) => setTimeout(resolve, 800))

    const user: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
      createdAt: new Date(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setState({ user, isAuthenticated: true, isLoading: false })
    return true
  }

  const register = async (
    email: string,
    _password: string,
    name: string
  ): Promise<boolean> => {
    // Симуляция API запроса
    await new Promise((resolve) => setTimeout(resolve, 800))

    const user: User = {
      id: crypto.randomUUID(),
      email,
      name,
      createdAt: new Date(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setState({ user, isAuthenticated: true, isLoading: false })
    return true
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }

  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
      setState((prev) => ({ ...prev, user: updatedUser }))
    }
  }

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

