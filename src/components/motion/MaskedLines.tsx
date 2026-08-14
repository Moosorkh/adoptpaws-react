import React from 'react';
import { Box } from '@mui/material';
import { motion, Variants } from 'framer-motion';

interface MaskedLinesProps {
  lines: string[];
  delay?: number;
  stagger?: number;
  duration?: number;
  /** Colour of the dim "ghost" copy sitting under each line. */
  ghostColor?: string;
}

const lineVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

/**
 * Line-by-line mask reveal, mirroring produx.design's hero paragraph:
 * each line renders a dim ghost copy (which also establishes layout height)
 * with the bright copy absolutely positioned above it, sliding up into place.
 *
 * As with MaskedWords, the in-view trigger sits on the unclipped container
 * because the animated copies start outside their masks.
 */
const MaskedLines: React.FC<MaskedLinesProps> = ({
  lines,
  delay = 0,
  stagger = 0.1,
  duration = 0.9,
  ghostColor = 'rgba(51, 51, 51, 0.16)',
}) => {
  return (
    <Box
      component={motion.div}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {lines.map((line, i) => (
        <Box
          key={i}
          sx={{
            position: 'relative',
            display: 'block',
            overflow: 'hidden',
            pb: '0.1em',
            mb: '-0.1em',
          }}
        >
          {/* Ghost copy: holds the line's height and shows the unrevealed state. */}
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              display: 'block',
              color: ghostColor,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {line}
          </Box>

          <motion.span
            style={{ position: 'absolute', top: 0, left: 0, display: 'block', width: '100%' }}
            variants={lineVariants}
            transition={{ duration, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </Box>
      ))}
    </Box>
  );
};

export default MaskedLines;
