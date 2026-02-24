import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import { NavbarProvider } from './components/layout/NavbarContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import RouteLoadingFallback from './components/shared/RouteLoadingFallback';

// Lazy load all route components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const BooksPage = lazy(() => import('./pages/BooksPage'));
const MoviesPage = lazy(() => import('./pages/MoviesPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const LifeMottosPage = lazy(() => import('./pages/LifeMottosPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

export default function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <NavbarProvider>
        <div
          style={{
            height: '100vh',
            overflow: 'hidden',
            background: '#F5F0E8',
          }}
        >
          <Navbar />
          <main
            style={{
              position: 'relative',
              zIndex: 10,
              height: '100%',
              paddingTop: '52px',
            }}
          >
            <Suspense fallback={<RouteLoadingFallback />}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/life-mottos" element={<LifeMottosPage />} />
                  <Route path="/about" element={<AboutPage />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </main>
        </div>
      </NavbarProvider>
    </ErrorBoundary>
  );
}
