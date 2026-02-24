import { useState } from 'react';
import type { CanvasItem } from '../../data/types';

interface ItemCardProps {
  item: CanvasItem;
  onClick: () => void;
  style?: React.CSSProperties;
}

export default function ItemCard({ item, onClick, style }: ItemCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '280px',
        height: '200px',
        overflow: 'hidden',
        background: '#FEFEFE', // White card background
        border: `1px solid ${hovered ? (item.accentColor || '#DF5B24') : '#DDD8CF'}`,
        borderRadius: '6px',
        boxShadow: hovered
          ? '0 4px 16px rgba(0,0,0,0.10)'
          : '0 1px 3px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.12s',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Prominent Color Accent */}
      <div style={{ height: '6px', width: '100%', background: item.accentColor || '#DF5B24', flexShrink: 0 }} />

      {/* Content wrapper */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px', minHeight: 0 }}>
        {/* Title */}
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#1A1A1A',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.title}
        </h3>

        {/* Subtitle - Guest names */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.78rem',
            color: '#6B6560',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.recommendedBy.join(', ')}
        </p>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '8px',
            borderTop: '1px solid #EDE7D9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.68rem',
              color: '#A09890',
            }}
          >
            {item.count > 1 ? `${item.count} mentions` : '1 mention'}
          </span>
          <span style={{ color: item.accentColor || '#DF5B24', fontSize: '1.05rem', lineHeight: 1, opacity: hovered ? 1 : 0.3, transition: 'opacity 0.15s' }}>
            ↗
          </span>
        </div>
      </div>
    </div>
  );
}
