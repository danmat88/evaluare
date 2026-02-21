import { create } from 'zustand';
import { subscribeToAuth, getUserProfile, logoutUser } from '../firebase/auth';

let unsubscribe = null; // ✅ guard — only one listener at a time

const useAuthStore = create((set) => ({
  user:    null,
  profile: null,
  loading: true,
  error:   null,

  init: () => {
    if (unsubscribe) return; // already initialized, skip

    unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        set({ user: firebaseUser, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  },

  setUser:    (user)    => set({ user }),
  setProfile: (profile) => set({ profile }),
  setError:   (error)   => set({ error }),
  clearError: ()        => set({ error: null }),

  logout: async () => {
    await logoutUser();
    set({ user: null, profile: null });
  },
}));

export default useAuthStore;
