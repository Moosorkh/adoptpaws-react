import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface SineCarouselProps {
  /** Rendered repeatedly along the track. */
  children: React.ReactNode[];
  /** Times to repeat the set so the track always fills the viewport. */
  repeat?: number;
  /** Distance between card centres along the track, px. */
  spacing?: number;
  /** Scale of a card at rest, away from the focal point. */
  baseScale?: number;
  /** Scale of a card at the focal point. */
  peakScale?: number;
  /** Amplitude of the vertical sine, px. */
  amplitude?: number;
  /** Wavelength of the vertical sine, px. */
  wavelength?: number;
  /** Downward drift across the track — this is what makes it read diagonal. */
  slope?: number;
  /** Idle drift speed, px per frame. Keeps it running so it never finishes. */
  autoSpeed?: number;
  height?: number;
}

/**
 * Draggable, endlessly-wrapping card reel in the manner of creativecue.co's
 * hero (their component is literally named SineCarousel).
 *
 * Cards sit at even intervals along a horizontal track. Each one's vertical
 * position follows a sine wave layered on a constant slope — that combination
 * is what produces the diagonal cascade — while its scale peaks at a focal
 * point. Only that single selected card grows; every other card stays at the
 * same resting scale.
 *
 * Grab and fling it and the track keeps travelling under friction, slot-machine
 * style; left alone it drifts slowly so the motion never stops. Transforms are
 * written straight to the DOM inside a rAF loop rather than through React state,
 * because this updates every frame for every card.
 */
const SineCarousel: React.FC<SineCarouselProps> = ({
  children,
  repeat = 6,
  spacing = 150,
  baseScale = 0.62,
  peakScale = 1.2,
  amplitude = 70,
  wavelength = 1400,
  slope = 0.17,
  autoSpeed = 0.35,
  height = 680,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offset = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const selectedRef = useRef(0);
  const [selectedCard, setSelectedCard] = useState(0);

  const items = React.Children.toArray(children);
  const total = items.length * repeat;
  const trackLength = total * spacing;

  const layout = useCallback(() => {
    const half = trackLength / 2;
    const positions: Array<{ t: number; y: number }> = [];
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < total; i++) {
      // Wrap each card's position into a band centred on zero, so cards
      // leaving one end reappear at the other — an endless track.
      let t = i * spacing + offset.current;
      t = ((((t + half) % trackLength) + trackLength) % trackLength) - half;

      const y = Math.sin((t / wavelength) * Math.PI * 2) * amplitude + t * slope;
      positions[i] = { t, y };

      const distance = Math.abs(t);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    for (let i = 0; i < total; i++) {
      const el = cardRefs.current[i];
      const position = positions[i];
      if (!el || !position) continue;

      // Position and selection animation live on separate layers, preventing
      // the per-frame track transform from overriding Framer Motion's spring.
      el.style.transform = `translate3d(${position.t}px, ${position.y}px, 0)`;
      el.style.zIndex = i === closestIndex ? '1000' : '1';
    }

    if (selectedRef.current !== closestIndex) {
      selectedRef.current = closestIndex;
      setSelectedCard(closestIndex);
    }
  }, [total, spacing, trackLength, wavelength, amplitude, slope]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      if (!dragging.current) {
        if (Math.abs(velocity.current) > 0.05) {
          // Fling: coast to a stop under friction.
          offset.current += velocity.current;
          velocity.current *= 0.95;
        } else {
          velocity.current = 0;
          offset.current += autoSpeed;
        }
      }
      layout();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [layout, autoSpeed]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    velocity.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    offset.current += dx;
    // Smooth the velocity so a jittery drag doesn't fling erratically.
    velocity.current = velocity.current * 0.6 + dx * 0.4;
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  return (
    <Box
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      // Without this the browser starts a native image drag mid-grab, which
      // cancels our pointer stream and leaves the reel stuck.
      onDragStart={(e) => e.preventDefault()}
      sx={{
        position: 'relative',
        height,
        width: '100%',
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'pan-y',
        userSelect: 'none',
        '&:active': { cursor: 'grabbing' },
        '& img': { pointerEvents: 'none', WebkitUserDrag: 'none' },
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          ref={(el: HTMLDivElement | null) => {
            cardRefs.current[i] = el;
          }}
          aria-hidden={i >= items.length}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: '-160px',
            willChange: 'transform',
            pointerEvents: 'none',
          }}
        >
          {/* This static layer centres each card by its own natural height,
              allowing mixed-height cards without relying on a fixed offset. */}
          <Box sx={{ transform: 'translateY(-50%)' }}>
            <Box
              component={motion.div}
              initial={{ scale: baseScale, y: 0, rotate: 0 }}
              animate={selectedCard === i
                ? {
                    scale: peakScale,
                    y: -28,
                    rotate: -1,
                    filter: 'drop-shadow(0 18px 24px rgba(72, 48, 48, 0.22))',
                  }
                : {
                    scale: baseScale,
                    y: 0,
                    rotate: 0,
                    filter: 'drop-shadow(0 0 0 rgba(72, 48, 48, 0))',
                  }}
              transition={{
                type: 'spring',
                stiffness: 170,
                damping: 11,
                mass: 0.8,
              }}
              sx={{ transformOrigin: 'center center' }}
            >
              {items[i % items.length]}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SineCarousel;
