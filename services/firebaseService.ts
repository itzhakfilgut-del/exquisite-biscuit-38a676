import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, // החזרנו לפופאפ כדי לפתור את השגיאה!
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { getDatabase, ref, onValue, increment, update, remove, get } from "firebase/database";
import { UserContribution } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyCO1JOjSkvmUoy7VH__zdgdZtaIzRlwbyo",
  authDomain: "karkafot-2c291.firebaseapp.com",
  databaseURL: "https://karkafot-2c291-default-rtdb.firebaseio.com",
  projectId: "karkafot-2c291",
  storageBucket: "karkafot-2c291.firebasestorage.app",
  messagingSenderId: "78987251458",
  appId: "1:78987251458:web:2c6908cef0dd4a5d967c1b",
  measurementId: "G-795JXH3PNK"
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getDatabase(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export const subscribeToConnectionStatus = (callback: (status: string) => void) => {
  const connectedRef = ref(firebaseDb, '.info/connected');
  return onValue(connectedRef, (snap) => {
    callback(snap.val() === true ? 'Connected' : 'Connecting...');
  }, () => callback('Offline'));
};

// --- הגדרת זיכרון ההתחברות (Remember Me) ---
const applyPersistence = async (rememberMe: boolean) => {
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(firebaseAuth, persistenceType);
};

// --- התחברות והרשמה ---

export const loginWithGoogle = async (rememberMe: boolean = true) => {
  try {
    await applyPersistence(rememberMe);
    await signInWithPopup(firebaseAuth, googleProvider); // שימוש בפופאפ
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string, name: string, rememberMe: boolean = true) => {
  await applyPersistence(rememberMe);
  const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  // מעדכן את הפרופיל של המשתמש עם השם שהקליד
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential.user;
};

export const loginWithEmail = async (email: string, password: string, rememberMe: boolean = true) => {
  await applyPersistence(rememberMe);
  const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return userCredential.user;
};

export const logout = async () => {
  await signOut(firebaseAuth);
};

export const onAuthChange = (callback: (user: any | null, isPendingApproval?: boolean) => void) => {
  return firebaseAuth.onAuthStateChanged(async (user: any) => {
    // הוסר התנאי של אישור במייל. מספיק שהמשתמש קיים.
    if (user) {
      const cleanEmail = user.email.replace(/\./g, '_');
      const approvedRef = ref(firebaseDb, `approvedUsers/${cleanEmail}`);
      
      try {
        const snapshot = await get(approvedRef);
        const isApproved = snapshot.val();

        if (isApproved === true) {
          callback({
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'משתמש',
            email: user.email,
            picture: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email?.charAt(0) || 'U'}&background=random`
          });
        } else {
          callback(null, true); // משתמש קיים אבל ממתין לאישור מנהל
        }
      } catch (error) {
        console.error("Error checking approval status:", error);
        callback(null, false);
      }
    } else {
      callback(null, false);
    }
  });
};

// --- מסד נתונים ---

export const subscribeToGlobalCount = (callback: (count: number) => void) => {
  return onValue(ref(firebaseDb, 'global/totalCount'), (snap) => callback(snap.val() || 0));
};

export const subscribeToContributions = (callback: (data: UserContribution[]) => void) => {
  return onValue(ref(firebaseDb, 'contributions'), (snap) => {
    const data = snap.val() || {};
    callback(Object.values(data).sort((a: any, b: any) => b.count - a.count) as UserContribution[]);
  });
};

export const updateCount = async (email: string, name: string, lat?: number, lng?: number, picture?: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  const updates: any = {};
  updates['global/totalCount'] = increment(1);
  updates[`contributions/${cleanEmail}/count`] = increment(1);
  updates[`contributions/${cleanEmail}/name`] = name;
  updates[`contributions/${cleanEmail}/email`] = email;
  updates[`contributions/${cleanEmail}/lastUpdate`] = Date.now();
  if (lat) updates[`contributions/${cleanEmail}/lat`] = lat;
  if (lng) updates[`contributions/${cleanEmail}/lng`] = lng;
  if (picture) updates[`contributions/${cleanEmail}/picture`] = picture;
  
  return update(ref(firebaseDb), updates);
};

export const deleteContribution = async (email: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  const userRef = ref(firebaseDb, `contributions/${cleanEmail}`);
  
  try {
    const snapshot = await get(userRef);
    const userData = snapshot.val();
    
    if (userData && userData.count) {
      const globalUpdate: any = {};
      globalUpdate['global/totalCount'] = increment(-userData.count);
      await update(ref(firebaseDb), globalUpdate);
    }
    
    await remove(userRef);
    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
};

export const setContributionCount = async (email: string, newCount: number) => {
  const cleanEmail = email.replace(/\./g, '_');
  const userRef = ref(firebaseDb, `contributions/${cleanEmail}`);
  
  const snapshot = await get(userRef);
  const userData = snapshot.val();
  
  if (userData) {
    const diff = newCount - userData.count;
    const updates: any = {};
    updates['global/totalCount'] = increment(diff);
    updates[`contributions/${cleanEmail}/count`] = newCount;
    return update(ref(firebaseDb), updates);
  }
};

export const resetAllCounts = async () => {
  const updates: any = {};
  updates['global/totalCount'] = 0;
  updates['contributions'] = null;
  return update(ref(firebaseDb), updates);
};

export const getProjectId = () => firebaseConfig.projectId;