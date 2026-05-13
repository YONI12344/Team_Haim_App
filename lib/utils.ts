import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Returns a safe display initial for a user, falling back to email username or "U". */
export function getUserInitial(user: { name?: string | null; email?: string | null }): string {
  const name = user.name || user.email?.split("@")[0] || "U"
  return name.charAt(0).toUpperCase()
}
