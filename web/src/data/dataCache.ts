import type { Episode } from './types';

const CACHE_KEY = 'lenny-recs-cache';
const CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEntry {
  timestamp: number;
  data: Episode[];
}

/**
 * localStorage cache for recommendations data
 * Reduces network requests on repeat visits
 */
export const dataCache = {
  get(): Episode[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);

      // Check if cache is expired
      if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return entry.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to read cache:', error);
      }
      return null;
    }
  },

  set(data: Episode[]): void {
    try {
      const entry: CacheEntry = {
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch (error) {
      // Silently fail if localStorage is full or unavailable
      if (import.meta.env.DEV) {
        console.warn('Failed to write cache:', error);
      }
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to clear cache:', error);
      }
    }
  },
};
