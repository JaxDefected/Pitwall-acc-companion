import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocFromServer,
  Timestamp,
} from "firebase/firestore";
// Import the config (our placeholder guarantees this compiles successfully)
import firebaseConfig from "../firebase-applet-config.json";

// Check if firebaseConfig is valid and populated
export const isCloudEnabled =
  firebaseConfig &&
  typeof firebaseConfig === "object" &&
  "apiKey" in firebaseConfig &&
  Boolean((firebaseConfig as any).apiKey);

let app: any = null;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

if (isCloudEnabled) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = (firebaseConfig as any).firestoreDatabaseId;
    db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn("Failed to initialize Live Firebase Services. Defaulting to local storage.", error);
  }
}

export { db, auth, googleProvider };

// STRICT ERROR HANDLING PATTERN AS SPECIFIED IN SKILL.md
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
      tenantId: currentAuth?.currentUser?.tenantId || null,
    },
    operationType,
    path,
  };
  console.error("Firestore Error Detailed Payload: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test live collection connection on launch
if (isCloudEnabled && db) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("the client is offline")) {
        console.error("Firebase connection check: Client is offline. Verify network or database configuration.");
      }
    }
  };
  testConnection();
}

// Adapters for unified Cloud + Local storage experience
export interface SetupItem {
  id: string;
  name: string;
  car: string;
  track: string;
  notes: string;
  rawData: any; // The full parsed JSON from ACC
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  uploadedBy: string;
  uploadedByName: string;
}

export interface GuideItem {
  id: string;
  content: string;
  updatedAt: string;
  updatedBy: string;
}

// Local storage keys
const LOCAL_SETUPS_KEY = "acc_setups_v1";
const LOCAL_GUIDES_KEY = "acc_guide_v1";

// Standalone offline helper
export function isOfflineError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  return msg.includes("offline") || msg.includes("could not reach") || msg.includes("unavailable") || msg.includes("network");
}

// Local storage fallback helpers
async function fetchSetupsLocal(): Promise<SetupItem[]> {
  const raw = localStorage.getItem(LOCAL_SETUPS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveSetupLocal(setup: SetupItem): Promise<void> {
  const setups = await fetchSetupsLocal();
  const index = setups.findIndex((s) => s.id === setup.id);
  if (index >= 0) {
    setups[index] = setup;
  } else {
    setups.push(setup);
  }
  localStorage.setItem(LOCAL_SETUPS_KEY, JSON.stringify(setups));
}

async function deleteSetupLocal(id: string): Promise<void> {
  const setups = await fetchSetupsLocal();
  const filtered = setups.filter((s) => s.id !== id);
  localStorage.setItem(LOCAL_SETUPS_KEY, JSON.stringify(filtered));
}

async function saveGuideLocal(content: string, userId: string): Promise<void> {
  const payload: GuideItem = {
    id: "active_guide",
    content,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };
  localStorage.setItem(LOCAL_GUIDES_KEY, JSON.stringify(payload));
}

async function fetchGuideLocal(): Promise<string | null> {
  const raw = localStorage.getItem(LOCAL_GUIDES_KEY);
  if (raw) {
    try {
      const guideObj = JSON.parse(raw) as GuideItem;
      return guideObj.content;
    } catch {
      return null;
    }
  }
  return null;
}

async function checkUsernameAvailableLocal(username: string): Promise<boolean> {
  if (!username || username.trim().length < 3) return false;
  const cleanUsername = username.trim();
  const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
  const profiles: UserProfile[] = raw ? JSON.parse(raw) : [];
  return !profiles.some((p) => p.username.toLowerCase() === cleanUsername.toLowerCase());
}

async function saveUserProfileLocal(profile: UserProfile): Promise<void> {
  const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
  const profiles: UserProfile[] = raw ? JSON.parse(raw) : [];
  const index = profiles.findIndex((p) => p.uid === profile.uid);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
}

async function fetchUserProfileLocal(uid: string): Promise<UserProfile | null> {
  const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
  const profiles: UserProfile[] = raw ? JSON.parse(raw) : [];
  return profiles.find((p) => p.uid === uid) || null;
}

async function saveTunedSetupLocal(setup: SavedSetupItem): Promise<void> {
  const raw = localStorage.getItem(LOCAL_SAVED_SETUPS_KEY);
  const setups: SavedSetupItem[] = raw ? JSON.parse(raw) : [];
  const index = setups.findIndex((s) => s.id === setup.id);
  if (index >= 0) {
    setups[index] = setup;
  } else {
    setups.push(setup);
  }
  localStorage.setItem(LOCAL_SAVED_SETUPS_KEY, JSON.stringify(setups));
}

async function fetchTunedSetupsLocal(): Promise<SavedSetupItem[]> {
  const raw = localStorage.getItem(LOCAL_SAVED_SETUPS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function deleteTunedSetupLocal(id: string): Promise<void> {
  const raw = localStorage.getItem(LOCAL_SAVED_SETUPS_KEY);
  const setups: SavedSetupItem[] = raw ? JSON.parse(raw) : [];
  const filtered = setups.filter((s) => s.id !== id);
  localStorage.setItem(LOCAL_SAVED_SETUPS_KEY, JSON.stringify(filtered));
}

async function saveSetupRatingLocal(rating: SetupRatingItem): Promise<void> {
  const raw = localStorage.getItem(LOCAL_RATINGS_KEY);
  const ratings: SetupRatingItem[] = raw ? JSON.parse(raw) : [];
  const index = ratings.findIndex((r) => r.id === rating.id);
  if (index >= 0) {
    ratings[index] = rating;
  } else {
    ratings.push(rating);
  }
  localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(ratings));
}

async function fetchSetupRatingsLocal(setupId: string): Promise<SetupRatingItem[]> {
  const raw = localStorage.getItem(LOCAL_RATINGS_KEY);
  const ratings: SetupRatingItem[] = raw ? JSON.parse(raw) : [];
  return ratings.filter((r) => r.setupId === setupId);
}

async function fetchAllSetupRatingsLocal(): Promise<SetupRatingItem[]> {
  const raw = localStorage.getItem(LOCAL_RATINGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function dbSaveSetup(setup: SetupItem): Promise<void> {
  const path = `setups/${setup.id}`;
  if (isCloudEnabled && db) {
    try {
      await setDoc(doc(db, "setups", setup.id), {
        ...setup,
        // Convert dates to serverTimestamp for proper cloud tracking
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, saving setup locally:", err);
        await saveSetupLocal(setup);
      } else {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  } else {
    await saveSetupLocal(setup);
  }
}

export async function dbFetchSetups(): Promise<SetupItem[]> {
  const path = "setups";
  if (isCloudEnabled && db) {
    try {
      const q = query(collection(db, "setups"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const items: SetupItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Convert timestamp fields back to ISO
        const createTime = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        const updateTime = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;
        items.push({
          ...(data as SetupItem),
          createdAt: createTime || new Date().toISOString(),
          updatedAt: updateTime || new Date().toISOString(),
        });
      });
      return items;
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, fetching setups locally:", err);
        return fetchSetupsLocal();
      }
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  } else {
    return fetchSetupsLocal();
  }
}

export async function dbDeleteSetup(id: string): Promise<void> {
  const path = `setups/${id}`;
  if (isCloudEnabled && db) {
    try {
      await deleteDoc(doc(db, "setups", id));
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, deleting setup locally:", err);
        await deleteSetupLocal(id);
      } else {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  } else {
    await deleteSetupLocal(id);
  }
}

export async function dbSaveGuide(content: string, userId: string = "anonymous"): Promise<void> {
  const path = "guides/active_guide";
  const payload: GuideItem = {
    id: "active_guide",
    content,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };

  if (isCloudEnabled && db) {
    try {
      await setDoc(doc(db, "guides", "active_guide"), payload);
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, saving guide locally:", err);
        await saveGuideLocal(content, userId);
      } else {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  } else {
    await saveGuideLocal(content, userId);
  }
}

export async function dbFetchGuide(): Promise<string | null> {
  const path = "guides/active_guide";
  if (isCloudEnabled && db) {
    try {
      const docSnap = await getDoc(doc(db, "guides", "active_guide"));
      if (docSnap.exists()) {
        return docSnap.data().content as string;
      }
      return null;
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, fetching guide locally:", err);
        return fetchGuideLocal();
      }
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  } else {
    return fetchGuideLocal();
  }
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<any> {
  if (isCloudEnabled && auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Google Auth Login failed:", error);
      throw error;
    }
  } else {
    // Local / development mockup user
    const mockUser = {
      uid: "mock_driver_lead_1",
      displayName: "Driver Lead",
      email: "lowther.jack@gmail.com",
    };
    return mockUser;
  }
}

export async function logoutUser(): Promise<void> {
  if (isCloudEnabled && auth) {
    await signOut(auth);
  }
}

// DRIVER PROFILE & COMMUNITY ENGINE ENHANCEMENTS

export interface UserProfile {
  uid: string;
  username: string;
  pinnedSeriesCars: string[];
}

export interface SavedSetupItem {
  id: string;
  parentSetupId: string;
  authorUsername: string;
  versionNote: string;
  isTeamWorkspace: boolean;
  car: string;
  track: string;
  notes: string;
  rawData: any;
  createdAt: string;
  updatedAt: string;
}

export interface SetupRatingItem {
  id: string;
  setupId: string;
  rating: number;
  tags: string[];
  username: string;
  createdAt: string;
}

const LOCAL_PROFILES_KEY = "acc_user_profiles_v1";
const LOCAL_SAVED_SETUPS_KEY = "acc_saved_setups_v1";
const LOCAL_RATINGS_KEY = "acc_setup_ratings_v1";

// Helper: Check if custom sim username is unique
export async function dbCheckUsernameAvailable(username: string): Promise<boolean> {
  if (!username || username.trim().length < 3) return false;
  const cleanUsername = username.trim();
  
  if (isCloudEnabled && db) {
    try {
      const q = query(collection(db, "users"), where("username", "==", cleanUsername));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, checking username locally:", err);
        return checkUsernameAvailableLocal(username);
      }
      console.error("Failed to query username availability, defaulting to local uniqueness: ", err);
      return true;
    }
  } else {
    return checkUsernameAvailableLocal(username);
  }
}

// Helper: Save driver username profile
export async function dbSaveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  if (isCloudEnabled && db) {
    try {
      await setDoc(doc(db, "users", profile.uid), {
        ...profile,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, saving user profile locally:", err);
        await saveUserProfileLocal(profile);
      } else {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  } else {
    await saveUserProfileLocal(profile);
  }
}

// Helper: Fetch driver username profile
export async function dbFetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  if (isCloudEnabled && db) {
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, fetching user profile locally:", err);
        return fetchUserProfileLocal(uid);
      }
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  } else {
    return fetchUserProfileLocal(uid);
  }
}

// Helper: Save custom tuned setup variant
export async function dbSaveTunedSetup(setup: SavedSetupItem): Promise<void> {
  const path = `savedSetups/${setup.id}`;
  if (isCloudEnabled && db) {
    try {
      await setDoc(doc(db, "savedSetups", setup.id), {
        ...setup,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, saving tuned setup locally:", err);
        await saveTunedSetupLocal(setup);
      } else {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  } else {
    await saveTunedSetupLocal(setup);
  }
}

// Helper: Fetch custom tuned setup variant list
export async function dbFetchTunedSetups(): Promise<SavedSetupItem[]> {
  const path = "savedSetups";
  if (isCloudEnabled && db) {
    try {
      const q = query(collection(db, "savedSetups"));
      const querySnapshot = await getDocs(q);
      const items: SavedSetupItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createTime = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        const updateTime = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;
        items.push({
          ...(data as SavedSetupItem),
          createdAt: createTime || new Date().toISOString(),
          updatedAt: updateTime || new Date().toISOString(),
        });
      });
      return items;
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, fetching tuned setups locally:", err);
        return fetchTunedSetupsLocal();
      }
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  } else {
    return fetchTunedSetupsLocal();
  }
}

// Helper: Delete custom tuned setup variant
export async function dbDeleteTunedSetup(id: string): Promise<void> {
  const path = `savedSetups/${id}`;
  if (isCloudEnabled && db) {
    try {
      await deleteDoc(doc(db, "savedSetups", id));
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, deleting tuned setup locally:", err);
        await deleteTunedSetupLocal(id);
      } else {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  } else {
    await deleteTunedSetupLocal(id);
  }
}

// Helper: Save community setup rating review
export async function dbSaveSetupRating(rating: SetupRatingItem): Promise<void> {
  const path = `setupRatings/${rating.id}`;
  if (isCloudEnabled && db) {
    try {
      await setDoc(doc(db, "setupRatings", rating.id), {
        ...rating,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, saving setup rating locally:", err);
        await saveSetupRatingLocal(rating);
      } else {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  } else {
    await saveSetupRatingLocal(rating);
  }
}

// Helper: Fetch database ratings for setups
export async function dbFetchSetupRatings(setupId: string): Promise<SetupRatingItem[]> {
  const path = `setupRatings`;
  if (isCloudEnabled && db) {
    try {
      const q = query(collection(db, "setupRatings"), where("setupId", "==", setupId));
      const querySnapshot = await getDocs(q);
      const items: SetupRatingItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createTime = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        items.push({
          ...(data as SetupRatingItem),
          createdAt: createTime || new Date().toISOString(),
        });
      });
      return items;
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, fetching setup ratings locally:", err);
        return fetchSetupRatingsLocal(setupId);
      }
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  } else {
    return fetchSetupRatingsLocal(setupId);
  }
}

// Helper: Fetch all ratings in bulk for fast aggregate indicators
export async function dbFetchAllSetupRatings(): Promise<SetupRatingItem[]> {
  const path = "setupRatings";
  if (isCloudEnabled && db) {
    try {
      const q = query(collection(db, "setupRatings"));
      const querySnapshot = await getDocs(q);
      const items: SetupRatingItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createTime = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        items.push({
          ...(data as SetupRatingItem),
          createdAt: createTime || new Date().toISOString(),
        });
      });
      return items;
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Firestore is offline, fetching all setup ratings locally:", err);
        return fetchAllSetupRatingsLocal();
      }
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  } else {
    return fetchAllSetupRatingsLocal();
  }
}
