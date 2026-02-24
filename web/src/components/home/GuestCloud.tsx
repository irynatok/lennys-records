import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Episode } from '../../data/types';
import GuestCard from './GuestCard';

interface GuestCloudProps {
  episodes: Episode[];
  onGuestClick?: (episode: Episode, index: number) => void;
}

export default function GuestCloud({ episodes, onGuestClick }: GuestCloudProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const n = episodes.length;
  const cardW = 380;
  const cardH = 260;
  const scrollPerCard = 150;

  const stackDepthY = 28; // Vertical pixels per folder when stacked
  const stackDepthX = 14; // Horizontal pixels per folder when stacked

  // Wheel scrolling
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      setScrollPos((prev) => prev + e.deltaY * 0.5);
    },
    [],
  );

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const currentIndex = scrollPos / scrollPerCard;

  // Calculate card positions
  const cards = useMemo(() => episodes.map((ep, i) => {
    let progress = ((currentIndex - i) % n + n) % n;
    if (progress > n / 2) progress -= n;

    const stackIndex = -progress;
    let x: number, y: number, zIndex: number, opacity: number, scale: number;

    const pullOutDistance = 140; // Shorter distance so it disappears quickly above the stack

    if (progress >= 1) {
      // Pulled out and fading
      x = 0;
      y = -pullOutDistance - (progress - 1) * 40;
      zIndex = 1000 + i;
      scale = 1;
      opacity = Math.max(0, 1 - (progress - 1) * 3.5); // Completely dark by progress 1.28
    } else if (progress > 0) {
      // Being pulled out - hits opaque *just* slightly out of stack
      x = progress * (-stackDepthX); // move left to center
      y = -progress * pullOutDistance;
      zIndex = 1000 + i;
      scale = 1;
      opacity = 1;
    } else {
      // Stacked in drawer
      x = stackIndex * stackDepthX;
      y = -stackIndex * stackDepthY;
      zIndex = 1000 - i; // lower z-index as it goes back
      scale = 1;
      opacity = stackIndex > 10 ? 0 : 1;
    }

    const absDist = Math.abs(progress);
    if (absDist > n / 2 - 1) opacity = 0;

    return { ep, i, x, y, zIndex, opacity, scale, progress };
  }), [episodes, currentIndex, n]);

  const sortedCards = useMemo(() => [...cards].sort((a, b) => a.zIndex - b.zIndex), [cards]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const visibleCards = sortedCards.filter(card => card.opacity > 0);
    for (let idx = visibleCards.length - 1; idx >= 0; idx--) {
      const card = visibleCards[idx];
      const cardEl = cardRefs.current.get(card.i);
      if (!cardEl) continue;
      const rect = cardEl.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        setHoveredIndex(card.i);
        return;
      }
    }
    setHoveredIndex(null);
  }, [sortedCards]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredIndex !== null) {
      const card = cards.find(c => c.i === hoveredIndex);
      if (card) {
        onGuestClick?.(card.ep, card.i);
      }
    }
  }, [hoveredIndex, cards, onGuestClick]);

  return (
    <>
      {/* Desktop: file drawer */}
      <div className="hidden md:block h-full relative overflow-hidden">
        {/* Scrollable folders container */}
        <div
          ref={containerRef}
          className="absolute inset-0"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            cursor: hoveredIndex !== null ? 'pointer' : 'auto',
          }}
        >
          <div className="absolute top-[50%] left-[45%]" style={{ width: 0, height: 0 }}>
            {sortedCards.map(({ ep, i, x, y, zIndex, opacity, scale }) => (
              <div
                key={ep.filename}
                ref={(el) => {
                  if (el) cardRefs.current.set(i, el);
                  else cardRefs.current.delete(i);
                }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: cardW,
                  height: cardH,
                  marginLeft: -cardW / 2 + 10,
                  marginTop: -60, // offset into the box
                  transform: `translate(${x}px, ${y}px) scale(${scale})`,
                  zIndex,
                  opacity,
                  transition: 'transform 0.1s linear, opacity 0.1s linear',
                  pointerEvents: 'none',
                }}
              >
                <GuestCard
                  episode={ep}
                  index={i}
                  isHovered={hoveredIndex === i}
                  onHover={() => { }}
                  onHoverEnd={() => { }}
                  onClick={() => { }}
                />
              </div>
            ))}
          </div>

          {/* Static drawer container - overlays folders */}
          <div className="absolute top-[50%] left-[45%] pointer-events-none z-[9999]">
            {/* The main box */}
            <div className="relative mt-[100px] ml-[-210px]" style={{ width: '420px', height: '170px' }}>

              {/* 1. Outer Drop Shadow - Ground shadow */}
              <div
                className="absolute top-full left-[-1px] w-[420px] h-[60px] bg-[rgba(0,0,0,0.1)] origin-top-left flex items-start justify-center"
                style={{ transform: 'skewX(-26.6deg)', zIndex: 0 }}
              ></div>

              {/* 2. Box Right Side - Dark Blue */}
              <div
                className="absolute left-[416px] bottom-0 w-[130px] bg-[#35405A] border-y-[4px] border-r-[4px] border-[#1A1A1A] origin-bottom-left"
                style={{ height: '170px', transform: 'skewY(-63.4deg)', zIndex: 9 }}
              ></div>

              {/* 3. Box Front Face */}
              <div className="absolute inset-0 bg-[#FEFEFE] border-[4px] border-[#1A1A1A] flex items-start justify-center pt-8 z-10">
                {/* Handle */}
                <div className="w-[80px] h-[26px] bg-[#1A1A1A] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: scrollable list */}
      <div className="flex flex-col gap-6 md:hidden h-full overflow-y-auto px-4 pb-8 pt-6">
        {episodes.map((ep, i) => (
          <div key={ep.filename} className="shrink-0" style={{ height: 260 }}>
            <GuestCard
              episode={ep}
              index={i}
              isHovered={hoveredIndex === i}
              onHover={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => onGuestClick?.(ep, i)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
