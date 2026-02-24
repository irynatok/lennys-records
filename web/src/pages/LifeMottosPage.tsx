import { useMemo, useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import PageTransition from '../components/layout/PageTransition';
import MottoCloud from '../components/mottos/MottoCloud';
import MottoModal from '../components/mottos/MottoModal';
import GuestModal from '../components/home/GuestModal';
import ErrorState from '../components/shared/ErrorState';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useRecommendations } from '../data/useRecommendations';
import type { Episode } from '../data/types';
import { aggregateLifeMottos } from '../data/canvasUtils';
import { useModalNavigation } from '../hooks/useModalNavigation';
import { useNavbar } from '../components/layout/NavbarContext';
import { TAG_COLORS } from '../constants/colors';

export default function LifeMottosPage() {
  const { episodes, loading, error, retry } = useRecommendations();
  const { setShowSearch, setRandomClick } = useNavbar();
  const [selectedGuest, setSelectedGuest] = useState<Episode | null>(null);
  const [selectedGuestIndex, setSelectedGuestIndex] = useState<number>(0);

  const items = useMemo(() => {
    if (!episodes.length) return [];
    return aggregateLifeMottos(episodes);
  }, [episodes]);

  const {
    selectedItem,
    handleItemClick,
    handleRandomPick,
    handleNext,
    handlePrevious,
    handleClose,
  } = useModalNavigation(items);

  // Handle guest name click - find episode by guest name
  const handleGuestClick = useCallback((guestName: string) => {
    const episodeIndex = episodes.findIndex((ep) =>
      ep.guests.some((g) => g.name === guestName)
    );
    if (episodeIndex !== -1) {
      setSelectedGuest(episodes[episodeIndex]);
      setSelectedGuestIndex(episodeIndex);
    }
  }, [episodes]);

  // Close guest modal and return to motto modal
  const handleGuestClose = useCallback(() => {
    setSelectedGuest(null);
  }, []);

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
            message="Failed to load life mottos"
            error={new Error(error)}
            onRetry={retry}
          />
        ) : (
          <MottoCloud
            items={items}
            onItemClick={(item) => handleItemClick(item)}
          />
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <MottoModal
            item={selectedItem}
            onClose={handleClose}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onGuestClick={handleGuestClick}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedGuest && (
          <GuestModal
            episode={selectedGuest}
            accentColor={TAG_COLORS[selectedGuestIndex % TAG_COLORS.length]}
            onClose={handleGuestClose}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
