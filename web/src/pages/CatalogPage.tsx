import { useMemo, useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import ItemModal from '../components/catalog/ItemModal';
import GuestModal from '../components/home/GuestModal';
import InfiniteCanvas from '../components/catalog/InfiniteCanvas';
import PageTransition from '../components/layout/PageTransition';
import EmptyState from '../components/shared/EmptyState';
import ErrorState from '../components/shared/ErrorState';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useRecommendations } from '../data/useRecommendations';
import type { CanvasItem, Episode } from '../data/types';
import { useModalNavigation } from '../hooks/useModalNavigation';
import { generateSearchLayout } from '../data/canvasUtils';
import { useNavbar } from '../components/layout/NavbarContext';
import { TAG_COLORS } from '../constants/colors';

interface CatalogPageProps {
    title: string;
    aggregatorFn: (episodes: Episode[]) => CanvasItem[];
    emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CatalogPage({ title: _title, aggregatorFn, emptyMessage }: CatalogPageProps) {
    const { episodes, loading, error, retry } = useRecommendations();
    const items = useMemo(() => aggregatorFn(episodes), [episodes, aggregatorFn]);
    const { search, setShowSearch, setRandomClick, resetSearch } = useNavbar();
    const [selectedGuest, setSelectedGuest] = useState<Episode | null>(null);
    const [selectedGuestIndex, setSelectedGuestIndex] = useState<number>(0);

    const filteredItems = useMemo(() => {
        if (!search.trim()) return items;

        const q = search.toLowerCase();
        return items.filter(
            (i) =>
                i.title.toLowerCase().includes(q) ||
                i.subtitle?.toLowerCase().includes(q) ||
                i.recommendedBy.some((r) => r.toLowerCase().includes(q))
        );
    }, [items, search]);

    const {
        selectedItem,
        handleItemClick,
        handleRandomPick,
        handleNext,
        handlePrevious,
        handleClose,
    } = useModalNavigation(filteredItems);

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

    // Close guest modal and return to item modal
    const handleGuestClose = useCallback(() => {
        setSelectedGuest(null);
    }, []);

    // Set navbar state on mount and cleanup on unmount
    useEffect(() => {
        resetSearch();
        setShowSearch(true);
        return () => {
            resetSearch();
            setShowSearch(false);
            setRandomClick(undefined);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update random click handler when it changes (separate effect)
    useEffect(() => {
        setRandomClick(handleRandomPick);
    }, [setRandomClick, handleRandomPick]);

    const searchLayout = useMemo(() => {
        if (!search.trim()) return null;
        return generateSearchLayout(filteredItems);
    }, [filteredItems, search]);

    return (
        <PageTransition>
            <div style={{ height: '100%', overflow: 'hidden' }}>
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <ErrorState
                        message="Failed to load recommendations"
                        error={new Error(error)}
                        onRetry={retry}
                    />
                ) : filteredItems.length === 0 ? (
                    <EmptyState message={emptyMessage ?? `No items found.`} />
                ) : (
                    <InfiniteCanvas
                        items={searchLayout ? searchLayout.items : filteredItems}
                        canvasWidth={searchLayout ? searchLayout.canvasWidth : undefined}
                        canvasHeight={searchLayout ? searchLayout.canvasHeight : undefined}
                        onItemClick={handleItemClick}
                    />
                )}
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <ItemModal
                        item={selectedItem}
                        onClose={handleClose}
                        onNext={filteredItems.length > 1 ? handleNext : undefined}
                        onPrevious={filteredItems.length > 1 ? handlePrevious : undefined}
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
