"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User, LoginSession } from "@/lib/types"
import { login as loginAction, logout as logoutAction, getCurrentSession } from "@/lib/actions"

interface AuthContextType {
  user: Omit<User, "password"> | null
  currentSession: LoginSession | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)
  const [currentSession, setCurrentSession] = useState<LoginSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Initialize auth state from localStorage on client side
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedSessionId = localStorage.getItem("sessionId")

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)

        // Fetch current session if user exists
        if (parsedUser?.id && storedSessionId) {
          getCurrentSession(parsedUser.id).then((session) => {
            setCurrentSession(session)
          })
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("sessionId")
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { user: loggedInUser, sessionId } = await loginAction(email, password)

      if (loggedInUser && sessionId) {
        setUser(loggedInUser)
        const session = await getCurrentSession(loggedInUser.id)
        setCurrentSession(session)

        // Store user and session data in localStorage
        localStorage.setItem("user", JSON.stringify(loggedInUser))
        localStorage.setItem("sessionId", sessionId)

        return true
      }

      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const sessionId = localStorage.getItem("sessionId")
      if (!sessionId) return false

      const success = await logoutAction(sessionId)
      if (success) {
        // Clear localStorage and state
        localStorage.removeItem("user")
        localStorage.removeItem("sessionId")
        setUser(null)
        setCurrentSession(null)
        router.push("/login")
        return true
      }

      return false
    } catch (error) {
      console.error("Logout failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, currentSession, login, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
