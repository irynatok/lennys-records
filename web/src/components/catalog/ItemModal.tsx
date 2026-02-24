import { useRef } from 'react';
import { motion } from 'motion/react';
import type { CanvasItem } from '../../data/types';
import { useModalKeyboard } from '../../hooks/useModalKeyboard';
import ModalBackdrop from '../shared/ModalBackdrop';
import ModalFooter from '../shared/ModalFooter';
import { Z_INDEX } from '../../constants/zIndex';
import { MODAL_DIMENSIONS } from '../../constants/modal';

interface ItemModalProps {
  item: CanvasItem;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onGuestClick?: (guestName: string) => void;
}

export default function ItemModal({ item, onClose, onNext, onPrevious, onGuestClick }: ItemModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useModalKeyboard({ onClose, onNext, onPrevious });

  return (
    <>
      <ModalBackdrop onClick={onClose} zIndex={Z_INDEX.ITEM_MODAL_BACKDROP} />

      {/* Modal */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: Z_INDEX.ITEM_MODAL,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: MODAL_DIMENSIONS.MOBILE_PADDING,
        }}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 30, stiffness: 380 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: MODAL_DIMENSIONS.MAX_WIDTH,
            maxHeight: MODAL_DIMENSIONS.MAX_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
            background: '#FEFEFE',
            border: '1px solid #DDD8CF',
            borderRadius: '8px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
            outline: 'none',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dynamic top accent line */}
          <div style={{ height: '3px', background: item.accentColor || '#DF5B24', flexShrink: 0 }} />

          {/* Header */}
          <div
            style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #EDE7D9',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ flex: 1 }}>


              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: '#1A1A1A',
                  lineHeight: 1.2,
                }}
              >
                {item.title}
              </h2>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  color: '#6B6560',
                  marginTop: '4px',
                }}
              >
                {item.count > 1 ? `${item.count} mentions` : '1 mention'}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                color: '#A09890',
                padding: '4px',
                lineHeight: 1,
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'color 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1A1A')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A09890')}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: '20px 24px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Recommended by */}
            {item.recommendedBy.length > 0 && (
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A09890', marginBottom: '6px' }}>
                  Recommended by
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {item.recommendedBy.map((name, i) => (
                    <button
                      key={`${name}-${i}`}
                      onClick={() => onGuestClick?.(name)}
                      style={{
                        background: '#F5F0E8',
                        border: '1px solid #DDD8CF',
                        borderRadius: '4px',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8rem',
                        color: '#1A1A1A',
                        padding: '3px 10px',
                        cursor: onGuestClick ? 'pointer' : 'default',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (onGuestClick) {
                          e.currentTarget.style.background = '#EDE7D9';
                          e.currentTarget.style.borderColor = '#C9C1B3';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F5F0E8';
                        e.currentTarget.style.borderColor = '#DDD8CF';
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Note/why (if available) */}
            {item.why && (
              <div
                style={{
                  background: '#F5F0E8',
                  borderLeft: `3px solid ${item.accentColor || '#DF5B24'}`,
                  borderRadius: '0 4px 4px 0',
                  padding: '12px 16px',
                }}
              >
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#1A1A1A', lineHeight: 1.6, fontStyle: 'italic' }}>
                  {item.why}
                </p>
              </div>
            )}

            {/* Link */}
            {item.itemUrl && (
              <a
                href={item.itemUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: item.accentColor || '#DF5B24',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${item.accentColor || '#DF5B24'}`,
                  paddingBottom: '1px',
                  width: 'fit-content',
                }}
              >
                Check it out ↗
              </a>
            )}
          </div>

          {/* Footer nav */}
          {(onPrevious || onNext) && (
            <ModalFooter
              onClose={onClose}
              onNext={onNext}
              onPrevious={onPrevious}
            />
          )}
        </motion.div>
      </div>
    </>
  );
}
