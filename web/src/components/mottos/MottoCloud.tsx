import { useState, useEffect, useCallback, useRef } from 'react';
import type { CanvasItem } from '../../data/types';
import ColorfulCloud from './ColorfulCloud';

interface MottoCloudProps {
  items: CanvasItem[];
  onItemClick?: (item: CanvasItem, index: number) => void;
}

export default function MottoCloud({ items, onItemClick }: MottoCloudProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollPerItem = 180; // Distance scrolled per motto (increased spacing)
  const totalScrollHeight = items.length * scrollPerItem;

  // Wheel scrolling
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      setScrollPos((prev) => {
        const newPos = prev + e.deltaY * 0.5;
        return Math.max(0, Math.min(totalScrollHeight, newPos));
      });
    },
    [totalScrollHeight],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Static decorative clouds with colors
  const decorativeColors = ['#B088F9', '#69C0A5', '#F9887A', '#FFC247', '#FF8C6B'];
  const decorativeClouds = [
    { x: '10%', y: '15%', size: 'small' as const, opacity: 0.3, color: decorativeColors[0] },
    { x: '85%', y: '25%', size: 'medium' as const, opacity: 0.25, color: decorativeColors[1] },
    { x: '15%', y: '65%', size: 'small' as const, opacity: 0.2, color: decorativeColors[2] },
    { x: '75%', y: '70%', size: 'medium' as const, opacity: 0.3, color: decorativeColors[3] },
    { x: '50%', y: '85%', size: 'small' as const, opacity: 0.25, color: decorativeColors[4] },
  ];

  return (
    <>
      {/* Desktop: scrollable clouds */}
      <div className="hidden md:block h-full relative overflow-hidden" style={{ background: '#EDE7D9' }}>
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{
            cursor: hoveredIndex !== null ? 'pointer' : 'auto',
          }}
        >
          {/* Static decorative clouds */}
          {decorativeClouds.map((cloud, idx) => (
            <div
              key={`deco-${idx}`}
              className="absolute pointer-events-none"
              style={{ left: cloud.x, top: cloud.y, opacity: cloud.opacity }}
            >
              <ColorfulCloud
                accentColor={cloud.color}
                style={{
                  width: cloud.size === 'small' ? '100px' : '150px',
                  height: 'auto',
                }}
              />
            </div>
          ))}

          {/* Scrollable motto clouds */}
          {items.map((item, i) => {
            const progress = scrollPos / scrollPerItem;
            const relativePos = i - progress;

            // Determine which line (left or right)
            const isRightLine = i % 2 === 0;

            // Calculate position along diagonal path
            // Path goes from top corners to center bottom
            const pathProgress = Math.max(0, Math.min(1, (relativePos + 2) / 6));

            let x: number, y: number, opacity: number, scale: number;

            if (relativePos < -2) {
              // Already scrolled past (above viewport)
              opacity = 0;
              y = -200;
              x = isRightLine ? window.innerWidth * 0.7 : window.innerWidth * 0.3;
              scale = 0.8;
            } else if (relativePos > 6) {
              // Not yet visible (below viewport)
              opacity = 0;
              y = window.innerHeight + 200;
              x = window.innerWidth * 0.5;
              scale = 0.8;
            } else {
              // Visible - move along diagonal path
              const startY = 100;
              const endY = window.innerHeight - 150;
              y = startY + (endY - startY) * pathProgress;

              if (isRightLine) {
                // Right line: from top-right to center-bottom
                const startX = window.innerWidth * 0.75;
                const endX = window.innerWidth * 0.5;
                x = startX + (endX - startX) * pathProgress;
              } else {
                // Left line: from top-left to center-bottom
                const startX = window.innerWidth * 0.25;
                const endX = window.innerWidth * 0.5;
                x = startX + (endX - startX) * pathProgress;
              }

              // Fade in/out at edges
              if (relativePos < 0) {
                opacity = Math.max(0, 1 + relativePos * 0.5);
              } else if (relativePos > 5) {
                opacity = Math.max(0, 1 - (relativePos - 5) * 0.5);
              } else {
                opacity = 1;
              }

              // Scale up as it reaches center
              scale = 0.8 + Math.sin(pathProgress * Math.PI) * 0.4;
            }

            return (
              <div
                key={item.id}
                className="absolute transition-all duration-100 ease-linear"
                style={{
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  opacity,
                  zIndex: Math.floor((1 - pathProgress) * 50), // Max z-index of 50 to stay behind modal
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  if (opacity > 0.5) {
                    onItemClick?.(item, i);
                  }
                }}
              >
                {/* Cloud background */}
                <div className="relative" style={{ width: '400px' }}>
                  <div
                    style={{
                      position: 'relative',
                      filter: hoveredIndex === i ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
                    }}
                  >
                    <ColorfulCloud
                      accentColor={item.accentColor || '#DF5B24'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </div>

                  {/* Motto text - positioned absolutely over cloud */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '55%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '75%',
                      padding: '10px 50px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontStyle: 'italic',
                        fontSize: '0.8rem',
                        fontWeight: 400,
                        color: '#1A1A1A',
                        lineHeight: 1.5,
                        textAlign: 'center',
                        transition: 'transform 0.15s',
                        transform: hoveredIndex === i ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      "{item.title.length > 70 ? item.title.substring(0, 70) + '...' : item.title}"
                    </p>

                    {/* Guest attribution */}
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.65rem',
                        color: '#6B6560',
                        textAlign: 'center',
                        opacity: hoveredIndex === i ? 1 : 0.7,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      — {item.recommendedBy[0]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Scroll indicator */}
          <div
            className="absolute bottom-8 left-1/2"
            style={{
              transform: 'translateX(-50%)',
              opacity: scrollPos < 100 ? 0.6 : 0,
              transition: 'opacity 0.3s',
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                color: '#6B6560',
                textAlign: 'center',
              }}
            >
              Scroll to explore ↓
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: scrollable list */}
      <div className="flex flex-col gap-8 md:hidden h-full overflow-y-auto px-4 pb-8 pt-6" style={{ background: '#EDE7D9' }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            className="shrink-0 flex justify-center"
            onClick={() => onItemClick?.(item, i)}
          >
            <div className="relative" style={{ width: '100%', maxWidth: '400px' }}>
              <ColorfulCloud
                accentColor={item.accentColor || '#DF5B24'}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '55%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '75%',
                  padding: '10px 50px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: '0.8rem',
                    fontWeight: 400,
                    color: '#1A1A1A',
                    lineHeight: 1.5,
                    textAlign: 'center',
                  }}
                >
                  "{item.title.length > 70 ? item.title.substring(0, 70) + '...' : item.title}"
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.65rem',
                    color: '#6B6560',
                  }}
                >
                  — {item.recommendedBy[0]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
