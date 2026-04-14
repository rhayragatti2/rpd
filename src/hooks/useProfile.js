import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useProfile(user) {
  const [userName, setUserName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setUserName('');
      return;
    }

    setProfileLoading(true);
    const ref = doc(db, 'profiles', user.uid);
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          setUserName(snap.data().name || '');
        }
      })
      .finally(() => setProfileLoading(false));
  }, [user]);

  const saveProfile = useCallback(
    async (name) => {
      if (!user) return;
      await setDoc(doc(db, 'profiles', user.uid), { name }, { merge: true });
      setUserName(name);
    },
    [user]
  );

  return { userName, setUserName, saveProfile, profileLoading };
}
