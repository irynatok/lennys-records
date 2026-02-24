import type { Episode } from '../../data/types';
import { TAG_COLORS } from '../../constants/colors';

interface GuestCardProps {
  episode: Episode;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

export default function GuestCard({ episode, index, isHovered, onHover, onHoverEnd, onClick }: GuestCardProps) {
  const names = episode.guests.map((g) => g.name).join(' & ');
  const tagColor = TAG_COLORS[index % TAG_COLORS.length];
  const lr = episode.lightning_round;

  const bookCount = (lr.books ?? []).length;
  const showCount = (lr.tv_movies ?? []).length;
  const productCount = (lr.products ?? []).length;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-30px)' : 'translateY(0)',
        transition: 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        filter: isHovered ? 'drop-shadow(4px 12px 0px rgba(26,26,26,0.15))' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
    >
      {/* Folder Tab */}
      <div
        style={{
          height: '34px',
          width: '140px',
          background: tagColor,
          border: '2.5px solid #1A1A1A',
          borderBottom: 'none',
          borderRadius: '10px 10px 0 0',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.65rem',
            fontWeight: 800,
            color: '#1A1A1A',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {names}
        </span>
        {/* Invisible patch to hide top border of body under the tab */}
        <div
          style={{
            position: 'absolute',
            bottom: '-2.5px', // Covers the Body's top border
            left: '0px',
            right: '0px',
            height: '3px',
            background: tagColor,
            zIndex: 3,
          }}
        />
      </div>

      {/* Main Folder Body */}
      <div
        style={{
          flex: 1,
          background: tagColor,
          border: '2.5px solid #1A1A1A',
          borderRadius: '0 10px 10px 10px',
          position: 'relative',
          zIndex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Inner white "sheet" for text content */}
        <div
          style={{
            flex: 1,
            background: '#FEFEFE',
            border: '2.5px solid #1A1A1A',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 4,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#1A1A1A',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {names}
            </p>
            {episode.guests[0]?.titles[0] && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  opacity: 0.7,
                  marginTop: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {episode.guests[0].titles[0]}
              </p>
            )}
          </div>

          {/* Stats badges */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            {bookCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F4F5F8', padding: '6px 10px', borderRadius: '4px', border: '1.5px solid #1A1A1A' }}>
                <img src="/book.svg" alt="Books" style={{ width: '18px', height: '18px' }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#1A1A1A' }}>{bookCount}</span>
              </div>
            )}
            {showCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F4F5F8', padding: '6px 10px', borderRadius: '4px', border: '1.5px solid #1A1A1A' }}>
                <img src="/movie.svg" alt="Movies" style={{ width: '18px', height: '18px' }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#1A1A1A' }}>{showCount}</span>
              </div>
            )}
            {productCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F4F5F8', padding: '6px 10px', borderRadius: '4px', border: '1.5px solid #1A1A1A' }}>
                <img src="/product.svg" alt="Products" style={{ width: '18px', height: '18px' }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#1A1A1A' }}>{productCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
