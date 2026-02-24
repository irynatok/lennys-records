import { describe, it, expect } from 'vitest';
import { EpisodeSchema, EpisodesArraySchema } from '../schemas';
import { mockEpisode, mockEpisodes } from '../../test/mocks/recommendations';

describe('schemas', () => {
  describe('EpisodeSchema', () => {
    it('should validate a valid episode', () => {
      const result = EpisodeSchema.safeParse(mockEpisode);
      expect(result.success).toBe(true);
    });

    it('should reject invalid episode structure', () => {
      const invalid = { filename: 'test.txt' }; // Missing required fields
      const result = EpisodeSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept null values for optional fields', () => {
      const episode = {
        ...mockEpisode,
        substack_url: null,
      };
      const result = EpisodeSchema.safeParse(episode);
      expect(result.success).toBe(true);
    });

    it('should reject non-null invalid types', () => {
      const invalid = {
        ...mockEpisode,
        guests: 'not an array', // Wrong type
      };
      const result = EpisodeSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('EpisodesArraySchema', () => {
    it('should validate an array of episodes', () => {
      const result = EpisodesArraySchema.safeParse(mockEpisodes);
      expect(result.success).toBe(true);
    });

    it('should reject non-array input', () => {
      const result = EpisodesArraySchema.safeParse(mockEpisode);
      expect(result.success).toBe(false);
    });

    it('should reject array with invalid episodes', () => {
      const invalid = [mockEpisode, { filename: 'incomplete' }];
      const result = EpisodesArraySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
