import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, AthleteProfile } from "@/types"

const USERS_COLLECTION = "users"
const ATHLETES_COLLECTION = "athlete_profiles"
const AUTHORIZED_COLLECTION = "authorized_athletes"

// Users
export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, USERS_COLLECTION, userId)
  const userSnap = await getDoc(userRef)
  
  if (!userSnap.exists()) return null
  
  return { id: userSnap.id, ...userSnap.data() } as User
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId)
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function getAllAthletes(): Promise<User[]> {
  const q = query(collection(db, USERS_COLLECTION), where("role", "==", "athlete"))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
}

// Authorized Athletes (invite system)
export async function addAuthorizedAthlete(email: string, name?: string): Promise<void> {
  const authorizedRef = doc(db, AUTHORIZED_COLLECTION, email)
  await setDoc(authorizedRef, {
    email,
    name: name || email.split("@")[0],
    addedAt: serverTimestamp(),
  })
}

export async function removeAuthorizedAthlete(email: string): Promise<void> {
  const authorizedRef = doc(db, AUTHORIZED_COLLECTION, email)
  await deleteDoc(authorizedRef)
}

export async function getAuthorizedAthletes(): Promise<{ email: string; name: string; addedAt: Date }[]> {
  const snapshot = await getDocs(collection(db, AUTHORIZED_COLLECTION))
  return snapshot.docs.map(doc => ({
    email: doc.id,
    ...doc.data(),
  })) as { email: string; name: string; addedAt: Date }[]
}

// Athlete Profiles
export async function getAthleteProfile(userId: string): Promise<AthleteProfile | null> {
  const profileRef = doc(db, ATHLETES_COLLECTION, userId)
  const profileSnap = await getDoc(profileRef)
  
  if (!profileSnap.exists()) return null
  
  return profileSnap.data() as AthleteProfile
}

export async function createAthleteProfile(userId: string, profile: Partial<AthleteProfile>): Promise<void> {
  const profileRef = doc(db, ATHLETES_COLLECTION, userId)
  const defaultProfile: AthleteProfile = {
    userId,
    personal: {},
    performance: {},
    heartRate: {},
    mechanics: {},
    racePRs: {},
    trainingPaces: {},
    injuryHistory: [],
    ...profile,
  }
  await setDoc(profileRef, defaultProfile)
}

export async function updateAthleteProfile(userId: string, data: Partial<AthleteProfile>): Promise<void> {
  const profileRef = doc(db, ATHLETES_COLLECTION, userId)
  await updateDoc(profileRef, data)
}

// Get coach profile (the user with role "coach")
export async function getCoachProfile(): Promise<User | null> {
  const q = query(collection(db, USERS_COLLECTION), where("role", "==", "coach"))
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) return null
  
  const coachDoc = snapshot.docs[0]
  return { id: coachDoc.id, ...coachDoc.data() } as User
}
