# Lenny's Records - Web App

React web application for exploring lightning round recommendations from Lenny's Podcast.

📚 **[Deployment Guide](../DEPLOYMENT.md)** - Production deployment instructions for Vercel and Netlify

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Development Commands

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

## Tech Stack

- **React 19.2** + **TypeScript 5.9** + **Vite 7.2**
- **React Router v7** (5 routes)
- **Motion** (Framer Motion) for animations
- **react-zoom-pan-pinch** for pan/zoom canvas
- **Tailwind CSS v4**
- **Zod 4.3** for runtime validation
- **Vitest 4.0** for testing

## Architecture

See [CLAUDE.md](../CLAUDE.md) for full architecture documentation.

**Key Features:**
- 3D file drawer cascade on home page (scroll to browse guests)
- Infinite pan/zoom canvas for browsing books, movies, and products
- Modal navigation with keyboard shortcuts (arrow keys, escape)
- Random pick button on all pages
- Substack article links for each recommendation
- Full-text search across all items and guest names

## Production Deployment

This application is production-ready with:

✅ **Security**: CSP headers, XSS protection, secure URL validation
✅ **Performance**: Code splitting, lazy loading, localStorage caching
✅ **Error Handling**: Zod validation, retry logic, error boundaries
✅ **Testing**: 15 passing tests with 70%+ coverage on core utilities
✅ **Code Quality**: ESLint, Prettier, TypeScript strict mode

For deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md).

## Project Structure

```
web/src/
├── components/
│   ├── catalog/      # InfiniteCanvas, ItemCard, ItemModal
│   ├── home/         # GuestCloud, GuestCard, GuestModal
│   ├── mottos/       # MottoCloud, MottoModal
│   ├── layout/       # PageTransition, Header, NavbarContext
│   └── shared/       # ModalBackdrop, ModalFooter, ErrorState
├── constants/        # layout.ts, zIndex.ts, colors.ts
├── data/             # types.ts, canvasUtils.ts, useRecommendations.ts
├── hooks/            # useModalKeyboard.ts, useModalNavigation.ts
├── pages/            # HomePage, CatalogPage, LifeMottosPage
└── utils/            # urlValidator.ts
```

## Updating Data

After running the extraction scripts:

```bash
# From project root
cp recommendations.json web/public/recommendations.json

# Then rebuild
cd web
npm run build
```

## Troubleshooting

**Build fails with "Cannot find recommendations.json":**
```bash
npm run copy-data
```

**Tests fail:**
```bash
npm run test -- --run  # Run once instead of watch mode
```

**Slow dev server:**
Clear Vite cache and restart:
```bash
rm -rf node_modules/.vite
npm run dev
```

## Contributing

1. Run quality checks before committing:
   ```bash
   npm run verify
   ```

2. Follow existing patterns:
   - Use shared hooks for cross-cutting concerns
   - Add constants for magic numbers
   - Memoize expensive calculations
   - Add tests for new utilities

3. See [CLAUDE.md](../CLAUDE.md) for code organization best practices.
