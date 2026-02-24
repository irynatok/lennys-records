import { useState, useEffect, useCallback } from 'react';
import type { Episode } from './types';
import { EpisodesArraySchema } from './schemas';
import { dataCache } from './dataCache';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function normalizeNulls<T>(obj: T): T {
  if (obj === 'null' || obj === '') return null as T;
  if (Array.isArray(obj)) return obj.map(normalizeNulls) as T;
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, normalizeNulls(v)])
    ) as T;
  }
  return obj;
}

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }
    throw err;
  }
}

export function useRecommendations() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to load from cache first
      const cached = dataCache.get();
      if (cached) {
        setEpisodes(cached);
        setLoading(false);
        return;
      }

      // Fetch from network if no cache
      const res = await fetchWithRetry('/recommendations.json');
      const rawData = await res.json();

      // Validate data structure with Zod
      const validationResult = EpisodesArraySchema.safeParse(rawData);
      if (!validationResult.success) {
        if (import.meta.env.DEV) {
          console.error('Validation errors:', validationResult.error.format());
        }
        throw new Error(
          'Invalid data format. Please check the recommendations file.'
        );
      }

      // Normalize null values
      const normalized = normalizeNulls(validationResult.data);
      setEpisodes(normalized);

      // Cache the validated and normalized data
      dataCache.set(normalized);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(message);
      if (import.meta.env.DEV) {
        console.error('Failed to load recommendations:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    episodes,
    loading,
    error,
    retry: loadData,
  };
}
