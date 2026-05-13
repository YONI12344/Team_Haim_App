import { 
  collection, 
  doc, 
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
import type { Goal } from "@/types"

const GOALS_COLLECTION = "goals"

export async function createGoal(goal: Omit<Goal, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, GOALS_COLLECTION), {
    ...goal,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getGoalsForAthlete(athleteId: string): Promise<Goal[]> {
  const q = query(
    collection(db, GOALS_COLLECTION),
    where("athleteId", "==", athleteId),
    orderBy("createdAt", "desc")
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return { 
      id: doc.id, 
      ...data,
      targetDate: data.targetDate instanceof Timestamp ? data.targetDate.toDate() : data.targetDate,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    } as Goal
  })
}

export async function updateGoal(goalId: string, data: Partial<Goal>): Promise<void> {
  const goalRef = doc(db, GOALS_COLLECTION, goalId)
  await updateDoc(goalRef, data)
}

export async function deleteGoal(goalId: string): Promise<void> {
  await deleteDoc(doc(db, GOALS_COLLECTION, goalId))
}

export async function markGoalComplete(goalId: string): Promise<void> {
  const goalRef = doc(db, GOALS_COLLECTION, goalId)
  await updateDoc(goalRef, { completed: true })
}
