"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User as FirebaseUser 
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User, UserRole } from "@/types"

const COACH_EMAIL = "info.teamhaim@gmail.com"
const googleProvider = new GoogleAuthProvider()

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
        
        const role: UserRole = fbUser.email === COACH_EMAIL ? "coach" : "athlete"
        const userRef = doc(db, "users", fbUser.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const userData = userSnap.data() as Omit<User, 'id'>
          // Ensure role is always up-to-date based on email
          const currentUser = { id: fbUser.uid, ...userData, role }
          setUser(currentUser)
          // Update role in Firestore if it changed
          if (userData.role !== role) {
            await setDoc(userRef, { role, updatedAt: serverTimestamp() }, { merge: true })
          }
        } else {
          // Create new user document
          const newUser: Omit<User, 'id'> = {
            email: fbUser.email!,
            name: fbUser.displayName || (role === "coach" ? "Coach" : "Athlete"),
            photoURL: fbUser.photoURL || undefined,
            role,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          await setDoc(userRef, {
            ...newUser,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          setUser({ id: fbUser.uid, ...newUser })
        }
        setIsAuthorized(true)
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
