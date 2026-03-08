import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, onValue, increment, update, get, set, remove } from "firebase/database";

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
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getDatabase(firebaseApp);

export const loginWithEmail = (e: string, p: string) => signInWithEmailAndPassword(firebaseAuth, e, p);

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  const res = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
  await updateProfile(res.user, { displayName: name });
  const cleanEmail = email.replace(/\./g, '_');
  await set(ref(firebaseDb, `pendingUsers/${cleanEmail}`), { email, name, createdAt: Date.now() });
  return res.user;
};

export const logout = () => signOut(firebaseAuth);

export const checkUserStatus = async (email: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  const snap = await get(ref(firebaseDb, `approvedUsers/${cleanEmail}`));
  return snap.exists();
};

export const approveUser = async (email: string, name: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  await set(ref(firebaseDb, `approvedUsers/${cleanEmail}`), { email, name, approvedAt: Date.now() });
  await remove(ref(firebaseDb, `pendingUsers/${cleanEmail}`));
};

export const deleteUser = async (email: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  await remove(ref(firebaseDb, `approvedUsers/${cleanEmail}`));
  await remove(ref(firebaseDb, `contributions/${cleanEmail}`));
};

export const resetUserCount = async (email: string) => {
  const cleanEmail = email.replace(/\./g, '_');
  return update(ref(firebaseDb, `contributions/${cleanEmail}`), { count: 0 });
};

export const resetGlobalCount = async () => {
  const updates: any = {};
  updates['global/totalCount'] = 0;
  updates['contributions'] = null;
  return update(ref(firebaseDb), updates);
};

export const updateCount = (email: string, name: string) => {
  if (!email) return;
  const cleanEmail = email.replace(/\./g, '_');
  const updates: any = {};
  updates['global/totalCount'] = increment(1);
  updates[`contributions/${cleanEmail}/count`] = increment(1);
  updates[`contributions/${cleanEmail}/name`] = name;
  updates[`contributions/${cleanEmail}/email`] = email;
  return update(ref(firebaseDb), updates);
};

export const subscribeToGlobalCount = (callback: (count: number) => void) => {
  return onValue(ref(firebaseDb, 'global/totalCount'), (snap) => callback(snap.val() || 0));
};
