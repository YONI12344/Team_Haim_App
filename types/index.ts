export type UserRole = "coach" | "athlete"

export interface User {
  id: string
  email: string
  name: string
  photoURL?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface AthleteProfile {
  userId: string
  // Personal
  personal: {
    age?: number
    gender?: "male" | "female" | "other"
    weight?: number // kg
    height?: number // cm
    yearsRunning?: number
  }
  // Performance
  performance: {
    vo2Max?: number
    lactateThreshold?: number
    t1Zone?: number // pace in seconds per km
    t2Zone?: number
    anaerobicThreshold?: number
  }
  // Heart Rate
  heartRate: {
    resting?: number
    max?: number
    zone1?: { min: number; max: number }
    zone2?: { min: number; max: number }
    zone3?: { min: number; max: number }
    zone4?: { min: number; max: number }
    zone5?: { min: number; max: number }
  }
  // Running Mechanics
  mechanics: {
    strideLength?: number // meters
    cadence?: number // steps per minute
    groundContactTime?: number // milliseconds
  }
  // Race PRs (in seconds)
  racePRs: {
    fiveK?: number
    tenK?: number
    halfMarathon?: number
    marathon?: number
    mile?: number
    threeK?: number
    fifteenHundred?: number
    eightHundred?: number
  }
  // Training Paces (seconds per km)
  trainingPaces: {
    easy?: number
    marathon?: number
    threshold?: number
    interval?: number
    repetition?: number
  }
  // Injury History
  injuryHistory: InjuryRecord[]
}

export interface InjuryRecord {
  id: string
  type: string
  description: string
  startDate: Date
  endDate?: Date
  notes?: string
}

export type WorkoutType = 
  | "easy" 
  | "tempo" 
  | "intervals" 
  | "long_run" 
  | "rest" 
  | "gym" 
  | "race"
  | "recovery"

export interface WorkoutSession {
  title: string
  description?: string
  distance?: number // km
  targetPace?: string // e.g., "5:00/km"
  warmup?: string
  mainSet?: string
  cooldown?: string
  notes?: string
}

export interface Workout {
  id: string
  assignedTo: string[] // athlete user IDs, or ["team"] for all
  date: string // ISO date string YYYY-MM-DD
  type: WorkoutType
  title: string
  description?: string
  morningSession?: WorkoutSession
  eveningSession?: WorkoutSession
  createdBy: string // coach user ID
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutLog {
  id: string
  athleteId: string
  workoutId: string
  date: string // ISO date string
  actualDistance?: number // km
  actualPace?: string
  effort?: number // 1-10
  notes?: string
  morningCompleted?: boolean
  eveningCompleted?: boolean
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  text: string
  timestamp: number
  read: boolean
}

export interface Conversation {
  id: string // format: `${coachId}_${athleteId}`
  coachId: string
  athleteId: string
  athleteName: string
  athletePhoto?: string
  lastMessage?: string
  lastMessageTime?: number
  unreadCount: number
}

export interface Goal {
  id: string
  athleteId: string
  title: string
  description?: string
  targetDate?: Date
  targetValue?: string // e.g., "Sub 3:00 marathon"
  completed: boolean
  createdAt: Date
}

// Workout type color mapping
export const WORKOUT_COLORS: Record<WorkoutType, string> = {
  easy: "bg-green-500",
  tempo: "bg-orange-500",
  intervals: "bg-red-500",
  long_run: "bg-blue-500",
  rest: "bg-gray-400",
  gym: "bg-purple-500",
  race: "bg-yellow-500",
  recovery: "bg-teal-500",
}

export const WORKOUT_COLORS_LIGHT: Record<WorkoutType, string> = {
  easy: "bg-green-100 border-green-500 text-green-800",
  tempo: "bg-orange-100 border-orange-500 text-orange-800",
  intervals: "bg-red-100 border-red-500 text-red-800",
  long_run: "bg-blue-100 border-blue-500 text-blue-800",
  rest: "bg-gray-100 border-gray-400 text-gray-600",
  gym: "bg-purple-100 border-purple-500 text-purple-800",
  race: "bg-yellow-100 border-yellow-500 text-yellow-800",
  recovery: "bg-teal-100 border-teal-500 text-teal-800",
}
