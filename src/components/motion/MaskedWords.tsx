import React from 'react';
import { Box } from '@mui/material';
import { motion, Variants } from 'framer-motion';

interface MaskedWordsProps {
  /** Each string is rendered as its own line of masked words. */
  lines: string[];
  delay?: number;
  stagger?: number;
  duration?: number;
  /** Justify each line's words (e.g. 'center' for centred headings). */
  justify?: 'flex-start' | 'center' | 'flex-end';
}

const wordVariants: Variants = {
  hidden: { y: '100%', opacity: 0.1 },
  visible: { y: 0, opacity: 1 },
};

/**
 * Word-by-word mask reveal, mirroring produx.design's hero headline:
 * every word sits in an `overflow:hidden` box and slides up from below
 * (translateY(100%) -> 0) with a low starting opacity, staggered per word.
 *
 * The in-view trigger lives on the outer container: the words themselves start
 * translated outside their masks, so they are clipped and would never register
 * as "in view" on their own.
 */
const MaskedWords: React.FC<MaskedWordsProps> = ({
  lines,
  delay = 0,
  stagger = 0.07,
  duration = 0.9,
  justify = 'flex-start',
}) => {
  let wordIndex = 0;

  return (
    <Box
      component={motion.div}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {lines.map((line, li) => (
        <Box key={li} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: justify }}>
          {line.split(' ').map((word, wi) => {
            const i = wordIndex++;
            return (
              <Box
                key={`${li}-${wi}`}
                component="span"
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  overflow: 'hidden',
                  // Keep descenders (g, y, p) from being clipped by the mask.
                  pb: '0.12em',
                  mb: '-0.12em',
                }}
              >
                <motion.span
                  style={{ display: 'block', whiteSpace: 'pre' }}
                  variants={wordVariants}
                  transition={{ duration, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}{' '}
                </motion.span>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default MaskedWords;
