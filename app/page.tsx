"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading, isAuthorized, isCoach } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user && isAuthorized) {
        // Redirect based on role
        if (isCoach) {
          router.push("/coach")
        } else {
          router.push("/athlete")
        }
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, isAuthorized, isCoach, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
