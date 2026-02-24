# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lenny's Records** — A web app for browsing lightning round recommendations from Lenny's Podcast. Consists of:
1. Python extraction script that parses 302 podcast transcripts (275 with lightning rounds, 27 skipped)
2. React web app for exploring books, movies, products, and life mottos
3. Substack URL matching script that links episodes to their newsletter articles

## Data Extraction

### Setup
```bash
# Primary: Groq API (llama-3.3-70b)
export GROQ_API_KEY=...
# Fallback: Google Gemini
export GOOGLE_API_KEY=...
python3 extract_recs.py
```

### How it works
1. Parses transcript files to find lightning round sections
2. Sends sections to Groq API (with Gemini fallback) for structured extraction
3. Outputs `recommendations.json` with books, movies, products, life mottos per episode
4. Resumable: skips already-processed episodes on restart
5. 27 episodes correctly skipped (compilations, teasers, early episodes without lightning rounds)

### Substack URL linking
```bash
python3 add_substack_urls.py
```
- Fetches podcast RSS feed from `api.substack.com/feed/podcast/10845.rss`
- Matches episodes to guest names using two strategies: pipe-separated title format and full-title name matching
- 272 out of 274 episodes matched (1 has no Substack article, 1 episode has no guests)
- Adds `substack_url` field to each episode in `recommendations.json`

### Key files
- `extract_recs.py` — Extraction logic (Groq primary, Gemini fallback)
- `add_substack_urls.py` — Substack URL matching script
- `lennys-podcast-transcripts/` — Raw transcript files (302 total)
- `recommendations.json` — Output (must be copied to `web/public/` after changes)

### Updating the web app data
After any changes to `recommendations.json`:
```bash
cp recommendations.json web/public/recommendations.json
```

## Web Application

### Setup & Run
```bash
cd web
npm install
npm run dev
# Open http://localhost:5173
```

### Development Commands
```bash
npm run dev           # Start dev server with auto data-copy
npm run build         # Production build with optimizations
npm run preview       # Preview production build
npm run test          # Run tests in watch mode
npm run test:ui       # Open Vitest UI
npm run test:coverage # Generate coverage report
npm run lint          # ESLint check
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run analyze       # Build with bundle size analysis
npm run verify        # Run all quality checks
```

### Tech Stack
- React 19.2 + TypeScript 5.9 + Vite 7.2
- React Router v7 (5 routes)
- Motion (Framer Motion) for animations
- react-zoom-pan-pinch for pan/zoom canvas
- Tailwind CSS v4
- Zod 4.3 for runtime validation
- Vitest 4.0 for testing

### Architecture

**Routes:**
- `/` — Home: 3D file drawer cascade of guest folders (wheel scroll to browse)
- `/books` — Infinite canvas grid of all book recommendations
- `/movies` — Infinite canvas grid of movies/TV shows
- `/products` — Infinite canvas grid of products
- `/life-mottos` — Infinite canvas grid of life philosophies

**Key Components:**
- `GuestCloud.tsx` — 3D drawer with frontal folder cascade (home page), emits `onGuestClick` callback
- `InfiniteCanvas.tsx` — Pan/zoom canvas with custom wheel handling (20-column grid), emits `onItemClick` callback
- `ItemCard.tsx` — Individual recommendation cards in grid
- `ItemModal.tsx` — Detailed view with "why", guest attribution, and Substack link
- `GuestModal.tsx` — Full lightning round view with Substack link and "Where to Find" section
- `MottoModal.tsx` — Life motto detail view with guest attribution and episode link

**Shared Components** (consolidated from duplicate code):
- `ModalBackdrop.tsx` — Reusable modal backdrop with blur effect and configurable z-index
- `ModalFooter.tsx` — Reusable modal navigation footer (Prev/Next/Close buttons)
- `ErrorBoundary.tsx` — React error boundary for catching runtime errors
- `ErrorState.tsx` — Reusable error display with retry functionality
- `LoadingSpinner.tsx` — Loading indicator component
- `RouteLoadingFallback.tsx` — Suspense fallback for lazy-loaded routes

**Custom Hooks:**
- `useRecommendations.ts` — Fetches data with Zod validation, retry logic (3 attempts), localStorage caching (24h), and error handling
- `useModalKeyboard.ts` — Keyboard event handling (Escape, Arrow keys) and body scroll lock
- `useModalNavigation.ts` — Modal state management (selectedItem, navigation handlers, random pick)

**Constants:**
- `constants/layout.ts` — Grid layout constants (GRID_LAYOUT object with cols, card dimensions, gaps, margins)
- `constants/zIndex.ts` — Z-index values for modal layers (single source of truth)
- `constants/modal.ts` — Modal dimension constants (MAX_WIDTH: 580px, MAX_HEIGHT: 88vh) for consistent sizing across all modals

**Data Layer:**
- `data/types.ts` — TypeScript interfaces for all data structures
- `data/schemas.ts` — Zod schemas for runtime validation (matches TypeScript types)
- `data/dataCache.ts` — localStorage cache manager with 24h expiry
- `data/canvasUtils.ts` — Aggregation and grid layout utilities
- `data/useRecommendations.ts` — Data fetching hook with validation, retry, and caching

**Testing:**
- `test/setup.ts` — Vitest configuration and global test setup
- `test/mocks/recommendations.ts` — Mock data for testing
- `data/__tests__/canvasUtils.test.ts` — Tests for aggregation and sorting (12 tests)
- `data/__tests__/schemas.test.ts` — Zod validation tests (7 tests)
- Coverage target: 70%+ for core utilities

**Interactions:**
- **Home page:** Scroll to browse folders, click to open full lightning round
- **Catalog pages:** Trackpad scroll to pan, pinch to zoom, click cards for details
- **Random Pick button:** Available on all pages, opens random recommendation modal
- **Arrow navigation:** Left/right arrows in modals (click or keyboard) to browse sequentially
- **Substack links:** Each modal links to the corresponding Lenny's Newsletter article

**Modal management:** Modals are managed at the page level (HomePage, CatalogPage, LifeMottosPage) using `useModalNavigation` hook. This enables cross-item navigation with arrow keys and consistent state handling. All modals use standardized dimensions (580px × 88vh) from `constants/modal.ts` to prevent size changes when navigating between different modal types.

### Data Flow
1. `useRecommendations.ts` fetches `/recommendations.json`
2. `canvasUtils.ts` uses generic `aggregateItems<T>()` function to:
   - Aggregate and deduplicate items by type (books, movies, products)
   - Generate 20-column grid positions using layout constants
   - Pass through `substack_url` and item metadata
3. Pages use `useModalNavigation` hook for state management
4. Items render in InfiniteCanvas (catalog pages) or GuestCloud (home page)
5. Modals show full details on click with Substack article links

### Data Types
- `Episode` — filename, guests[], lightning_round, substack_url (string | null)
- `CanvasItem` — id, title, subtitle?, why, recommendedBy[], count, type, substackUrl (string | null), itemUrl (string | null), x, y, accentColor?
- `Guest` — name, titles[], reach (platforms, websites, products)
- `LightningRound` — books[], tv_movies[], products[], life_motto, interview_question, productivity_tip
- `Book/TvMovie/Product` — title/name, author/type (nullable), why (nullable), url (string | null)

**Type Conventions:**
- URL fields are consistently typed as `string | null` (not optional) - always present but can be null
- All item types use stable React keys (`${item.title}-${index}`) for performance

### Design System
- Light theme with OKLCH color tokens
- Pastel folder colors (8 rotating shades)
- Glass morphism UI elements
- File folder metaphor with tabs showing guest names

### Code Organization & Best Practices

**Recent Refactoring & Improvements:**
- ✅ Eliminated ~400+ lines of duplicate code across modals and pages
- ✅ Consolidated modal logic into reusable hooks and components
- ✅ Created generic `aggregateItems<T>()` function reducing aggregator code by ~120 lines
- ✅ Established single source of truth for layout constants and z-indices
- ✅ Performance optimizations: memoized calculations, stable React keys
- ✅ Type consistency: standardized URL field types across interfaces

**Production-Ready Enhancements (2026-02):**
- ✅ **Error Handling:** Zod validation, retry logic (3 attempts with 1s delay), error boundaries
- ✅ **Performance:** Code splitting (lazy routes), localStorage caching (24h), optimized bundle chunks
- ✅ **Testing:** Vitest setup with 19 passing tests, Testing Library integration, mock data
- ✅ **Developer Experience:** Prettier formatting, automated build scripts, verification workflow
- ✅ **Build Automation:** Auto-copy recommendations.json, bundle analysis, type checking

**Key Patterns:**
- **Shared hooks** for cross-cutting concerns (keyboard handling, modal navigation)
- **Generic functions** with configuration objects for similar operations
- **Constants files** for magic numbers and shared values
- **Memoization** for expensive calculations (GuestCloud card positions, sorted arrays)
- **Stable keys** in lists to prevent unnecessary re-renders

**File Structure:**
```
web/src/
├── components/
│   ├── catalog/      # InfiniteCanvas, ItemCard, ItemModal
│   ├── home/         # GuestCloud, GuestCard, GuestModal
│   ├── mottos/       # MottoCloud, MottoModal
│   ├── layout/       # PageTransition, Header
│   └── shared/       # ModalBackdrop, ModalFooter, EmptyState
├── constants/        # layout.ts, zIndex.ts
├── data/             # types.ts, canvasUtils.ts, useRecommendations.ts
├── hooks/            # useModalKeyboard.ts, useModalNavigation.ts
└── pages/            # HomePage, CatalogPage, LifeMottosPage
```
