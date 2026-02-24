export interface Guest {
  name: string;
  titles: string[];
  reach: {
    platforms: string[];
    websites: string[];
    products: string[];
  };
}

export interface Book {
  title: string;
  author?: string | null;
  why?: string | null;
  url?: string | null;
}

export interface TvMovie {
  title: string;
  type?: 'tv_show' | 'movie' | string;
  why?: string | null;
  url?: string | null;
}

export interface Product {
  name: string;
  why?: string | null;
  url?: string | null;
}

export interface LightningRound {
  books?: Book[];
  tv_movies?: TvMovie[];
  products?: Product[];
  life_motto?: string | null;
  interview_question?: string | null;
  productivity_tip?: string | null;
}

export interface WhereToFindLink {
  label: string;
  url: string;
}

export interface Episode {
  filename: string;
  guests: Guest[];
  lightning_round: LightningRound;
  substack_url: string | null;
  /** Guest contact links scraped from Substack article "Where to find {Name}:" section */
  where_to_find?: WhereToFindLink[];
}

// Aggregated types for catalog pages
export interface AggregatedBook extends Book {
  recommendedBy: string[];
}

export interface AggregatedTvMovie extends TvMovie {
  recommendedBy: string[];
}

export interface AggregatedProduct extends Product {
  recommendedBy: string[];
}

// Canvas item used by InfiniteCanvas and catalog pages
export interface CanvasItem {
  id: string;
  title: string;
  subtitle?: string;
  why: string;
  /** All guests who recommended this item (after deduplication) */
  recommendedBy: string[];
  /** Number of unique recommenders (= recommendedBy.length) */
  count: number;
  type: 'book' | 'movie' | 'product' | 'motto';
  substackUrl: string | null;
  /** Direct link to buy/visit the item, sourced from Substack article footer */
  itemUrl: string | null;
  x: number;
  y: number;
  accentColor?: string;
}
