import type { Course } from './api';
import { create } from 'zustand';
import { getItem, setItem } from '@/lib/storage';

type Store = {
  courses: Course[];
  setCourses: (data: Course[]) => void;
  hydrate: () => void;
};

export const useCourseCacheStore = create<Store>(set => ({
  courses: [],

  setCourses: (data) => {
    set({ courses: data });
    setItem('cachedCourses', data);
  },

  hydrate: () => {
    const stored = getItem<Course[]>('cachedCourses') ?? [];
    set({ courses: stored });
  },
}));
