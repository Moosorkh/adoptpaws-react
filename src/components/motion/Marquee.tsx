import React, { useRef } from 'react';
import { Box } from '@mui/material';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

interface MarqueeProps {
  text: string;
  repeat?: number;
  /**
   * How far the band travels across the scroll range, as a percentage of the
   * doubled track. 50 completes exactly one seamless loop.
   */
  distance?: number;
}

/**
 * Scroll-driven horizontal text banner.
 *
 * The band has no life of its own — it only moves when the page moves, mapped
 * to the section's travel through the viewport. The mapping is run through a
 * GSAP-style `power3.inOut` curve so the text eases up from rest, accelerates
 * through the middle of the pass, and settles again, rather than tracking
 * scroll linearly. A light spring on top absorbs abrupt scroll jumps so the
 * acceleration reads as momentum instead of a snap.
 */
const Marquee: React.FC<MarqueeProps> = ({ text, repeat = 8, distance = 50 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Progress as the section travels through the viewport, bottom edge to top.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // GSAP `power3.inOut`: eased at both ends, fastest through the middle.
  const power3InOut = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const eased = useTransform(scrollYProgress, (p) => {
    const clamped = Math.min(Math.max(p, 0), 1);
    return power3InOut(clamped) * -distance;
  });

  // Smooths scroll-wheel steps into continuous momentum.
  const smoothed = useSpring(eased, { stiffness: 90, damping: 26, mass: 0.4 });
  const x = useTransform(smoothed, (v) => `${v.toFixed(3)}%`);

  const items = Array.from({ length: repeat }, (_, i) => (
    <Box
      component="span"
      key={i}
      sx={{
        display: 'inline-block',
        px: 3,
        fontSize: { xs: '1.5rem', md: '2.25rem' },
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        color: 'text.primary',
        whiteSpace: 'nowrap',
      }}
    >
      {text} <Box component="span" sx={{ color: 'text.secondary', mx: 2 }}>&bull;</Box>
    </Box>
  ));

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: { xs: 2, md: 3 },
        bgcolor: 'background.default',
      }}
    >
      <motion.div
        style={{
          display: 'flex',
          width: 'fit-content',
          x: shouldReduceMotion ? 0 : x,
          willChange: 'transform',
        }}
      >
        {/* Two identical copies: translating -50% lands copy 2 exactly where
            copy 1 began, so the travel never reveals a seam. */}
        <Box sx={{ display: 'flex' }}>{items}</Box>
        <Box sx={{ display: 'flex' }} aria-hidden="true">{items}</Box>
      </motion.div>
    </Box>
  );
};

export default Marquee;
