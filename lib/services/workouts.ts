import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Workout, WorkoutLog } from "@/types"

const WORKOUTS_COLLECTION = "workouts"
const LOGS_COLLECTION = "workout_logs"

// Workouts
export async function createWorkout(workout: Omit<Workout, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), {
    ...workout,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getWorkout(workoutId: string): Promise<Workout | null> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId)
  const workoutSnap = await getDoc(workoutRef)
  
  if (!workoutSnap.exists()) return null
  
  const data = workoutSnap.data()
  return { 
    id: workoutSnap.id, 
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
  } as Workout
}

export async function updateWorkout(workoutId: string, data: Partial<Workout>): Promise<void> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId)
  await updateDoc(workoutRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  await deleteDoc(doc(db, WORKOUTS_COLLECTION, workoutId))
}

// Get workouts for a specific athlete and date range
export async function getWorkoutsForAthlete(
  athleteId: string, 
  startDate: string, 
  endDate: string
): Promise<Workout[]> {
  // Get team workouts and individual assignments
  const teamQuery = query(
    collection(db, WORKOUTS_COLLECTION),
    where("assignedTo", "array-contains", "team"),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date")
  )
  
  const individualQuery = query(
    collection(db, WORKOUTS_COLLECTION),
    where("assignedTo", "array-contains", athleteId),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date")
  )
  
  const [teamSnap, individualSnap] = await Promise.all([
    getDocs(teamQuery),
    getDocs(individualQuery)
  ])
  
  const workoutsMap = new Map<string, Workout>()
  
  // Process team workouts
  teamSnap.docs.forEach(doc => {
    const data = doc.data()
    workoutsMap.set(doc.id, { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    } as Workout)
  })
  
  // Process individual workouts (may override team workouts)
  individualSnap.docs.forEach(doc => {
    const data = doc.data()
    workoutsMap.set(doc.id, { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    } as Workout)
  })
  
  return Array.from(workoutsMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// Get all workouts for a date range (coach view)
export async function getAllWorkouts(startDate: string, endDate: string): Promise<Workout[]> {
  const q = query(
    collection(db, WORKOUTS_COLLECTION),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date")
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    } as Workout
  })
}

// Workout Logs
export async function createWorkoutLog(log: Omit<WorkoutLog, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, LOGS_COLLECTION), {
    ...log,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getWorkoutLog(athleteId: string, workoutId: string): Promise<WorkoutLog | null> {
  const q = query(
    collection(db, LOGS_COLLECTION),
    where("athleteId", "==", athleteId),
    where("workoutId", "==", workoutId)
  )
  
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  
  const doc = snapshot.docs[0]
  const data = doc.data()
  return { 
    id: doc.id, 
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
  } as WorkoutLog
}

export async function getLogsForAthlete(athleteId: string, startDate: string, endDate: string): Promise<WorkoutLog[]> {
  const q = query(
    collection(db, LOGS_COLLECTION),
    where("athleteId", "==", athleteId),
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    } as WorkoutLog
  })
}

export async function updateWorkoutLog(logId: string, data: Partial<WorkoutLog>): Promise<void> {
  const logRef = doc(db, LOGS_COLLECTION, logId)
  await updateDoc(logRef, data)
}
