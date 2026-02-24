interface ModalFooterProps {
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  buttonStyle?: 'btn-secondary' | 'win-btn';
}

/**
 * Reusable modal footer with navigation controls
 */
export default function ModalFooter({
  onClose,
  onNext,
  onPrevious,
  buttonStyle = 'btn-secondary',
}: ModalFooterProps) {
  return (
    <div
      style={{
        borderTop: '1px solid #EDE7D9',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: '#FAFAF8',
      }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        {onPrevious && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className={buttonStyle}
            aria-label="Previous item"
          >
            ← Prev
          </button>
        )}
        {onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className={buttonStyle}
            aria-label="Next item"
          >
            Next →
          </button>
        )}
      </div>
      <button onClick={onClose} className={buttonStyle}>
        Close
      </button>
    </div>
  );
}
