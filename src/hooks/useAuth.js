import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const normalizeEmail = (email) => email.trim().toLowerCase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, normalizeEmail(email), password);

  const register = (email, password) =>
    createUserWithEmailAndPassword(auth, normalizeEmail(email), password);

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = (email) =>
    sendPasswordResetEmail(auth, normalizeEmail(email));

  return { user, loading, login, register, logout, resetPassword };
}
