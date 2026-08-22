import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
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

const Banner: React.FC<BannerProps> = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroIsInView = useInView(heroRef, { margin: '-8% 0px -8% 0px' });
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const headlineOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.15]);
  const headlineY = useTransform(scrollYProgress, [0, 0.5], [0, -70]);
  const headlineScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);
  const subtextOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  // Gentle parallax on the hero photo as the hero scrolls away.
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '-14%']);

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
      <Box sx={{ height: { xs: '12vh', md: '20vh' } }} />

      {/* Hero photo — full-bleed, with the title set inside it on the floor
          just below the dog's face. A soft in-palette scrim keeps the
          lettering legible over the mid-tone timber. */}
      <Box
        sx={{
          position: 'relative',
          mx: { xs: -2, md: -6 },
          overflow: 'hidden',
          height: { xs: '52vh', sm: '56vh', md: '62vh' },
        }}
      >
        <Box
          component={motion.div}
          style={{ y: heroImageY }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          sx={{ height: '118%', width: '100%' }}
        >
          <Box
            component={motion.img}
            src="/images/Doggy-banner.jpg"
            alt="A pug resting on a wooden floor"
            animate={
              !reducedMotion && heroIsInView
                ? { scale: [1.015, 1.105], x: ['0%', '-1.4%'], y: ['0%', '1.2%'] }
                : { scale: 1.015, x: '0%', y: '0%' }
            }
            transition={{
              duration: 18,
              ease: 'easeInOut',
              repeat: reducedMotion ? 0 : Infinity,
              repeatType: 'mirror',
            }}
            sx={{
              display: 'block',
              width: '103%',
              height: '103%',
              ml: '-1.5%',
              mt: '-1.5%',
              objectFit: 'cover',
              willChange: reducedMotion ? 'auto' : 'transform',
            }}
          />
        </Box>

        {/* Scrim, tinted with the photo's own espresso rather than black */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(to bottom, rgba(72,48,48,0) 34%, rgba(72,48,48,0.34) 52%, rgba(72,48,48,0.68) 100%)',
          }}
        />

        {/* Title, centred under the dog's face */}
        <Box
          component={motion.div}
          style={{ opacity: headlineOpacity, y: headlineY, scale: headlineScale }}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: { xs: '54%', md: '56%' },
            px: 3,
            textAlign: 'center',
            color: '#EAE5D7',
            fontWeight: 700,
            lineHeight: 1.05,
            fontSize: { xs: '2rem', sm: '3rem', md: '4.25rem' },
            textShadow: '0 2px 24px rgba(48,32,32,0.45)',
          }}
        >
          <Typography component="h1" sx={{ font: 'inherit', color: 'inherit', textTransform: 'none', m: 0 }}>
            <MaskedWords lines={["You feel the bond", "before it's official."]} stagger={0.075} justify="center" />
          </Typography>
        </Box>

        {/* Supporting line, sitting in the darkest corner of the frame */}
        <Box
          component={motion.div}
          style={{ opacity: subtextOpacity }}
          sx={{
            position: 'absolute',
            right: { xs: 16, md: 48 },
            bottom: { xs: 16, md: 32 },
            display: { xs: 'none', sm: 'block' },
            maxWidth: 340,
            color: 'rgba(234, 229, 215, 0.92)',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            textAlign: 'right',
            textShadow: '0 1px 12px rgba(48,32,32,0.6)',
          }}
        >
          <MaskedLines
            delay={0.35}
            ghostColor="rgba(234, 229, 215, 0.22)"
            lines={[
              'AdoptPaws connects loving homes',
              'with pets who need them — every',
              'listing verified, every match personal.',
            ]}
          />
        </Box>
      </Box>

      {/* The controls share the pinned stage with the photos, so the context
          remains visible throughout the mosaic assembly. */}
      <Box>
        <ImageMosaic
          images={MOSAIC_IMAGES}
          header={(
            <Box>
              <RevealText delay={0.35}>
                <Box
                  component={motion.div}
                  whileHover={{ x: 6 }}
                  onClick={() => scrollToSection('products-section')}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    color: 'text.primary',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                  }}
                >
                  <Typography component="span" sx={{ fontWeight: 500 }}>[ VIEW ALL PETS ]</Typography>
                </Box>
              </RevealText>
            </Box>
          )}
        />
      </Box>
    </Box>
  );
};

export default Banner;
