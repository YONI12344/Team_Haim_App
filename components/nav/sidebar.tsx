"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Calendar,
  User,
  BarChart3,
  Target,
  MessageCircle,
  Users,
  Dumbbell,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const athleteNavItems = [
  { key: "dashboard", href: "/athlete", icon: LayoutDashboard },
  { key: "schedule", href: "/athlete/schedule", icon: Calendar },
  { key: "profile", href: "/athlete/profile", icon: User },
  { key: "statistics", href: "/athlete/stats", icon: BarChart3 },
  { key: "goals", href: "/athlete/goals", icon: Target },
  { key: "chat", href: "/athlete/chat", icon: MessageCircle },
] as const

const coachNavItems = [
  { key: "dashboard", href: "/coach", icon: LayoutDashboard },
  { key: "athletes", href: "/coach/athletes", icon: Users },
  { key: "workouts", href: "/coach/workouts", icon: Dumbbell },
  { key: "schedule", href: "/coach/schedule", icon: Calendar },
  { key: "chat", href: "/coach/chat", icon: MessageCircle },
] as const

export function Sidebar() {
  const { user, signOut, isCoach } = useAuth()
  const { t, language, setLanguage, dir } = useLanguage()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = isCoach ? coachNavItems : athleteNavItems

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center">
            <span className="text-lg font-bold text-sidebar-primary-foreground">TH</span>
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">{t("appName")}</h1>
            <p className="text-xs text-sidebar-foreground/60">
              {isCoach ? "Coach" : "Athlete"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/athlete" && item.href !== "/coach" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{t(item.key as keyof typeof t)}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        {/* Language toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "he" : "en")}
          className="w-full justify-start mb-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <span className="font-medium">{language === "en" ? "עברית" : "English"}</span>
        </Button>

        {/* User info */}
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start mt-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t("logout")}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-full w-64 bg-sidebar flex flex-col z-40 transition-transform duration-300",
          dir === "rtl" ? "right-0" : "left-0",
          mobileOpen ? "translate-x-0" : dir === "rtl" ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <NavContent />
      </aside>
    </>
  )
}
