import { useEffect } from 'react';

interface UseModalKeyboardProps {
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

/**
 * Custom hook for handling modal keyboard interactions
 * - Escape key closes the modal
 * - Arrow keys navigate between items (if handlers provided)
 * - Body scroll is locked while modal is open
 */
export function useModalKeyboard({ onClose, onNext, onPrevious }: UseModalKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrevious) onPrevious();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onNext, onPrevious]);
}
