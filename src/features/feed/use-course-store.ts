import { create } from 'zustand';
import { getItem, setItem } from '@/lib/storage';

type Store = {
  bookmarks: number[];
  enrolledCourses: number[];
  toggleBookmark: (id: number) => void;
  toggleEnroll: (id: number) => void;
  hydrate: () => void;
};

export const useCourseStore = create<Store>((set, get) => ({
  bookmarks: [],
  enrolledCourses: [],

  toggleBookmark: (id) => {
    const current = get().bookmarks;
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    set({ bookmarks: updated });
    setItem('bookmarks', updated);
  },

  toggleEnroll: (id) => {
    const current = get().enrolledCourses;
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    set({ enrolledCourses: updated });
    setItem('enrolledCourses', updated);
  },

  hydrate: () => {
    const bookmarks = getItem<number[]>('bookmarks') ?? [];
    const enrolledCourses = getItem<number[]>('enrolledCourses') ?? [];
    set({ bookmarks, enrolledCourses });
  },
}));
