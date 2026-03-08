import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged
} from "firebase/auth";
import { getDatabase, ref, onValue, increment, update, remove, get } from "firebase/database";
import { UserContribution } from "../types";
import { ADMIN_EMAIL } from '../constants';

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

// הוספנו export כדי ש-AdminPanel וקבצים אחרים יוכלו למצוא אותם
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getDatabase(firebaseApp);

export const subscribeToConnectionStatus = (callback: (status: string) => void) => {
  const connectedRef = ref(firebaseDb, '.info/connected');
  return onValue(connectedRef, (snap) => {
    callback(snap.val() === true ? 'Connected' : 'Connecting...');
  }, () => callback('Offline'));
};

const applyPersistence = async (rememberMe: boolean) => {
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(firebaseAuth, persistenceType);
};

export const registerWithEmail = async (email: string, password: string, name: string, rememberMe: boolean = true) => {
  await applyPersistence(rememberMe);
  const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
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
  return onAuthStateChanged(firebaseAuth, async (user: any) => {
    if (user) {
      const cleanEmail = user.email ? user.email.replace(/\./g, '_') : user.uid;
      const approvedRef = ref(firebaseDb, `approvedUsers/${cleanEmail}`);
      
      try {
        const snapshot = await get(approvedRef);
        const isApproved = snapshot.val();

        if (isApproved === true || user.email === ADMIN_EMAIL) {
          callback({
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'משתמש',
            email: user.email,
            picture: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email?.charAt(0) || 'U'}&background=random`
          });
        } else {
          callback(null, true);
          const pendingRef = ref(firebaseDb, `pendingUsers/${cleanEmail}`);
          await update(pendingRef, {
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'משתמש',
            picture: user.photoURL || '',
            requestDate: Date.now()
          });
        }
      } catch (error) {
        console.error("Error checking approval status:", error);
        callback(null, true);
      }
    } else {
      callback(null, false);
    }
  });
};

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

export const subscribeToPendingUsers = (callback: (users: any[]) => void) => {
  return onValue(ref(firebaseDb, 'pendingUsers'), (snap) => {
    const data = snap.val() || {};
    callback(Object.values(data));
  });
};

export const approveUser = async (email: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  const updates: any = {};
  updates[`approvedUsers/${cleanEmail}`] = true;
  updates[`pendingUsers/${cleanEmail}`] = null; 
  return update(ref(firebaseDb), updates);
};

export const rejectUser = async (email: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  return remove(ref(firebaseDb, `pendingUsers/${cleanEmail}`));
};

export const getProjectId = () => firebaseConfig.projectId;

// --- תוספות כדי למנוע קריסה של AdminPanel ---

// ה-AdminPanel משתמש ב-resetGlobalCount אז יצרנו קיצור דרך ל-resetAllCounts שלך
export const resetGlobalCount = resetAllCounts;

// הוספת פונקציית מחיקת משתמש מלאה מהמערכת (כדי שכפתור הפח יעבוד)
export const deleteUser = async (email: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  await remove(ref(firebaseDb, `approvedUsers/${cleanEmail}`));
  await remove(ref(firebaseDb, `contributions/${cleanEmail}`));
};

// הוספת פונקציית איפוס מונה אישי שביקשת קודם
export const resetUserCount = async (email: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  const userRef = ref(firebaseDb, `contributions/${cleanEmail}`);
  
  const snapshot = await get(userRef);
  const userData = snapshot.val();
  
  if (userData && userData.count) {
    const globalUpdate: any = {};
    globalUpdate['global/totalCount'] = increment(-userData.count);
    
    const userUpdate: any = {};
    userUpdate[`contributions/${cleanEmail}/count`] = 0;
    
    await update(ref(firebaseDb), globalUpdate);
    await update(ref(firebaseDb), userUpdate);
  }
};
