"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, LoginSession } from './types'

interface AuthContextType {
  user: Omit<User, "password"> | null
  currentSession: LoginSession | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<boolean>
  updateUserProfile: (userData: Partial<Omit<User, "id" | "password">>) => Promise<boolean>
  isLoading: boolean
  setUser: (user: Omit<User, "password"> | null) => void
  getAuthHeaders: () => { token: string; tokenType: string } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)
  const [currentSession, setCurrentSession] = useState<LoginSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get auth headers helper function
  const getAuthHeaders = () => {
    if (user?.token && user?.tokenType) {
      return {
        token: user.token,
        tokenType: user.tokenType.charAt(0).toUpperCase() + user.tokenType.slice(1).toLowerCase() === 'Bearer' ? 'Bearer' : 'Bearer'
      }
    }
    return null
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have stored user data
        const storedUser = localStorage.getItem('user')
        const storedSession = localStorage.getItem('currentSession')
        
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          console.log('Loaded user from localStorage:', userData)
          setUser(userData)
        }
        
        if (storedSession) {
          const sessionData = JSON.parse(storedSession)
          setCurrentSession(sessionData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const userData: Omit<User, "password"> = {
          id: data.user?.id || 1,
          name: data.user?.full_name || 'User',
          email: data.user?.email || email,
          role: data.user?.role || 'User',
          is_active: data.user?.is_active || true,
          created_at: data.user?.created_at || new Date().toISOString(),
          token: data?.access_token,
          tokenType: data?.token_type || 'Bearer'
        }

        const sessionData: LoginSession = {
          id: data.session_id || `session_${Date.now()}`,
          userId: userData.id.toString(),
          loginTime: new Date().toISOString(),
          logoutTime: null,
          duration: null,
          isCompleted: false,
          isMinimumHoursMet: false,
        }

        setUser(userData)
        setCurrentSession(sessionData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('currentSession', JSON.stringify(sessionData))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<boolean> => {
    try {
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          logoutTime: new Date().toISOString(),
          duration: Math.floor((Date.now() - new Date(currentSession.loginTime).getTime()) / (1000 * 60)),
          isCompleted: true,
        }
        localStorage.setItem('currentSession', JSON.stringify(updatedSession))
      }

      setUser(null)
      setCurrentSession(null)
      localStorage.removeItem('user')
      localStorage.removeItem('currentSession')

      try {
        await fetch('/api/logout', { method: 'POST' })
      } catch (error) {
        console.log('Logout API call failed, but continuing with local logout')
      }
      
      return true
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }

  const updateUserProfile = async (userData: Partial<Omit<User, "id" | "password">>): Promise<boolean> => {
    if (!user) return false

    try {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return true
    } catch (error) {
      console.error('Error updating user profile:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      currentSession,
      login,
      logout,
      updateUserProfile,
      isLoading,
      setUser,
      getAuthHeaders,
    }}>
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
