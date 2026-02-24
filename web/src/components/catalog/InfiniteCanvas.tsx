import { useRef, useEffect, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import ItemCard from './ItemCard';
import type { CanvasItem } from '../../data/types';
import { GRID_LAYOUT } from '../../constants/layout';

export type { CanvasItem };

interface InfiniteCanvasProps {
  items: CanvasItem[];
  groups?: { label: string; x: number; y: number }[];
  canvasWidth?: number;
  canvasHeight?: number;
  initialTransform?: { x: number; y: number; scale: number };
  onTransformChange?: (x: number, y: number, scale: number) => void;
  onItemClick?: (item: CanvasItem, index: number) => void;
}

export default function InfiniteCanvas({
  items,
  groups,
  canvasWidth: propCanvasWidth,
  canvasHeight: propCanvasHeight,
  onItemClick,
  initialTransform,
  onTransformChange,
}: InfiniteCanvasProps) {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);

  const rows = Math.ceil(items.length / GRID_LAYOUT.COLS);
  // Calculate canvas size: cards + gaps between them (not after last one) + margins
  const defaultCanvasWidth = GRID_LAYOUT.COLS * GRID_LAYOUT.CARD_W + (GRID_LAYOUT.COLS - 1) * GRID_LAYOUT.H_GAP + GRID_LAYOUT.MARGIN * 2;
  const defaultCanvasHeight = rows * GRID_LAYOUT.CARD_H + (rows - 1) * GRID_LAYOUT.V_GAP + GRID_LAYOUT.MARGIN * 2;
  const canvasWidth = propCanvasWidth ?? defaultCanvasWidth;
  const canvasHeight = propCanvasHeight ?? defaultCanvasHeight;

  // Calculate minimum scale so canvas edges align with viewport edges
  const getMinScale = useCallback(() => {
    if (!containerRef.current) return GRID_LAYOUT.DEFAULT_SCALE * 0.6;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    // Min scale is when canvas just fits in viewport
    return Math.max(cw / canvasWidth, ch / canvasHeight);
  }, [canvasWidth, canvasHeight]);

  // ── Bounds clamp ─────────────────────────────────────────────────────────────
  const clampPos = useCallback(
    (x: number, y: number, scale: number) => {
      const cw = containerRef.current?.clientWidth ?? 0;
      const ch = containerRef.current?.clientHeight ?? 0;
      const sw = canvasWidth * scale;
      const sh = canvasHeight * scale;

      // Clamp position so canvas edges stay within or at viewport edges
      // Never allow empty space on any side
      const cx = Math.min(0, Math.max(cw - sw, x));
      const cy = Math.min(0, Math.max(ch - sh, y));
      return { cx, cy };
    },
    [canvasWidth, canvasHeight],
  );

  // ── Wheel handler (bubble phase, same as the working version before drag bounds) ──
  // plain scroll → pan, ctrl+scroll → zoom-to-cursor. Both clamped.
  // wheel={{ disabled: false }} on TransformWrapper is kept so the library's
  // scroll registration doesn't interfere; our handler fires on the outer container
  // which is higher in the bubble path, so it runs after the inner library handler.
  // The library handler changes state; our handler then reads updated state and
  // applies the clamped version — net result is correct behaviour.
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!transformRef.current || !containerRef.current) return;
      e.preventDefault();
      const { state, setTransform } = transformRef.current;
      const { positionX, positionY, scale } = state;

      if (e.ctrlKey) {
        const zoomFactor = 1 - e.deltaY * 0.01;
        const minScale = getMinScale();
        const newScale = Math.min(3, Math.max(minScale, scale * zoomFactor));
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate zoom center point
        const rawX = mouseX - ((mouseX - positionX) / scale) * newScale;
        const rawY = mouseY - ((mouseY - positionY) / scale) * newScale;

        // Apply bounds clamping
        const { cx, cy } = clampPos(rawX, rawY, newScale);
        setTransform(cx, cy, newScale, 0);

        // Small timeout to ensure transform is applied before notifying
        requestAnimationFrame(() => {
          onTransformChange?.(cx, cy, newScale);
        });
      } else {
        const { cx, cy } = clampPos(positionX - e.deltaX, positionY - e.deltaY, scale);
        setTransform(cx, cy, scale, 0);
        onTransformChange?.(cx, cy, scale);
      }
    };
    const el = containerRef.current;
    el?.addEventListener('wheel', handleWheel, { passive: false });
    return () => el?.removeEventListener('wheel', handleWheel);
  }, [clampPos, onTransformChange, getMinScale]);

  // ── Centre on load / layout change ─────────────────────────────────────────
  const centreDefault = useCallback(
    (animated = false) => {
      if (!transformRef.current || !containerRef.current) return;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const cx = cw / 2 - (canvasWidth * GRID_LAYOUT.DEFAULT_SCALE) / 2;
      const cy = ch / 2 - (canvasHeight * GRID_LAYOUT.DEFAULT_SCALE) / 2;
      transformRef.current.setTransform(cx, cy, GRID_LAYOUT.DEFAULT_SCALE, animated ? 300 : 0);
      onTransformChange?.(cx, cy, GRID_LAYOUT.DEFAULT_SCALE);
    },
    [canvasWidth, canvasHeight, onTransformChange],
  );

  useEffect(() => {
    setTimeout(() => {
      if (initialTransform) {
        transformRef.current?.setTransform(
          initialTransform.x, initialTransform.y, initialTransform.scale, 0,
        );
      } else {
        centreDefault(false);
      }
      didMount.current = true;
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount to set initial transform
  }, []);

  useEffect(() => {
    if (!didMount.current) return;
    if (!initialTransform) setTimeout(() => centreDefault(true), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only re-center when canvas dimensions change
  }, [canvasWidth, canvasHeight]);

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%', background: '#EDE7D9' }}>
      <TransformWrapper
        ref={transformRef}
        initialScale={GRID_LAYOUT.DEFAULT_SCALE}
        minScale={0.1}
        maxScale={3}
        centerOnInit={false}
        limitToBounds={false}
        panning={{ disabled: false, velocityDisabled: true }}
        wheel={{ disabled: false, step: 0.08 }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: true }}
        onTransformed={(_, state) => {
          onTransformChange?.(state.positionX, state.positionY, state.scale);
        }}
        onPanning={(ref) => {
          // Continuously enforce bounds during drag
          const { positionX, positionY, scale } = ref.state;
          const { cx, cy } = clampPos(positionX, positionY, scale);

          // If we've exceeded bounds, immediately clamp back
          if (cx !== positionX || cy !== positionY) {
            ref.setTransform(cx, cy, scale, 0);
          }
        }}
        onPanningStop={(ref) => {
          // Final bounds check when panning ends
          const { positionX, positionY, scale } = ref.state;
          const { cx, cy } = clampPos(positionX, positionY, scale);

          if (cx !== positionX || cy !== positionY) {
            ref.setTransform(cx, cy, scale, 200);
          }
        }}
        onZoom={(ref) => {
          // Enforce minimum scale and bounds during zoom (pinch or wheel)
          const { positionX, positionY, scale } = ref.state;
          const minScale = getMinScale();
          const clampedScale = Math.max(minScale, scale);
          const { cx, cy } = clampPos(positionX, positionY, clampedScale);

          // If we've exceeded bounds or minimum scale, immediately clamp back
          if (cx !== positionX || cy !== positionY || clampedScale !== scale) {
            ref.setTransform(cx, cy, clampedScale, 0);
          }
        }}
        onZoomStop={(ref) => {
          // Final bounds and scale check when zoom ends
          const { positionX, positionY, scale } = ref.state;
          const minScale = getMinScale();
          const clampedScale = Math.max(minScale, scale);
          const { cx, cy } = clampPos(positionX, positionY, clampedScale);

          // Smooth transition back to bounds if exceeded
          if (cx !== positionX || cy !== positionY || clampedScale !== scale) {
            ref.setTransform(cx, cy, clampedScale, 200);
          }
        }}
      >
        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
          <div style={{ position: 'relative', width: `${canvasWidth}px`, height: `${canvasHeight}px` }}>

            {groups?.map((g) => (
              <div
                key={g.label}
                style={{
                  position: 'absolute', display: 'flex', alignItems: 'flex-end',
                  pointerEvents: 'none', userSelect: 'none',
                  left: g.x, top: g.y, height: 68,
                }}
              >
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
                  fontWeight: 700, color: 'rgba(26,26,26,0.45)', lineHeight: 1, fontSize: 48,
                }}>
                  {g.label}
                </span>
                <div style={{
                  marginLeft: '16px', alignSelf: 'center', height: '1px',
                  background: 'rgba(223,91,36,0.3)', width: 600,
                }} />
              </div>
            ))}

            {items.map((item, index) => (
              <div
                key={item.id}
                className="absolute"
                style={{
                  left: item.x, top: item.y,
                  transition: 'left 0.35s cubic-bezier(0.4,0,0.2,1), top 0.35s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <ItemCard item={item} onClick={() => onItemClick?.(item, index)} />
              </div>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
