"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
  updateUserMetadata: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          return
        }

        if (data?.session) {
          setSession(data.session)
          setUser(data.session.user)
          console.log("Session initialized:", data.session.user.email)

          // Ensure profile exists for existing users
          await ensureProfile(data.session.user)
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email)
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)

      // Handle different auth events
      switch (event) {
        case "SIGNED_UP":
          if (newSession?.user) {
            console.log("User signed up:", newSession.user.email)
            await ensureProfile(newSession.user)
            toast({
              title: "Account Created",
              description: "Please check your email to verify your account.",
            })
          }
          break

        case "SIGNED_IN":
          if (newSession?.user) {
            console.log("User signed in:", newSession.user.email)
            await ensureProfile(newSession.user)
            toast({
              title: "Signed in",
              description: `Welcome back, ${newSession.user.email}!`,
            })
            router.push("/dashboard")
          }
          break

        case "SIGNED_OUT":
          console.log("User signed out")
          toast({
            title: "Signed out",
            description: "You have been signed out.",
          })
          router.push("/")
          break

        case "TOKEN_REFRESHED":
          console.log("Token refreshed")
          break

        case "USER_UPDATED":
          console.log("User updated")
          if (newSession?.user) {
            await ensureProfile(newSession.user)
          }
          break
      }
    })

    return () => subscription.unsubscribe()
  }, [toast, router])

  const ensureProfile = async (user: User) => {
    try {
      console.log("Ensuring profile exists for user:", user.id)

      // First check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected for new users
        console.error("Error checking existing profile:", fetchError)
        return
      }

      if (existingProfile) {
        console.log("Profile already exists for user:", user.id)
        return
      }

      // Create profile if it doesn't exist
      console.log("Creating new profile for user:", user.id)
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || "",
        avatar_url: user.user_metadata?.avatar_url || null,
      })

      if (insertError) {
        console.error("Error creating profile:", insertError)
        // Don't throw error as this might be due to trigger already creating the profile
      } else {
        console.log("Profile created successfully for user:", user.id)
      }
    } catch (error) {
      console.error("Error in ensureProfile:", error)
    }
  }

  const updateUserMetadata = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      })

      if (error) {
        console.error("Error updating user metadata:", error)
      } else {
        console.log("User metadata updated successfully")
      }
    } catch (error) {
      console.error("Error in updateUserMetadata:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      console.error("Sign up error:", error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserMetadata,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
