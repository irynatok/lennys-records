import { useRef } from 'react';
import { motion } from 'motion/react';
import type { CanvasItem } from '../../data/types';
import { useModalKeyboard } from '../../hooks/useModalKeyboard';
import ModalBackdrop from '../shared/ModalBackdrop';
import { Z_INDEX } from '../../constants/zIndex';
import { MODAL_DIMENSIONS } from '../../constants/modal';
import ColorfulCloud from './ColorfulCloud';

interface MottoModalProps {
  item: CanvasItem;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onGuestClick?: (guestName: string) => void;
}

export default function MottoModal({ item, onClose, onNext, onPrevious, onGuestClick }: MottoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useModalKeyboard({ onClose, onNext, onPrevious });

  return (
    <>
      <ModalBackdrop onClick={onClose} zIndex={Z_INDEX.MOTTO_MODAL_BACKDROP} blurAmount="6px" />

      {/* Modal */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: Z_INDEX.MOTTO_MODAL,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: MODAL_DIMENSIONS.MOBILE_PADDING,
        }}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'relative',
            maxHeight: MODAL_DIMENSIONS.MAX_HEIGHT,
            outline: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
            {/* Cloud with content inside */}
            <div className="relative" style={{ width: '100%', maxWidth: '800px' }}>
              {/* Cloud background */}
              <div style={{ position: 'relative', filter: 'drop-shadow(0 12px 48px rgba(0,0,0,0.25))' }}>
                <ColorfulCloud
                  accentColor={item.accentColor || '#DF5B24'}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>

              {/* Content positioned absolutely inside cloud */}
              <div
                style={{
                  position: 'absolute',
                  top: '60%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '75%',
                  padding: '20px 50px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* Quote */}
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    color: '#1A1A1A',
                    lineHeight: 1.5,
                    textAlign: 'center',
                  }}
                >
                  "{item.title}"
                </p>

                {/* Guest attribution */}
                {onGuestClick ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGuestClick(item.recommendedBy[0]);
                    }}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      color: '#6B6560',
                      textAlign: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationColor: 'transparent',
                      transition: 'text-decoration-color 0.15s',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecorationColor = '#6B6560';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecorationColor = 'transparent';
                    }}
                  >
                    — {item.recommendedBy[0]}
                  </button>
                ) : (
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      color: '#6B6560',
                      textAlign: 'center',
                    }}
                  >
                    — {item.recommendedBy[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Links and navigation - outside cloud */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
              {/* Substack link */}
              {item.substackUrl && (
                <a
                  href={item.substackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: item.accentColor || '#DF5B24',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    borderBottom: `1px solid ${item.accentColor || '#DF5B24'}`,
                    paddingBottom: '2px',
                  }}
                >
                  Check the episode ↗
                </a>
              )}

              {/* Navigation */}
              {(onPrevious || onNext) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                  }}
                >
                  {onPrevious && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onPrevious(); }}
                      className="btn-secondary"
                      aria-label="Previous motto"
                      style={{
                        padding: '8px 20px',
                        fontSize: '0.875rem',
                      }}
                    >
                      ← Prev
                    </button>
                  )}
                  {onNext && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onNext(); }}
                      className="btn-secondary"
                      aria-label="Next motto"
                      style={{
                        padding: '8px 20px',
                        fontSize: '0.875rem',
                      }}
                    >
                      Next →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
