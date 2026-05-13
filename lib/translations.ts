export type Language = "en" | "he"

export const translations = {
  // Common
  appName: { en: "Team Haim", he: "צוות חיים" },
  loading: { en: "Loading...", he: "...טוען" },
  save: { en: "Save", he: "שמור" },
  cancel: { en: "Cancel", he: "ביטול" },
  edit: { en: "Edit", he: "עריכה" },
  delete: { en: "Delete", he: "מחיקה" },
  add: { en: "Add", he: "הוסף" },
  back: { en: "Back", he: "חזור" },
  submit: { en: "Submit", he: "שלח" },
  close: { en: "Close", he: "סגור" },
  
  // Auth
  login: { en: "Login", he: "התחברות" },
  logout: { en: "Logout", he: "התנתקות" },
  signInWithGoogle: { en: "Sign in with Google", he: "התחבר עם גוגל" },
  welcomeBack: { en: "Welcome back", he: "ברוך שובך" },
  loginSubtitle: { en: "Sign in to access your training", he: "התחבר כדי לגשת לאימונים שלך" },
  accessDenied: { en: "Access Denied", he: "הגישה נדחתה" },
  notAuthorized: { en: "You are not authorized to access this application. Please contact your coach.", he: "אין לך הרשאה לגשת לאפליקציה זו. אנא צור קשר עם המאמן שלך." },
  
  // Navigation
  dashboard: { en: "Dashboard", he: "לוח בקרה" },
  schedule: { en: "Schedule", he: "לוח אימונים" },
  profile: { en: "Profile", he: "פרופיל" },
  statistics: { en: "Statistics", he: "סטטיסטיקות" },
  goals: { en: "Goals", he: "מטרות" },
  chat: { en: "Chat", he: "צאט" },
  athletes: { en: "Athletes", he: "ספורטאים" },
  workouts: { en: "Workouts", he: "אימונים" },
  settings: { en: "Settings", he: "הגדרות" },
  
  // Dashboard
  todaysWorkout: { en: "Today's Workout", he: "האימון של היום" },
  noWorkoutToday: { en: "No workout scheduled for today", he: "אין אימון מתוכנן להיום" },
  restDay: { en: "Rest Day", he: "יום מנוחה" },
  morningSession: { en: "Morning Session", he: "אימון בוקר" },
  eveningSession: { en: "Evening Session", he: "אימון ערב" },
  thisWeek: { en: "This Week", he: "השבוע" },
  totalKm: { en: "Total km", he: 'סה"כ ק"מ' },
  workoutsCompleted: { en: "Workouts Completed", he: "אימונים שהושלמו" },
  currentStreak: { en: "Current Streak", he: "רצף נוכחי" },
  days: { en: "days", he: "ימים" },
  
  // Calendar
  weekView: { en: "Week", he: "שבוע" },
  monthView: { en: "Month", he: "חודש" },
  today: { en: "Today", he: "היום" },
  sunday: { en: "Sun", he: "א" },
  monday: { en: "Mon", he: "ב" },
  tuesday: { en: "Tue", he: "ג" },
  wednesday: { en: "Wed", he: "ד" },
  thursday: { en: "Thu", he: "ה" },
  friday: { en: "Fri", he: "ו" },
  saturday: { en: "Sat", he: "ש" },
  
  // Workout Types
  easy: { en: "Easy", he: "קל" },
  tempo: { en: "Tempo", he: "טמפו" },
  intervals: { en: "Intervals", he: "אינטרוולים" },
  long_run: { en: "Long Run", he: "ריצה ארוכה" },
  rest: { en: "Rest", he: "מנוחה" },
  gym: { en: "Gym", he: "חדר כושר" },
  race: { en: "Race", he: "תחרות" },
  recovery: { en: "Recovery", he: "התאוששות" },
  
  // Workout Log
  logWorkout: { en: "Log Workout", he: "תעד אימון" },
  actualDistance: { en: "Actual Distance (km)", he: 'מרחק בפועל (ק"מ)' },
  actualPace: { en: "Actual Pace", he: "קצב בפועל" },
  effortLevel: { en: "Effort Level (1-10)", he: "(1-10) רמת מאמץ" },
  comments: { en: "Comments", he: "הערות" },
  completed: { en: "Completed", he: "הושלם" },
  
  // Profile Sections
  personalInfo: { en: "Personal Info", he: "פרטים אישיים" },
  performanceData: { en: "Performance Data", he: "נתוני ביצוע" },
  heartRateZones: { en: "Heart Rate Zones", he: "אזורי דופק" },
  runningMechanics: { en: "Running Mechanics", he: "מכניקת ריצה" },
  racePRs: { en: "Race PRs", he: "שיאים אישיים" },
  trainingPaces: { en: "Training Paces", he: "קצבי אימון" },
  injuryHistory: { en: "Injury History", he: "היסטוריית פציעות" },
  
  // Personal Info Fields
  age: { en: "Age", he: "גיל" },
  gender: { en: "Gender", he: "מין" },
  male: { en: "Male", he: "זכר" },
  female: { en: "Female", he: "נקבה" },
  other: { en: "Other", he: "אחר" },
  weight: { en: "Weight (kg)", he: '(ק"ג) משקל' },
  height: { en: "Height (cm)", he: '(ס"מ) גובה' },
  yearsRunning: { en: "Years Running", he: "שנות ריצה" },
  
  // Performance Fields
  vo2Max: { en: "VO2 Max", he: "VO2 Max" },
  lactateThreshold: { en: "Lactate Threshold", he: "סף לקטט" },
  anaerobicThreshold: { en: "Anaerobic Threshold", he: "סף אנאירובי" },
  
  // Heart Rate
  restingHR: { en: "Resting HR", he: "דופק מנוחה" },
  maxHR: { en: "Max HR", he: "דופק מקסימלי" },
  zone: { en: "Zone", he: "אזור" },
  
  // Mechanics
  strideLength: { en: "Stride Length (m)", he: "(מ') אורך צעד" },
  cadence: { en: "Cadence (spm)", he: "(צעדים/דקה) קדנס" },
  groundContactTime: { en: "Ground Contact (ms)", he: "(מ\"ש) זמן מגע קרקע" },
  
  // Paces
  easyPace: { en: "Easy Pace", he: "קצב קל" },
  marathonPace: { en: "Marathon Pace", he: "קצב מרתון" },
  thresholdPace: { en: "Threshold Pace", he: "קצב סף" },
  intervalPace: { en: "Interval Pace", he: "קצב אינטרוולים" },
  repetitionPace: { en: "Repetition Pace", he: "קצב חזרות" },
  
  // Race distances
  fiveK: { en: "5K", he: '5 ק"מ' },
  tenK: { en: "10K", he: '10 ק"מ' },
  halfMarathon: { en: "Half Marathon", he: "חצי מרתון" },
  marathon: { en: "Marathon", he: "מרתון" },
  mile: { en: "Mile", he: "מייל" },
  threeK: { en: "3000m", he: "3000 מ'" },
  fifteenHundred: { en: "1500m", he: "1500 מ'" },
  eightHundred: { en: "800m", he: "800 מ'" },
  
  // Goals
  addGoal: { en: "Add Goal", he: "הוסף מטרה" },
  goalTitle: { en: "Goal Title", he: "שם המטרה" },
  targetDate: { en: "Target Date", he: "תאריך יעד" },
  targetValue: { en: "Target Value", he: "ערך יעד" },
  markComplete: { en: "Mark Complete", he: "סמן כהושלם" },
  
  // Coach
  myAthletes: { en: "My Athletes", he: "הספורטאים שלי" },
  addAthlete: { en: "Add Athlete", he: "הוסף ספורטאי" },
  athleteEmail: { en: "Athlete Email", he: "אימייל הספורטאי" },
  viewProfile: { en: "View Profile", he: "צפה בפרופיל" },
  createWorkout: { en: "Create Workout", he: "צור אימון" },
  assignTo: { en: "Assign To", he: "שייך ל" },
  entireTeam: { en: "Entire Team", he: "כל הצוות" },
  selectAthletes: { en: "Select Athletes", he: "בחר ספורטאים" },
  workoutTitle: { en: "Workout Title", he: "שם האימון" },
  workoutType: { en: "Workout Type", he: "סוג אימון" },
  distance: { en: "Distance", he: "מרחק" },
  targetPace: { en: "Target Pace", he: "קצב יעד" },
  warmup: { en: "Warmup", he: "חימום" },
  mainSet: { en: "Main Set", he: "סט עיקרי" },
  cooldown: { en: "Cooldown", he: "שחרור" },
  notes: { en: "Notes", he: "הערות" },
  addMorningSession: { en: "Add Morning Session", he: "הוסף אימון בוקר" },
  addEveningSession: { en: "Add Evening Session", he: "הוסף אימון ערב" },
  
  // Chat
  typeMessage: { en: "Type a message...", he: "...הקלד הודעה" },
  send: { en: "Send", he: "שלח" },
  noMessages: { en: "No messages yet", he: "אין הודעות עדיין" },
  startConversation: { en: "Start a conversation with your coach", he: "התחל שיחה עם המאמן שלך" },
  messages: { en: "Messages", he: "הודעות" },
  chatWithCoach: { en: "Chat with Coach", he: "צאט עם המאמן" },
  chatWithCoachDesc: { en: "Send messages directly to your coach", he: "שלח הודעות ישירות למאמן שלך" },
  noConversations: { en: "No conversations yet", he: "אין שיחות עדיין" },
  selectConversation: { en: "Select a conversation", he: "בחר שיחה" },
  selectConversationDesc: { en: "Choose a conversation from the list to start chatting", he: "בחר שיחה מהרשימה כדי להתחיל לשוחח" },
  manageConversations: { en: "Manage your conversations with athletes", he: "נהל את השיחות שלך עם ספורטאים" },
  coachNotAvailable: { en: "Coach not available", he: "המאמן לא זמין" },
  coachNotAvailableDesc: { en: "The coach account has not been set up yet", he: "חשבון המאמן עדיין לא הוגדר" },
  
  // Stats
  weeklyMileage: { en: "Weekly Mileage", he: "קילומטראז' שבועי" },
  monthlyTotals: { en: "Monthly Totals", he: "סיכום חודשי" },
  workoutBreakdown: { en: "Workout Breakdown", he: "פילוח אימונים" },
  
  // Errors
  error: { en: "Error", he: "שגיאה" },
  somethingWentWrong: { en: "Something went wrong", he: "משהו השתבש" },
  tryAgain: { en: "Try again", he: "נסה שוב" },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Language): string {
  return translations[key][lang]
}
