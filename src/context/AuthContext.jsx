/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY && !!auth && !!googleProvider;
const MOCK_SESSION_KEY = 'cyberquest_mock_session';

export function AuthProvider({ children }) {
  // Initialize state lazily from localStorage in mock mode to avoid useEffect setState warnings
  const [user, setUser] = useState(() => {
    if (!isFirebaseConfigured) {
      try {
        const savedMockUser = localStorage.getItem(MOCK_SESSION_KEY);
        return savedMockUser ? JSON.parse(savedMockUser) : null;
      } catch (e) {
        console.error("Failed parsing mock session on init:", e);
        return null;
      }
    }
    return null;
  });

  const [userProfile, setUserProfile] = useState(() => {
    if (!isFirebaseConfigured) {
      try {
        const savedMockUser = localStorage.getItem(MOCK_SESSION_KEY);
        if (savedMockUser) {
          const parsedUser = JSON.parse(savedMockUser);
          const LOCAL_USERS_KEY = 'cyberquest_mock_users';
          const data = localStorage.getItem(LOCAL_USERS_KEY);
          const localUsers = data ? JSON.parse(data) : {};
          
          let profile = localUsers[parsedUser.uid];
          const now = new Date().toISOString();

          if (!profile) {
            profile = {
              uid: parsedUser.uid,
              email: parsedUser.email,
              displayName: parsedUser.displayName || 'Cyber Cadet',
              photoURL: parsedUser.photoURL || null,
              role: 'Security Enthusiast',
              level: 1,
              xp: 25,
              xpNeeded: 100,
              badges: ['Initiate'],
              createdAt: now,
              lastLoginAt: now,
              bio: 'Interested in learning secure practices and coding.'
            };
            localUsers[parsedUser.uid] = profile;
            localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
          } else {
            profile.lastLoginAt = now;
            localUsers[parsedUser.uid] = profile;
            localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
          }
          return profile;
        }
      } catch (e) {
        console.error("Failed parsing mock user profile on init:", e);
        return null;
      }
    }
    return null;
  });

  // If real Firebase is used, we must load asynchronously (starts loading). If mock mode, start idle.
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState(null);

  // Sync profile when authentication state is determined
  const syncProfile = async (authUser) => {
    if (!authUser) {
      setUserProfile(null);
      return;
    }
    try {
      const profile = await userService.getOrCreateProfile(authUser);
      setUserProfile(profile);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setError("Failed to synchronize user profile database.");
    }
  };

  // Google Login function
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        // Fallback Developer Mode
        const mockAuthUser = {
          uid: 'mock-user-1337',
          email: 'cadet@cyberquest.dev',
          displayName: 'Guest Cadet',
          photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=cadet', // Safe public SVG avatar fallback
        };
        setUser(mockAuthUser);
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockAuthUser));
        await syncProfile(mockAuthUser);
        setLoading(false);
        return mockAuthUser;
      }

      // Real Firebase Pop-up Sign-in
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      await syncProfile(result.user);
      return result.user;
    } catch (err) {
      console.error("Authentication Error:", err);
      setError(err.message || "Failed to sign in with Google.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        // Fallback Mode Sign-out
        localStorage.removeItem(MOCK_SESSION_KEY);
        setUser(null);
        setUserProfile(null);
        return;
      }

      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error("Sign-out Error:", err);
      setError("Failed to sign out correctly.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh current profile data from database
  const refreshProfile = async () => {
    if (!user) return;
    try {
      const profile = await userService.getOrCreateProfile(user);
      setUserProfile(profile);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  // Function to edit profile fields
  const updateProfileFields = async (updatedFields) => {
    if (!user) return;
    try {
      const newProfile = await userService.updateProfile(user.uid, updatedFields);
      setUserProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.error("Failed to update profile fields:", err);
      setError("Failed to update profile changes in the database.");
      throw err;
    }
  };

  // Listen for real Firebase authentication changes
  useEffect(() => {
    let unsubscribe;

    if (isFirebaseConfigured) {
      // Listen to real Firebase state change
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          await syncProfile(firebaseUser);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // Run once on mount

  const value = {
    user,
    userProfile,
    loading,
    error,
    isFallbackMode: !isFirebaseConfigured,
    loginWithGoogle,
    logout,
    refreshProfile,
    updateProfile: updateProfileFields
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
