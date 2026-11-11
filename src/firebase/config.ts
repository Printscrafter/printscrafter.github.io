import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test Firestore connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Strictly typed Firestore Error Handling as required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile sync helper
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const pathForGet = `users/${user.uid}`;
  
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    const isAdminEmail = user.email === 'printscrafter@gmail.com';
    const profile: UserProfile = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Collector',
      role: isAdminEmail ? 'admin' : 'customer',
      membershipTier: 'Collector',
      createdAt: new Date().toISOString()
    };

    await setDoc(userRef, profile);

    // If admin email, also register in admins collection
    if (isAdminEmail) {
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString()
      });
    }

    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathForGet);
  }
}

export async function loginWithGoogle(): Promise<UserProfile | null> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      return await syncUserProfile(res.user);
    }
    return null;
  } catch (error) {
    console.error('Google Sign in failed:', error);
    throw error;
  }
}

export async function signUpWithEmail(
  email: string, 
  pass: string, 
  displayName: string,
  phone?: string,
  membershipTier?: 'Collector' | 'Connoisseur' | 'Interior Designer'
): Promise<UserProfile> {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(res.user, { displayName });

  const isAdminEmail = email === 'printscrafter@gmail.com';
  const profile: UserProfile = {
    id: res.user.uid,
    email: email,
    displayName: displayName,
    phone: phone || '',
    membershipTier: membershipTier || 'Collector',
    role: isAdminEmail ? 'admin' : 'customer',
    createdAt: new Date().toISOString()
  };

  const path = `users/${res.user.uid}`;
  try {
    await setDoc(doc(db, 'users', res.user.uid), profile);
    if (isAdminEmail) {
      await setDoc(doc(db, 'admins', res.user.uid), {
        email: email,
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }

  return profile;
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return await syncUserProfile(res.user);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function updateUserProfileData(
  uid: string, 
  updates: Partial<UserProfile>
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
