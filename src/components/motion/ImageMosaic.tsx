import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { motion, useReducedMotion, useScroll, useTransform, cubicBezier, MotionValue } from 'framer-motion';

interface MosaicImage {
  src: string;
  alt: string;
}

interface ImageMosaicProps {
  images: MosaicImage[];
  /** Content that should remain visible above the tiles while the stage is pinned. */
  header?: React.ReactNode;
  /** Tiles per row on desktop. Phones use half this (min 2). */
  columns?: number;
  /** Desktop scroll track height. Phones retain the shorter 240vh track. */
  trackHeight?: string;
}

const EASE = cubicBezier(0.16, 1, 0.3, 1);

// Assembly occupies the middle of the pinned range, leaving a dwell at the
// start (held scattered) and at the end (held assembled) before unpinning.
// Assembly finishes at the halfway point of the pinned range. The extended
// desktop track gives the completed grid a deliberate hold before the About
// section climbs over it, so the next section does not arrive immediately.
// See the -100vh pull-up on #about-section.
const ASSEMBLE_START = 0.18;
const ASSEMBLE_END = 0.5;

/**
 * Deterministic pseudo-random scatter per tile, so the "flying in" start state
 * is stable across renders (no Math.random during render).
 */
function scatterFor(index: number) {
  const fract = (n: number) => n - Math.floor(n);
  const rx = fract(Math.sin(index * 12.9898) * 43758.5453);
  const ry = fract(Math.sin(index * 78.233) * 12345.6789);
  const rz = fract(Math.sin(index * 39.425) * 24634.6345);

  // The first seed resolves to the extreme top-left corner. Keep that tile
  // scattered, but near the rest of the pets instead of over the controls.
  if (index === 0) {
    return {
      x: -260,
      y: -110,
      z: -300 - rz * 600,
    };
  }

  return {
    x: (rx - 0.5) * 1150,
    y: (ry - 0.5) * 640,
    z: -300 - rz * 600,
  };
}

interface TileProps {
  image: MosaicImage;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

const Tile: React.FC<TileProps> = ({ image, index, total, progress }) => {
  const s = scatterFor(index);

  // Each tile converges over its own slice of the assembly window, so they
  // cascade into place rather than snapping together at once.
  const span = ASSEMBLE_END - ASSEMBLE_START;
  const start = ASSEMBLE_START + (index / total) * span * 0.3;
  const end = start + span * 0.7;
  const opts = { clamp: true, ease: EASE };

  const scale = useTransform(progress, [start, end], [0.35, 1], opts);
  const x = useTransform(progress, [start, end], [s.x, 0], opts);
  const y = useTransform(progress, [start, end], [s.y, 0], opts);
  const z = useTransform(progress, [start, end], [s.z, 0], opts);

  return (
    <motion.div style={{ scale, x, y, z, transformStyle: 'preserve-3d' }}>
      <Box
        component="img"
        src={image.src}
        alt={image.alt}
        sx={{ display: 'block', width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' }}
      />
    </motion.div>
  );
};

/**
 * Pet photos that scroll into view scattered, hold while the section pins to
 * the viewport, then fly in from depth and assemble into a single seamless
 * tiled block as you keep scrolling — mirroring produx.design's pinned hero
 * mosaic. Fully scrubbed, so it comes apart again on the way back up.
 */
const ImageMosaic: React.FC<ImageMosaicProps> = ({
  images,
  header,
  columns = 4,
  trackHeight = '340vh',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    const video = videoRef.current;
    if (!track || !video) return;

    let sectionIsVisible = false;

    const syncPlayback = () => {
      if (sectionIsVisible && !document.hidden) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    if (!('IntersectionObserver' in window)) {
      sectionIsVisible = true;
      syncPlayback();
      return () => video.pause();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionIsVisible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.01 },
    );

    observer.observe(track);
    document.addEventListener('visibilitychange', syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
    };
  }, []);

  // Progress runs 0 -> 1 across the pinned portion of the track: it stays at 0
  // while the block is still scrolling into view, so it arrives scattered.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.025]);

  const colsMobile = Math.max(2, Math.round(columns / 2));
  const rowsMobile = Math.ceil(images.length / colsMobile);
  const rowsDesktop = Math.ceil(images.length / columns);

  // Cap the block so the assembled grid always fits the pinned stage.
  const maxH = 72;
  const maxWidthMobile = `${(maxH * colsMobile) / rowsMobile}vh`;
  const maxWidthDesktop = `${(maxH * columns) / rowsDesktop}vh`;

  return (
    <Box
      ref={trackRef}
      sx={{
        position: 'relative',
        // Keep phones concise; desktop gets an extra scroll dwell after the
        // tiles finish assembling before the next section starts pulling up.
        height: { xs: '240vh', md: trackHeight },
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          width: { xs: 'calc(100% + 32px)', md: 'calc(100% + 96px)' },
          ml: { xs: -2, md: -6 },
          height: '100svh',
          boxSizing: 'border-box',
          pt: { xs: 9, md: 11 },
          pb: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        <Box
          component={motion.video}
          ref={videoRef}
          src="/images/HIW-video.mp4"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          style={reducedMotion ? undefined : { y: videoY, scale: videoScale }}
          sx={{
            position: 'absolute',
            zIndex: 0,
            top: '-5%',
            left: 0,
            width: '100%',
            height: '110%',
            objectFit: 'cover',
            pointerEvents: 'none',
            willChange: reducedMotion ? 'auto' : 'transform',
          }}
        />

        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            zIndex: 1,
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(to bottom, rgba(234,229,215,0.7) 0%, rgba(234,229,215,0.58) 45%, rgba(234,229,215,0.68) 100%)',
          }}
        />

        {header && (
          <Box
            sx={{
              width: '100%',
              flex: '0 0 auto',
              position: 'relative',
              zIndex: 3,
              px: { xs: 2, md: 6 },
              boxSizing: 'border-box',
            }}
          >
            {header}
          </Box>
        )}

        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: {
              xs: `repeat(${colsMobile}, 1fr)`,
              sm: `repeat(${columns}, 1fr)`,
            },
            gap: 0,
            width: '100%',
            maxWidth: { xs: maxWidthMobile, sm: maxWidthDesktop },
            my: 'auto',
            perspective: '1200px',
          }}
        >
          {images.map((img, i) => (
            <Tile
              key={img.src}
              image={img}
              index={i}
              total={images.length}
              progress={scrollYProgress}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ImageMosaic;
