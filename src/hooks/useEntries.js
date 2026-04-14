import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useEntries(user) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'entries'),
      where('user_id', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEntries(data);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addEntry = useCallback(
    async (formData, dateType, customDate) => {
      if (!user) return;

      let finalDate = new Date();
      if (dateType === 'ontem') finalDate.setDate(finalDate.getDate() - 1);
      else if (dateType === 'outro') finalDate = new Date(customDate + 'T12:00:00');

      const newEntry = {
        ...formData,
        date: finalDate.toISOString(),
        user_id: user.uid,
      };

      await addDoc(collection(db, 'entries'), newEntry);
    },
    [user]
  );

  const removeEntry = useCallback(async (id) => {
    await deleteDoc(doc(db, 'entries', id));
  }, []);

  return { entries, loading, error, addEntry, removeEntry };
}
