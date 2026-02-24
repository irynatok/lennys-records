import { motion } from 'motion/react';

interface ModalBackdropProps {
  onClick: () => void;
  zIndex?: number;
  blurAmount?: string;
}

/**
 * Reusable modal backdrop with blur effect
 */
export default function ModalBackdrop({
  onClick,
  zIndex = 60,
  blurAmount = '4px',
}: ModalBackdropProps) {
  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        background: 'rgba(26,26,26,0.5)',
        backdropFilter: `blur(${blurAmount})`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
    />
  );
}
