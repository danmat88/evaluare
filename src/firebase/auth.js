import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export const registerUser = async ({ name, email, password }) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });

  await setDoc(doc(db, 'users', credential.user.uid), {
    name,
    email,
    createdAt: serverTimestamp(),
    progress: {},
    testsCompleted: 0,
    totalScore: 0,
    // Gamification — persisted so they survive page refresh
    xp: 0,
    streak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalAnswered: 0,
  });

  return credential.user;
};

/** Persist gamification stats back to Firestore (called on every exercise answer). */
export const updateUserStats = (uid, { xp, streak, bestStreak, totalCorrect, totalAnswered }) =>
  updateDoc(doc(db, 'users', uid), { xp, streak, bestStreak, totalCorrect, totalAnswered });

export const loginUser = ({ email, password }) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const subscribeToAuth = (callback) =>
  onAuthStateChanged(auth, callback);

/** Real-time listener on the user's Firestore document. */
export const subscribeToProfile = (uid, callback) =>
  onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
