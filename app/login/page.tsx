"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { user, loading, signInWithGoogle, isAuthorized, firebaseUser } = useAuth()
  const { t, language, setLanguage, dir } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && isAuthorized) {
      // Redirect based on role
      if (user.role === "coach") {
        router.push("/coach")
      } else {
        router.push("/athlete")
      }
    }
  }, [user, loading, isAuthorized, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={dir}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show access denied if user is logged in but not authorized
  if (firebaseUser && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={dir}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <CardTitle className="text-destructive">{t("accessDenied")}</CardTitle>
            <CardDescription className="text-base mt-2">
              {t("notAuthorized")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // Sign out and go back
                window.location.reload()
              }}
            >
              {t("back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={dir}>
      {/* Language Toggle */}
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "he" : "en")}
          className="text-muted-foreground hover:text-foreground"
        >
          {language === "en" ? "עב" : "EN"}
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo/Brand */}
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-foreground">TH</span>
          </div>
          <CardTitle className="text-2xl text-primary">{t("appName")}</CardTitle>
          <CardDescription className="text-base mt-2">
            {t("loginSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={signInWithGoogle}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("signInWithGoogle")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
