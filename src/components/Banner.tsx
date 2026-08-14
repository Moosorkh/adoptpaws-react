import React, { useRef } from 'react';
import { Box, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import RevealText from './motion/RevealText';
import ImageMosaic from './motion/ImageMosaic';
import MaskedWords from './motion/MaskedWords';
import MaskedLines from './motion/MaskedLines';
import { scrollToSection } from '../utils/helpers';

interface BannerProps {
  title?: string;
}

const MOSAIC_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80', alt: 'Dog' },
  { src: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=80', alt: 'Cat' },
  { src: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80', alt: 'Puppy' },
  { src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80', alt: 'Dog outdoors' },
  { src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80', alt: 'Kitten' },
  { src: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80', alt: 'Dog portrait' },
  { src: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80', alt: 'Cat portrait' },
  { src: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80', alt: 'Dog closeup' },
];

const TAGS = ['ADOPTION', 'FOSTERING', 'RESCUE STORIES', 'COMMUNITY'];

const Banner: React.FC<BannerProps> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const headlineOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.15]);
  const headlineY = useTransform(scrollYProgress, [0, 0.5], [0, -70]);
  const headlineScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);
  const subtextOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <Box
      ref={heroRef}
      sx={{
        position: 'relative',
        bgcolor: 'background.default',
        pt: { xs: 8, md: 10 },
        pb: { xs: 4, md: 6 },
        px: { xs: 2, md: 6 },
      }}
    >
      {/* Clearance for the header wordmark while it is still at hero scale */}
      <Box sx={{ height: { xs: '14vh', md: '24vh' } }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
        <Box
          component={motion.div}
          style={{ opacity: headlineOpacity, y: headlineY, scale: headlineScale }}
          sx={{
            transformOrigin: 'left top',
            maxWidth: 720,
            fontWeight: 700,
            lineHeight: 1.05,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
          }}
        >
          <Typography component="h1" variant={isMobile ? 'h3' : 'h1'} sx={{ font: 'inherit', textTransform: 'none', m: 0 }}>
            <MaskedWords lines={["You feel the bond", "before it's official."]} stagger={0.075} />
          </Typography>
        </Box>

        <Box
          component={motion.div}
          style={{ opacity: subtextOpacity }}
          sx={{
            maxWidth: 340,
            color: 'text.secondary',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            textAlign: 'left',
          }}
        >
          <MaskedLines
            delay={0.35}
            lines={[
              'AdoptPaws connects loving homes',
              'with pets who need them — every',
              'listing verified, every match personal.',
            ]}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mt: 4, mb: 2 }}>
        <RevealText delay={0.25}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                variant="outlined"
                sx={{
                  borderColor: 'divider',
                  color: 'text.secondary',
                  borderRadius: 0,
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                }}
              />
            ))}
          </Box>
        </RevealText>

        <Box
          component={motion.div}
          style={{ opacity: scrollHintOpacity }}
          sx={{
            display: { xs: 'none', md: 'block' },
            color: 'text.secondary',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
        >
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'inline-block' }}
          >
            [ SCROLL DOWN ]
          </motion.span>
        </Box>
      </Box>

      <RevealText delay={0.35}>
        <Box
          component={motion.div}
          whileHover={{ x: 6 }}
          onClick={() => scrollToSection('products-section')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            mt: 2,
            mb: 4,
            cursor: 'pointer',
            color: 'text.primary',
            fontWeight: 500,
            letterSpacing: '0.05em',
          }}
        >
          <Typography component="span" sx={{ fontWeight: 500 }}>[ VIEW ALL PETS ]</Typography>
        </Box>
      </RevealText>

      {/* Scrolls in scattered, pins to the viewport, then assembles on scroll */}
      <Box sx={{ mt: { xs: 4, md: 8 } }}>
        <ImageMosaic images={MOSAIC_IMAGES} />
      </Box>
    </Box>
  );
};

export default Banner;
