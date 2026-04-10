import { create } from 'zustand';
import { getItem, setItem } from '@/lib/storage';

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
};

type ProfileState = {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateAvatar: (avatar: string) => void;
  clearProfile: () => void;
  hydrate: () => void;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,

  setUser: (user) => {
    set({ user });
    setItem('user_profile', user);
  },

  updateAvatar: (avatar) => {
    const current = get().user;
    if (!current)
      return;

    const updated = { ...current, avatar };
    set({ user: updated });
    setItem('user_profile', updated);
  },

  clearProfile: () => {
    set({ user: null });
    setItem('user_profile', null);
  },

  hydrate: () => {
    const stored = getItem<UserProfile>('user_profile');
    if (stored)
      set({ user: stored });
  },
}));
