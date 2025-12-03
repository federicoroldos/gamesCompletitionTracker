import { useEffect, useState } from 'react';
import { firebaseApp } from '../firebase';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.appdata');
provider.setCustomParameters({ prompt: 'select_account consent' });

export const useGoogleAuth = () => {
  const auth = getAuth(firebaseApp);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      // El access token de Drive solo se obtiene al iniciar sesión; si recargas, pide login para renovarlo.
      setAccessToken(null);
    });
    return () => unsub();
  }, [auth]);

  const signIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        setAccessToken(credential.accessToken);
      } else {
        setAccessToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  return { user, accessToken, loading, signIn, signOut: signOutUser };
};
