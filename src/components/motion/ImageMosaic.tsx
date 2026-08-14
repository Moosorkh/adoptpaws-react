import React, { useRef } from 'react';
import { Box } from '@mui/material';
import { motion, useScroll, useTransform, cubicBezier, MotionValue } from 'framer-motion';

interface MosaicImage {
  src: string;
  alt: string;
}

interface ImageMosaicProps {
  images: MosaicImage[];
  /** Tiles per row on desktop. Phones use half this (min 2). */
  columns?: number;
  /** Total scroll track height. The stage stays pinned for track height - 100vh. */
  trackHeight?: string;
}

const EASE = cubicBezier(0.16, 1, 0.3, 1);

// Assembly occupies the middle of the pinned range, leaving a dwell at the
// start (held scattered) and at the end (held assembled) before unpinning.
const ASSEMBLE_START = 0.18;
const ASSEMBLE_END = 0.85;

/**
 * Deterministic pseudo-random scatter per tile, so the "flying in" start state
 * is stable across renders (no Math.random during render).
 */
function scatterFor(index: number) {
  const fract = (n: number) => n - Math.floor(n);
  const rx = fract(Math.sin(index * 12.9898) * 43758.5453);
  const ry = fract(Math.sin(index * 78.233) * 12345.6789);
  const rz = fract(Math.sin(index * 39.425) * 24634.6345);
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
  // Tiles stay visible the whole time — they arrive scattered, they don't fade in.
  const blur = useTransform(progress, [start, end], [5, 0], opts);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div style={{ scale, x, y, z, filter, transformStyle: 'preserve-3d' }}>
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
  columns = 4,
  trackHeight = '260vh',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  // Progress runs 0 -> 1 across the pinned portion of the track: it stays at 0
  // while the block is still scrolling into view, so it arrives scattered.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const colsMobile = Math.max(2, Math.round(columns / 2));
  const rowsMobile = Math.ceil(images.length / colsMobile);
  const rowsDesktop = Math.ceil(images.length / columns);

  // Cap the block so the assembled grid always fits the pinned stage.
  const maxH = 72;
  const maxWidthMobile = `${(maxH * colsMobile) / rowsMobile}vh`;
  const maxWidthDesktop = `${(maxH * columns) / rowsDesktop}vh`;

  return (
    <Box ref={trackRef} sx={{ position: 'relative', height: trackHeight }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: `repeat(${colsMobile}, 1fr)`,
              sm: `repeat(${columns}, 1fr)`,
            },
            gap: 0,
            width: '100%',
            maxWidth: { xs: maxWidthMobile, sm: maxWidthDesktop },
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
