"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Sidebar } from "@/components/nav/sidebar"
import { BottomNav } from "@/components/nav/bottom-nav"
import { Loader2 } from "lucide-react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, isAuthorized } = useAuth()
  const { dir } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isAuthorized)) {
      router.push("/login")
    }
  }, [user, loading, isAuthorized, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  if (!user || !isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Desktop sidebar - always on left */}
      <Sidebar />
      
      {/* Main content - with left margin on desktop */}
      <main className="min-h-screen pb-20 lg:pb-0 lg:ml-64">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
      
      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
