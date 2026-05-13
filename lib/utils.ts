import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeName(user: any): string {
  return user?.name || user?.displayName || user?.email?.split('@')[0] || 'User'
}

export function safeInitial(user: any): string {
  return safeName(user).charAt(0).toUpperCase()
}
