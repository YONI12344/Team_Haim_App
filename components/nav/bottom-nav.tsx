"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  User,
  MessageCircle,
  Users,
  Dumbbell,
} from "lucide-react"

const athleteNavItems = [
  { key: "dashboard", href: "/athlete", icon: LayoutDashboard },
  { key: "schedule", href: "/athlete/schedule", icon: Calendar },
  { key: "profile", href: "/athlete/profile", icon: User },
  { key: "chat", href: "/athlete/chat", icon: MessageCircle },
] as const

const coachNavItems = [
  { key: "dashboard", href: "/coach", icon: LayoutDashboard },
  { key: "athletes", href: "/coach/athletes", icon: Users },
  { key: "workouts", href: "/coach/workouts", icon: Dumbbell },
  { key: "chat", href: "/coach/chat", icon: MessageCircle },
] as const

export function BottomNav() {
  const { isCoach } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()

  const navItems = isCoach ? coachNavItems : athleteNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy border-t-2 border-gold lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/athlete" && item.href !== "/coach" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive
                  ? "text-gold"
                  : "text-white/70 active:text-gold"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{t(item.key as keyof typeof t)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
