import { useEffect, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import PageTransition from '../components/layout/PageTransition';
import GuestCloud from '../components/home/GuestCloud';
import GuestModal from '../components/home/GuestModal';
import ErrorState from '../components/shared/ErrorState';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useRecommendations } from '../data/useRecommendations';
import { TAG_COLORS } from '../constants/colors';
import { useModalNavigation } from '../hooks/useModalNavigation';
import { useNavbar } from '../components/layout/NavbarContext';
import type { Episode } from '../data/types';

/**
 * Check if an episode has meaningful lightning round data
 */
function hasLightningRound(episode: Episode): boolean {
  const lr = episode.lightning_round;
  if (!lr) return false;

  // Check if any section has content
  return (
    (lr.books && lr.books.length > 0) ||
    (lr.tv_movies && lr.tv_movies.length > 0) ||
    (lr.products && lr.products.length > 0) ||
    !!lr.life_motto ||
    !!lr.interview_question ||
    !!lr.productivity_tip
  );
}

export default function HomePage() {
  const { episodes: allEpisodes, loading, error, retry } = useRecommendations();
  const { setShowSearch, setRandomClick } = useNavbar();

  // Filter out episodes without lightning round data (e.g., compilations)
  const episodes = useMemo(
    () => allEpisodes.filter(hasLightningRound),
    [allEpisodes]
  );
  const {
    selectedItem: selectedGuest,
    currentIndex,
    handleItemClick,
    handleRandomPick,
    handleNext,
    handlePrevious,
    handleClose,
  } = useModalNavigation(episodes);

  // Set navbar state on mount and cleanup on unmount
  useEffect(() => {
    setShowSearch(false);
    setRandomClick(handleRandomPick);
    return () => {
      setRandomClick(undefined);
    };
  }, [setShowSearch, setRandomClick, handleRandomPick]);

  return (
    <PageTransition>
      <div style={{ height: '100%', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState
            message="Failed to load guests"
            error={new Error(error)}
            onRetry={retry}
          />
        ) : (
          <GuestCloud
            episodes={episodes}
            onGuestClick={(episode) => handleItemClick(episode)}
          />
        )}
      </div>

      <AnimatePresence>
        {selectedGuest && (
          <GuestModal
            episode={selectedGuest}
            accentColor={TAG_COLORS[currentIndex % TAG_COLORS.length]}
            onClose={handleClose}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
