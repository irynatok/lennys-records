import { z } from 'zod';

/**
 * Runtime validation schemas matching TypeScript interfaces
 * Used to validate recommendations.json at runtime
 */

export const GuestSchema = z.object({
  name: z.string(),
  titles: z.array(z.string()),
  reach: z.object({
    platforms: z.array(z.string()),
    websites: z.array(z.string()),
    products: z.array(z.string()),
  }),
});

export const BookSchema = z.object({
  title: z.string(),
  author: z.string().nullable().optional(),
  why: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const TvMovieSchema = z.object({
  title: z.string(),
  type: z.string().optional().default('movie'),
  why: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const ProductSchema = z.object({
  name: z.string(),
  why: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const LightningRoundSchema = z.object({
  books: z.array(BookSchema).optional().default([]),
  tv_movies: z.array(TvMovieSchema).optional().default([]),
  products: z.array(ProductSchema).optional().default([]),
  life_motto: z.string().nullable().optional(),
  interview_question: z.string().nullable().optional(),
  productivity_tip: z.string().nullable().optional(),
});

export const WhereToFindLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const EpisodeSchema = z.object({
  filename: z.string(),
  guests: z.array(GuestSchema),
  lightning_round: LightningRoundSchema,
  substack_url: z.string().nullable(),
  where_to_find: z.array(WhereToFindLinkSchema).optional(),
});

export const EpisodesArraySchema = z.array(EpisodeSchema);

// Export type inference helpers
export type ValidatedEpisode = z.infer<typeof EpisodeSchema>;
export type ValidatedEpisodes = z.infer<typeof EpisodesArraySchema>;
