import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal navigation state across pages
 * Consolidates duplicate logic for selectedItem, currentIndex, and navigation handlers
 */
export function useModalNavigation<T>(items: T[]) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleItemClick = useCallback(
    (item: T) => {
      const idx = items.indexOf(item);
      setCurrentIndex(idx >= 0 ? idx : 0);
      setSelectedItem(item);
    },
    [items]
  );

  const handleRandomPick = useCallback(() => {
    if (items.length > 0) {
      const randomIndex = Math.floor(Math.random() * items.length);
      setCurrentIndex(randomIndex);
      setSelectedItem(items[randomIndex]);
    }
  }, [items]);

  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    const nextIndex = (currentIndex + 1) % items.length;
    setCurrentIndex(nextIndex);
    setSelectedItem(items[nextIndex]);
  }, [currentIndex, items]);

  const handlePrevious = useCallback(() => {
    if (items.length === 0) return;
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setCurrentIndex(prevIndex);
    setSelectedItem(items[prevIndex]);
  }, [currentIndex, items]);

  const handleClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return {
    selectedItem,
    currentIndex,
    handleItemClick,
    handleRandomPick,
    handleNext,
    handlePrevious,
    handleClose,
  };
}
