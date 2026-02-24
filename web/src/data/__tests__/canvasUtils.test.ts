import { describe, it, expect } from 'vitest';
import {
  generateCanvasPositions,
  generateSearchLayout,
  aggregateBooks,
  aggregateMovies,
  aggregateProducts,
} from '../canvasUtils';
import type { CanvasItem } from '../types';
import { mockEpisodes } from '../../test/mocks/recommendations';

describe('canvasUtils', () => {
  describe('generateCanvasPositions', () => {
    it('should generate correct positions for a grid', () => {
      const positions = generateCanvasPositions(3);
      expect(positions).toHaveLength(3);
      expect(positions[0]).toMatchObject({ x: expect.any(Number), y: expect.any(Number) });
    });

    it('should handle zero items', () => {
      const positions = generateCanvasPositions(0);
      expect(positions).toHaveLength(0);
    });
  });

  describe('generateSearchLayout', () => {
    const mockItems: CanvasItem[] = [
      {
        id: '1',
        title: 'Test',
        why: 'test',
        recommendedBy: [],
        count: 1,
        type: 'book',
        substackUrl: null,
        itemUrl: null,
        x: 0,
        y: 0,
      },
    ];

    it('should generate compact layout for search results', () => {
      const layout = generateSearchLayout(mockItems);
      expect(layout.items).toHaveLength(1);
      expect(layout.canvasWidth).toBeGreaterThan(0);
      expect(layout.canvasHeight).toBeGreaterThan(0);
    });

    it('should limit columns to 6', () => {
      const manyItems = Array(20)
        .fill(null)
        .map((_, i) => ({ ...mockItems[0], id: String(i) }));
      const layout = generateSearchLayout(manyItems);
      expect(layout.items).toHaveLength(20);
    });
  });

  describe('aggregateBooks', () => {
    it('should aggregate and deduplicate books', () => {
      const books = aggregateBooks(mockEpisodes);
      expect(books.length).toBeGreaterThan(0);
      expect(books[0]).toMatchObject({
        title: expect.any(String),
        recommendedBy: expect.any(Array),
        count: expect.any(Number),
      });
    });

    it('should count multiple recommendations correctly', () => {
      const books = aggregateBooks(mockEpisodes);
      const firstBook = books[0];
      expect(firstBook.count).toBe(firstBook.recommendedBy.length);
    });
  });

  describe('aggregateMovies', () => {
    it('should aggregate TV shows and movies', () => {
      const movies = aggregateMovies(mockEpisodes);
      expect(movies.length).toBeGreaterThan(0);
      expect(movies[0].type).toBe('movie');
    });
  });

  describe('aggregateProducts', () => {
    it('should aggregate products', () => {
      const products = aggregateProducts(mockEpisodes);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toMatchObject({
        title: expect.any(String),
        type: 'product',
      });
    });
  });
});
