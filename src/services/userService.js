import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// Check if Firebase is configured with active keys and database is loaded
const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY && !!db;


// Mock local storage database key for fallback mode
const LOCAL_USERS_KEY = 'cyberquest_mock_users';

const getLocalUsers = () => {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Local storage access failed:", e);
    return {};
  }
};

const saveLocalUsers = (users) => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Local storage save failed:", e);
  }
};

/**
 * Service to manage user profiles in Firestore (or LocalStorage as developer fallback).
 */
export const userService = {
  /**
   * Retrieves or creates a user profile.
   * @param {Object} authUser - The authenticated user from Auth state.
   * @returns {Promise<Object>} The full profile data.
   */
  async getOrCreateProfile(authUser) {
    if (!isFirebaseConfigured) {
      // Developer Fallback Mode
      const localUsers = getLocalUsers();
      let profile = localUsers[authUser.uid];
      const now = new Date().toISOString();

      if (!profile) {
        profile = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName || 'Cyber Cadet',
          photoURL: authUser.photoURL || null,
          role: 'Security Enthusiast',
          level: 1,
          xp: 25, // Start with a small amount of XP
          xpNeeded: 100,
          badges: ['Initiate'],
          createdAt: now,
          lastLoginAt: now,
          bio: 'Interested in learning secure practices and coding.'
        };
        localUsers[authUser.uid] = profile;
        saveLocalUsers(localUsers);
      } else {
        profile.lastLoginAt = now;
        localUsers[authUser.uid] = profile;
        saveLocalUsers(localUsers);
      }
      return profile;
    }

    // Real Firebase Firestore Mode
    const userDocRef = doc(db, 'users', authUser.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      const now = new Date().toISOString();

      if (!userDoc.exists()) {
        const initialProfile = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName || 'Cyber Cadet',
          photoURL: authUser.photoURL || null,
          role: 'Security Enthusiast',
          level: 1,
          xp: 25,
          xpNeeded: 100,
          badges: ['Initiate'],
          createdAt: now,
          lastLoginAt: now,
          bio: 'Interested in learning secure practices and coding.'
        };
        await setDoc(userDocRef, initialProfile);
        return initialProfile;
      } else {
        const existingData = userDoc.data();
        const updatedProfile = {
          ...existingData,
          lastLoginAt: now,
        };
        await updateDoc(userDocRef, { lastLoginAt: now });
        return updatedProfile;
      }
    } catch (error) {
      console.error("Error in getOrCreateProfile:", error);
      throw error;
    }
  },

  /**
   * Updates specific fields in the user profile.
   * @param {string} uid - User ID.
   * @param {Object} data - Key-value pairs to update.
   * @returns {Promise<Object>} The updated profile document.
   */
  async updateProfile(uid, data) {
    if (!isFirebaseConfigured) {
      // Developer Fallback Mode
      const localUsers = getLocalUsers();
      if (localUsers[uid]) {
        localUsers[uid] = { ...localUsers[uid], ...data };
        saveLocalUsers(localUsers);
        return localUsers[uid];
      }
      throw new Error("Mock user profile not found.");
    }

    // Real Firebase Firestore Mode
    const userDocRef = doc(db, 'users', uid);
    try {
      await updateDoc(userDocRef, data);
      const updatedDoc = await getDoc(userDocRef);
      return updatedDoc.data();
    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  },

  /**
   * Verifies a certificate ID by checking database records.
   * Abstracted here so it can later migrate to check certificates/{certificateId} directly.
   * @param {string} certificateId - The ID of the certificate.
   * @returns {Promise<Object>} Verification result.
   */
  async verifyCertificate(certificateId) {
    if (!certificateId) return { valid: false };

    if (!isFirebaseConfigured) {
      // Developer Fallback Mode: scan in-memory / local storage profiles
      const localUsers = getLocalUsers();
      for (const uid in localUsers) {
        const userProfile = localUsers[uid];
        const certs = userProfile.certificates || [];
        const found = certs.find(c => c.id === certificateId);
        if (found) {
          return {
            valid: true,
            certificate: found,
            learnerName: userProfile.displayName || 'Cyber Cadet',
          };
        }
      }
      return { valid: false };
    }

    // Real Firebase Firestore Mode
    // Note: Scanning the 'users' collection is a temporary lookup mechanism.
    // In a production app, certificates would be written to a top-level '/certificates'
    // collection at the time of creation, allowing direct lookup: doc(db, 'certificates', certificateId).
    try {
      const usersColRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersColRef);
      for (const docSnap of querySnapshot.docs) {
        const userData = docSnap.data();
        const certs = userData.certificates || [];
        const found = certs.find(c => c.id === certificateId);
        if (found) {
          return {
            valid: true,
            certificate: found,
            learnerName: userData.displayName || 'Cyber Cadet',
          };
        }
      }
      return { valid: false };
    } catch (error) {
      console.error("Error in verifyCertificate:", error);
      throw error;
    }
  }
};
