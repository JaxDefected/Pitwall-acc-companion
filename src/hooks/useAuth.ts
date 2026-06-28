import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { 
  auth, 
  googleProvider, 
  isCloudEnabled, 
  dbFetchUserProfile, 
  dbSaveUserProfile, 
  UserProfile 
} from "../firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);

  // Load profile details whenever the active authenticated user changes
  const loadProfile = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setProfile(null);
      setNeedsOnboarding(false);
      return;
    }
    
    // First, check local fallback cache for instant UI rendering!
    const fallbackStr = localStorage.getItem(`acc_profile_fallback_${firebaseUser.uid}`);
    if (fallbackStr) {
      try {
        const cached = JSON.parse(fallbackStr) as UserProfile;
        setProfile(cached);
        setNeedsOnboarding(false);
      } catch (e) {
        // ignore
      }
    }
    
    try {
      // Race the Firebase profile fetch against a 2-second timeout
      const fetchPromise = dbFetchUserProfile(firebaseUser.uid);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout fetching profile")), 2000)
      );
      
      const userProfile = await Promise.race([fetchPromise, timeoutPromise]);
      if (userProfile) {
        setProfile(userProfile);
        setNeedsOnboarding(false);
        // Sync cache
        localStorage.setItem(`acc_profile_fallback_${firebaseUser.uid}`, JSON.stringify(userProfile));
      } else {
        // If no userProfile in DB, but we have a fallback, keep the fallback!
        if (!fallbackStr) {
          setProfile(null);
          setNeedsOnboarding(true);
        }
      }
    } catch (err) {
      console.warn("Database error loading user profile, relying on local cache:", err);
      // Fallback: trigger onboarding only if we don't have a local cache
      if (!fallbackStr) {
        setNeedsOnboarding(true);
      }
    }
  };

  useEffect(() => {
    if (isCloudEnabled && auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            await loadProfile(currentUser);
          } else {
            setProfile(null);
            setNeedsOnboarding(false);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Auth state change error:", error);
          setLoading(false);
        }
      );
      return unsubscribe;
    } else {
      // Mock auth behavior when cloud is disabled or in mock-mode
      const mockStr = localStorage.getItem("acc_mock_user");
      if (mockStr) {
        const parsed = JSON.parse(mockStr);
        setUser(parsed);
        loadProfile(parsed).then(() => setLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setNeedsOnboarding(false);
        setLoading(false);
      }
    }
  }, []);

  const login = async (): Promise<User> => {
    setLoading(true);
    if (isCloudEnabled && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        setUser(result.user);
        await loadProfile(result.user);
        setLoading(false);
        return result.user;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    } else {
      // Mock user login for local caching/fallback
      const mockUser = {
        uid: "mock_driver_lead_1",
        displayName: "Apex Lead",
        email: "lowther.jack@gmail.com",
        photoURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80",
        emailVerified: true,
      } as unknown as User;
      localStorage.setItem("acc_mock_user", JSON.stringify(mockUser));
      setUser(mockUser);
      await loadProfile(mockUser);
      setLoading(false);
      return mockUser;
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    if (isCloudEnabled && auth) {
      try {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setNeedsOnboarding(false);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    } else {
      localStorage.removeItem("acc_mock_user");
      setUser(null);
      setProfile(null);
      setNeedsOnboarding(false);
      setLoading(false);
    }
  };

  const saveProfileData = async (username: string, pinnedSeriesCars: string[]): Promise<void> => {
    if (!user) throw new Error("No active authenticated session.");
    const newProfile: UserProfile = {
      uid: user.uid,
      username: username.trim(),
      pinnedSeriesCars
    };
    
    // 1. Instantly update the local React states optimistically
    setProfile(newProfile);
    setNeedsOnboarding(false);
    
    // 2. Persist in direct local storage fallback so that browser reload or page re-renders are completely safe and instantly closed
    localStorage.setItem(`acc_profile_fallback_${user.uid}`, JSON.stringify(newProfile));
    
    // 3. Initiate the database task in the background, racing it with a 2-second timeout to prevent ui locks on network retry loops
    try {
      const writePromise = dbSaveUserProfile(newProfile);
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout syncing profile with database")), 2000)
      );
      
      await Promise.race([writePromise, timeoutPromise]);
    } catch (err: any) {
      console.warn("Database storage deferred to background or local cache:", err);
      // We purposefully do not re-throw here to prevent blocking standard client-side operation
    }
  };

  return {
    user,
    profile,
    loading,
    needsOnboarding,
    login,
    logout,
    saveProfileData,
    setProfile // allow manual edits of profile filters
  };
}
