import React, { useRef } from 'react';
import { Box } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';

interface MarqueeProps {
  text: string;
  repeat?: number;
}

/**
 * Scroll-driven horizontal text banner.
 * The text moves forward as you scroll down and backward as you scroll up,
 * tied to the section's position in the viewport.
 */
const Marquee: React.FC<MarqueeProps> = ({ text, repeat = 8 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress as the section travels through the viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress to horizontal translation.
  // Two copies of the items are rendered, so -50% completes one full loop.
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);

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
          x,
        }}
      >
        <Box sx={{ display: 'flex' }}>{items}</Box>
        <Box sx={{ display: 'flex' }} aria-hidden="true">{items}</Box>
      </motion.div>
    </Box>
  );
};

export default Marquee;