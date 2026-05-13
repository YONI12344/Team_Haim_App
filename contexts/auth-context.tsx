"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  type User as FirebaseUser 
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase"
import type { User, UserRole } from "@/types"

const COACH_EMAIL = "info.teamhaim@gmail.com"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isCoach: boolean
  isAthlete: boolean
  isAuthorized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser)
        
        // Check if user exists in Firestore
        const userRef = doc(db, "users", fbUser.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const userData = userSnap.data() as Omit<User, 'id'>
          setUser({ id: fbUser.uid, ...userData })
          setIsAuthorized(true)
        } else {
          // Check if coach or authorized athlete
          const isCoach = fbUser.email === COACH_EMAIL
          
          if (isCoach) {
            // Auto-create coach account
            const newUser: Omit<User, 'id'> = {
              email: fbUser.email!,
              name: fbUser.displayName || "Coach",
              photoURL: fbUser.photoURL || undefined,
              role: "coach",
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            await setDoc(userRef, {
              ...newUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
            setUser({ id: fbUser.uid, ...newUser })
            setIsAuthorized(true)
          } else {
            // Check if athlete is in authorized list
            const authorizedRef = doc(db, "authorized_athletes", fbUser.email!)
            const authorizedSnap = await getDoc(authorizedRef)
            
            if (authorizedSnap.exists()) {
              // Create athlete account
              const newUser: Omit<User, 'id'> = {
                email: fbUser.email!,
                name: fbUser.displayName || "Athlete",
                photoURL: fbUser.photoURL || undefined,
                role: "athlete",
                createdAt: new Date(),
                updatedAt: new Date(),
              }
              await setDoc(userRef, {
                ...newUser,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              })
              setUser({ id: fbUser.uid, ...newUser })
              setIsAuthorized(true)
            } else {
              // Not authorized
              setUser(null)
              setIsAuthorized(false)
            }
          }
        }
      } else {
        setFirebaseUser(null)
        setUser(null)
        setIsAuthorized(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setFirebaseUser(null)
      setIsAuthorized(false)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signOut,
        isCoach: user?.role === "coach",
        isAthlete: user?.role === "athlete",
        isAuthorized,
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
