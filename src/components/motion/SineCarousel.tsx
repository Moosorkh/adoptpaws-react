import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';

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
  /** How tightly the scale falls off either side of the focus, px. */
  focusFalloff?: number;
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
 * point and falls away to a smaller resting size, giving the depth.
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
  peakScale = 1,
  focusFalloff = 420,
  amplitude = 70,
  wavelength = 1400,
  slope = 0.17,
  autoSpeed = 0.35,
  height = 620,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offset = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const items = React.Children.toArray(children);
  const total = items.length * repeat;
  const trackLength = total * spacing;

  const layout = useCallback(() => {
    const half = trackLength / 2;
    for (let i = 0; i < total; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      // Wrap each card's position into a band centred on zero, so cards
      // leaving one end reappear at the other — an endless track.
      let t = i * spacing + offset.current;
      t = ((((t + half) % trackLength) + trackLength) % trackLength) - half;

      const y = Math.sin((t / wavelength) * Math.PI * 2) * amplitude + t * slope;
      const falloff = Math.exp(-(t * t) / (2 * focusFalloff * focusFalloff));
      const scale = baseScale + (peakScale - baseScale) * falloff;

      el.style.transform = `translate3d(${t}px, ${y}px, 0) scale(${scale})`;
      // Nearer cards sit above their neighbours.
      el.style.zIndex = String(Math.round(falloff * 100));
    }
  }, [total, spacing, trackLength, wavelength, amplitude, slope, focusFalloff, baseScale, peakScale]);

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
            marginTop: '-190px',
            willChange: 'transform',
            pointerEvents: 'none',
          }}
        >
          {items[i % items.length]}
        </Box>
      ))}
    </Box>
  );
};

export default SineCarousel;
