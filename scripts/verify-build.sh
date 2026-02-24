#!/bin/bash

# Verification script for production build
# Runs all quality checks before deployment

set -e  # Exit on error

echo "🔍 Running verification checks..."
echo ""

cd "$(dirname "$0")/../web"

# 1. TypeScript compilation
echo "1️⃣  TypeScript compilation..."
npx tsc --noEmit
echo "✅ TypeScript OK"
echo ""

# 2. Linting
echo "2️⃣  ESLint..."
npm run lint
echo "✅ Linting OK"
echo ""

# 3. Format check
echo "3️⃣  Prettier format check..."
npm run format:check
echo "✅ Formatting OK"
echo ""

# 4. Tests
echo "4️⃣  Running tests..."
npm test -- --run
echo "✅ Tests OK"
echo ""

# 5. Build
echo "5️⃣  Production build..."
npm run build
echo "✅ Build OK"
echo ""

# 6. Bundle size check
echo "6️⃣  Bundle size analysis..."
if [ -d "dist" ]; then
  MAIN_JS=$(find dist/assets -name "index-*.js" -type f | head -1)
  if [ -n "$MAIN_JS" ]; then
    SIZE=$(du -h "$MAIN_JS" | cut -f1)
    echo "   Main bundle: $SIZE"
  fi
  echo "✅ Bundle created"
fi
echo ""

echo "🎉 All checks passed! Ready for deployment."
