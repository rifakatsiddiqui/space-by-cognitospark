
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  saveApiKey: (key: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const localProfileKey = `user_profile_${firebaseUser.uid}`;
        
        // Load profile from local storage immediately to ensure offline/local-only capability
        const getLocalProfile = () => {
          try {
            const stored = localStorage.getItem(localProfileKey);
            if (stored) {
              return JSON.parse(stored);
            }
          } catch (e) {}
          return { uid: firebaseUser.uid, email: firebaseUser.email || '' };
        };

        // Initialize state with local data first so the UI remains interactive
        const initialLocal = getLocalProfile();
        setProfile(initialLocal);

        try {
          const profileRef = doc(db, 'users', firebaseUser.uid);
          
          // Listen for Cloud Firestore changes, with robust error handling for missing DBs
          const unsubProfile = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setProfile(data);
              localStorage.setItem(localProfileKey, JSON.stringify(data));
            } else {
              // Doc doesn't exist yet, DB is reachable. Continue with local/defaults.
              const freshProfile = { uid: firebaseUser.uid, email: firebaseUser.email || '' };
              setProfile(prev => prev || freshProfile);
              // Attempt to initialize cloud record silently
              setDoc(profileRef, freshProfile).catch(() => {});
            }
            setLoading(false);
          }, (err) => {
            // CRITICAL FIX: Gracefully catch the "database (default) does not exist" error
            console.warn("Cloud Firestore unavailable or DB not found. Operating in local persistence mode.", err.message);
            // loading is set to false here so the app continues to render the main interface
            setLoading(false);
          });
          
          return () => unsubProfile();
        } catch (e) {
          console.warn("Firestore setup failed. Proceeding with local profile storage.", e);
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveApiKey = async (key: string) => {
    if (!user) return;
    
    // update local state for immediate UI feedback
    const updatedProfile = { ...profile, uid: user.uid, email: user.email || '', geminiApiKey: key } as UserProfile;
    setProfile(updatedProfile);
    
    // Ensure persistence on the current device immediately
    localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(updatedProfile));
    localStorage.setItem('VISION_API_KEY', key); 
    
    try {
      // Sync to cloud if the service is active
      const profileRef = doc(db, 'users', user.uid);
      await setDoc(profileRef, { geminiApiKey: key }, { merge: true });
    } catch (e) {
      console.warn("Remote sync failed (Firestore missing or inactive). Key saved locally on this device.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, saveApiKey }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
