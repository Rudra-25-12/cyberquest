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

/**
 * Calculates level boundaries and current level progress from total XP.
 */
export const calculateLevelProgress = (xp) => {
  if (xp >= 1000) {
    return { level: 5, minXp: 1000, maxXp: 1000, percent: 100 };
  }
  if (xp >= 500) {
    const range = 1000 - 500;
    const progress = xp - 500;
    const percent = Math.min(100, Math.floor((progress / range) * 100));
    return { level: 4, minXp: 500, maxXp: 1000, percent };
  }
  if (xp >= 250) {
    const range = 500 - 250;
    const progress = xp - 250;
    const percent = Math.min(100, Math.floor((progress / range) * 100));
    return { level: 3, minXp: 250, maxXp: 500, percent };
  }
  if (xp >= 100) {
    const range = 250 - 100;
    const progress = xp - 100;
    const percent = Math.min(100, Math.floor((progress / range) * 100));
    return { level: 2, minXp: 100, maxXp: 250, percent };
  }
  const range = 100;
  const percent = Math.min(100, Math.floor((xp / range) * 100));
  return { level: 1, minXp: 0, maxXp: 100, percent };
};


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

  // Batch update of XP and badges
  const updateProgression = async (xpEarned, badgeToUnlock = null, activityMetadata = null) => {
    if (!user || !userProfile) return null;

    try {
      const currentXP = userProfile.xp || 0;
      const newXP = currentXP + xpEarned;
      
      const { level: newLevel, maxXp: xpNeeded } = calculateLevelProgress(newXP);
      const currentLevel = userProfile.level || 1;
      
      const currentBadges = userProfile.badges || [];
      let updatedBadges = [...currentBadges];
      let badgesUnlocked = [];

      if (badgeToUnlock) {
        const badgesArray = Array.isArray(badgeToUnlock) ? badgeToUnlock : [badgeToUnlock];
        badgesArray.forEach(badge => {
          if (!updatedBadges.includes(badge)) {
            updatedBadges.push(badge);
            badgesUnlocked.push(badge);
          }
        });
      }

      // Generate activity logs
      const currentActivities = userProfile.activities || [];
      const newActivities = [...currentActivities];
      const timestamp = new Date().toISOString();

      // Certificate generation logic on module completion
      let updatedCertificates = userProfile.certificates || [];
      const isFirstCompletion = activityMetadata?.isModuleCompletion 
        ? !updatedCertificates.some(c => c.module === activityMetadata.module)
        : false;

      if (activityMetadata?.isModuleCompletion && isFirstCompletion) {
        const moduleName = activityMetadata.module;
        let abbrev = 'SF';
        if (moduleName === 'Phishing Detective') abbrev = 'PD';
        else if (moduleName === 'OWASP Top 10 Defenses') abbrev = 'OW';
        
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const certId = `CQ-${abbrev}-${year}-${rand}`;
        
        const certificateIssued = {
          id: certId,
          module: moduleName,
          score: activityMetadata.score || 0,
          issuedAt: timestamp
        };
        
        updatedCertificates = [...updatedCertificates, certificateIssued];

        // Log Certificate Earned timeline event
        newActivities.unshift({
          id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'certificate_earned',
          title: 'Certificate Earned',
          description: `Earned Certificate of Completion for ${moduleName} (Verification ID: ${certId})`,
          timestamp
        });

        // Check if first certificate to unlock CertifiedLearner badge
        if (!updatedBadges.includes('CertifiedLearner')) {
          updatedBadges.push('CertifiedLearner');
          badgesUnlocked.push('CertifiedLearner');
          // Log badge unlocked event
          newActivities.unshift({
            id: `badge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'badge_unlock',
            title: 'Badge Unlocked',
            description: `Unlocked "Certified Learner" badge`,
            timestamp
          });
        }
      }

      // 1. XP Earned event
      if (xpEarned > 0) {
        newActivities.unshift({
          id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'xp_earned',
          title: 'XP Earned',
          description: `+${xpEarned} XP in ${activityMetadata?.module || 'Training'}${activityMetadata?.detail ? ` (${activityMetadata.detail})` : ''}`,
          timestamp
        });
      }

      // 2. Badge Unlock event
      if (badgesUnlocked.length > 0) {
        const badgeTitles = {
          'Initiate': 'Initiate Cadet',
          'FirstInvestigation': 'First Investigation',
          'PhishingInvestigator': 'Phishing Investigator',
          'PerfectAnalyst': 'Perfect Analyst',
          'FundamentalsGraduate': 'Fundamentals Graduate',
          'SecurityGuardian': 'Security Guardian',
          'AIExplorer': 'AI Explorer',
          'CertifiedLearner': 'Certified Learner',
          'OWASPExplorer': 'OWASP Explorer',
          'ThreatHunter': 'Threat Hunter',
          'ApplicationGuardian': 'Application Guardian'
        };
        badgesUnlocked.forEach(badge => {
          // If CertifiedLearner was logged inside the certificate block above, skip logging it again here
          if (badge === 'CertifiedLearner' && newActivities.some(a => a.description?.includes('"Certified Learner"'))) {
            return;
          }
          const title = badgeTitles[badge] || badge;
          newActivities.unshift({
            id: `badge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'badge_unlock',
            title: 'Badge Unlocked',
            description: `Unlocked "${title}" badge`,
            timestamp
          });
        });
      }

      // 3. Level Up event
      if (newLevel > currentLevel) {
        newActivities.unshift({
          id: `lvl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'level_up',
          title: 'Level Up',
          description: `Promoted to Level ${newLevel}!`,
          timestamp
        });
      }

      // 4. Module Completion event (log only on first completion to avoid duplicates)
      if (activityMetadata?.isModuleCompletion && isFirstCompletion) {
        newActivities.unshift({
          id: `mod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'module_completion',
          title: 'Module Completed',
          description: `Completed ${activityMetadata.module} with ${activityMetadata.accuracy || '100%'} accuracy`,
          timestamp
        });
      }

      // Cap at 20 activities
      const trimmedActivities = newActivities.slice(0, 20);

      const updates = {
        xp: newXP,
        level: newLevel,
        xpNeeded,
        badges: updatedBadges,
        certificates: updatedCertificates,
        activities: trimmedActivities
      };

      const newProfile = await userService.updateProfile(user.uid, updates);
      setUserProfile(newProfile);

      return {
        profile: newProfile,
        xpEarned,
        levelUp: newLevel > currentLevel,
        newLevel,
        badgeUnlocked: badgesUnlocked[0] || null,
        badgesUnlocked
      };
    } catch (err) {
      console.error("Failed to update progression:", err);
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
    updateProfile: updateProfileFields,
    updateProgression
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
