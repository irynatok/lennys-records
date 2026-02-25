import type { Episode, CanvasItem } from './types';
import { GRID_LAYOUT, CELL_WIDTH, CELL_HEIGHT } from '../constants/layout';
import { TAG_COLORS } from '../constants/colors';

// ── Grid layout ────────────────────────────────────────────────────────────────

export function generateCanvasPositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    const col = i % GRID_LAYOUT.COLS;
    const row = Math.floor(i / GRID_LAYOUT.COLS);
    positions.push({ x: col * CELL_WIDTH + GRID_LAYOUT.MARGIN, y: row * CELL_HEIGHT + GRID_LAYOUT.MARGIN });
  }
  return positions;
}

// ── Search layout ──────────────────────────────────────────────────────────────

/** Compact grid for search results — up to 6 cols so a handful of cards cluster tightly */
export function generateSearchLayout(items: CanvasItem[]): {
  items: CanvasItem[];
  canvasWidth: number;
  canvasHeight: number;
} {
  const cols = Math.min(items.length, 6);
  const cellW = GRID_LAYOUT.CARD_W + GRID_LAYOUT.H_GAP;
  const cellH = GRID_LAYOUT.CARD_H + GRID_LAYOUT.V_GAP;
  const positioned = items.map((item, i) => ({
    ...item,
    x: (i % cols) * cellW + GRID_LAYOUT.MARGIN,
    y: Math.floor(i / cols) * cellH + GRID_LAYOUT.MARGIN,
  }));
  const rows = Math.ceil(items.length / Math.max(cols, 1));
  return {
    items: positioned,
    // Calculate canvas size: cards + gaps between them (not after last one) + margins
    canvasWidth: cols * GRID_LAYOUT.CARD_W + Math.max(0, cols - 1) * GRID_LAYOUT.H_GAP + GRID_LAYOUT.MARGIN * 2,
    canvasHeight: rows * GRID_LAYOUT.CARD_H + Math.max(0, rows - 1) * GRID_LAYOUT.V_GAP + GRID_LAYOUT.MARGIN * 2,
  };
}


// ── Normalise ──────────────────────────────────────────────────────────────────

function normalizeTitle(title: string, stripAuthorSuffix = false): string {
  let t = title;
  if (stripAuthorSuffix) {
    // Strip " - Author Name" suffix (author starts with uppercase) before lowercasing
    t = t.replace(/\s*[-–]\s*[A-Z][^-–]*$/, '');
  }
  return t
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '') // strip leading articles for dedup
    .replace(/[^\w\s]/g, '')
    .trim();
}

// ── Aggregators ────────────────────────────────────────────────────────────────

// Generic aggregator configuration
interface AggregateConfig<T> {
  getItems: (lr: Episode['lightning_round']) => T[];
  getKey: (item: T) => string;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string | undefined;
  getWhy: (item: T) => string | null;
  getUrl: (item: T) => string | null | undefined;
  type: 'book' | 'movie' | 'product';
  stripAuthorSuffix?: boolean;
}

/**
 * Generic aggregator function that consolidates duplicate logic
 * across books, movies, and products
 */
function aggregateItems<T>(episodes: Episode[], config: AggregateConfig<T>): CanvasItem[] {
  const map = new Map<string, CanvasItem>();

  episodes.forEach((ep, index) => {
    if (!ep.lightning_round) return;
    const items = config.getItems(ep.lightning_round);
    if (!items) return;

    const guestName = ep.guests.map((g) => g.name).join(' & ');
    const accentColor = TAG_COLORS[index % TAG_COLORS.length];

    items.forEach((item) => {
      const title = config.getTitle(item);
      if (!title || title === 'null') return;
      const key = normalizeTitle(title, config.stripAuthorSuffix);

      if (map.has(key)) {
        const existing = map.get(key)!;
        if (!existing.recommendedBy.includes(guestName)) {
          existing.recommendedBy.push(guestName);
          existing.count = existing.recommendedBy.length;
        }
        // Prefer the longer title variant (e.g. "Atomic Habits - James Clear" over "Atomic Habits")
        if (title.length > existing.title.length) existing.title = title;
        const why = config.getWhy(item);
        if (why && why.length > (existing.why?.length ?? 0)) existing.why = why;
        if (!existing.substackUrl && ep.substack_url) existing.substackUrl = ep.substack_url;
        const url = config.getUrl(item);
        if (!existing.itemUrl && url) existing.itemUrl = url;
        if (config.getSubtitle && !existing.subtitle) {
          existing.subtitle = config.getSubtitle(item);
        }
      } else {
        map.set(key, {
          id: `${config.type}-${key}`,
          title,
          subtitle: config.getSubtitle?.(item),
          why: config.getWhy(item) ?? '',
          recommendedBy: [guestName],
          count: 1,
          type: config.type,
          substackUrl: ep.substack_url,
          itemUrl: config.getUrl(item) ?? null,
          accentColor,
          x: 0,
          y: 0,
        });
      }
    });
  });

  const items = Array.from(map.values());
  const positions = generateCanvasPositions(items.length);
  return items.map((item, i) => ({ ...item, x: positions[i].x, y: positions[i].y }));
}

export function aggregateBooks(episodes: Episode[]): CanvasItem[] {
  return aggregateItems(episodes, {
    getItems: (lr) => lr.books || [],
    getKey: (book) => book.title,
    getTitle: (book) => book.author ? `${book.title} - ${book.author}` : book.title,
    getSubtitle: () => undefined,
    getWhy: (book) => book.why ?? null,
    getUrl: (book) => book.url ?? null,
    type: 'book',
    stripAuthorSuffix: true,
  });
}

export function aggregateMovies(episodes: Episode[]): CanvasItem[] {
  return aggregateItems(episodes, {
    getItems: (lr) => lr.tv_movies || [],
    getKey: (movie) => movie.title,
    getTitle: (movie) => movie.title,
    getSubtitle: () => undefined,
    getWhy: (movie) => movie.why ?? null,
    getUrl: (movie) => movie.url ?? null,
    type: 'movie',
  });
}

export function aggregateProducts(episodes: Episode[]): CanvasItem[] {
  return aggregateItems(episodes, {
    getItems: (lr) => lr.products || [],
    getKey: (product) => product.name,
    getTitle: (product) => product.name,
    getSubtitle: () => undefined,
    getWhy: (product) => product.why ?? null,
    getUrl: (product) => product.url ?? null,
    type: 'product',
  });
}

export function aggregateLifeMottos(episodes: Episode[]): CanvasItem[] {
  const items: CanvasItem[] = [];

  episodes.forEach((ep, index) => {
    const motto = ep.lightning_round.life_motto;
    if (!motto || motto === 'null') return;
    const guestName = ep.guests.map((g) => g.name).join(' & ');
    const accentColor = TAG_COLORS[index % TAG_COLORS.length];

    items.push({
      id: `motto-${ep.filename}`,
      title: motto,
      subtitle: undefined,
      why: '',
      recommendedBy: [guestName],
      count: 1,
      type: 'motto',
      substackUrl: ep.substack_url,
      itemUrl: null,
      accentColor,
      x: 0, y: 0,
    });
  });

  const positions = generateCanvasPositions(items.length);
  return items.map((item, i) => ({ ...item, x: positions[i].x, y: positions[i].y }));
}
