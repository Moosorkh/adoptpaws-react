import React from 'react';
import { Box } from '@mui/material';

interface MarqueeProps {
  text: string;
  speed?: number;
  repeat?: number;
}

/**
 * Infinite horizontal scrolling text banner, used as a section divider.
 */
const Marquee: React.FC<MarqueeProps> = ({ text, speed = 24, repeat = 8 }) => {
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
      <Box
        sx={{
          display: 'flex',
          width: 'fit-content',
          animation: `marquee-scroll ${speed}s linear infinite`,
          '@keyframes marquee-scroll': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' },
          },
        }}
      >
        <Box sx={{ display: 'flex' }}>{items}</Box>
        <Box sx={{ display: 'flex' }} aria-hidden="true">{items}</Box>
      </Box>
    </Box>
  );
};

export default Marquee;
