import React, { useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
  AssignmentTurnedInOutlined,
  GroupsOutlined,
  HomeOutlined,
  PetsOutlined,
} from '@mui/icons-material';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { scrollToSection } from '../utils/helpers';

const steps = [
  {
    number: '01',
    title: 'Choose your pet',
    description: 'Meet our available pets and find the companion who feels right for your home.',
    icon: <PetsOutlined />,
    visualColor: '#BFD4D2',
  },
  {
    number: '02',
    title: 'Submit a request',
    description: 'Tell us a little about yourself, your household, and the life you can offer.',
    icon: <AssignmentTurnedInOutlined />,
    visualColor: '#D8D2DC',
  },
  {
    number: '03',
    title: 'Meet and greet',
    description: 'Spend time together with support from our team and make sure the match clicks.',
    icon: <GroupsOutlined />,
    visualColor: '#D4DED1',
  },
  {
    number: '04',
    title: 'Welcome them home',
    description: 'Complete the adoption and begin your new chapter with ongoing support from us.',
    icon: <HomeOutlined />,
    visualColor: '#E2D0C8',
  },
] as const;

const settledRotations = [-3.2, 0.8, 2.4, -1.2] as const;
const settledOffsets = ['0vw', '19vw', '38vw', '57vw'] as const;
const entryRanges = [
  [0, 0.01],
  [0.16, 0.34],
  [0.39, 0.57],
  [0.62, 0.8],
] as const;

interface ProcessCardProps {
  active: boolean;
  index: number;
  progress: MotionValue<number>;
  reducedMotion: boolean | null;
  revealed: boolean;
  step: (typeof steps)[number];
}

const ProcessCard: React.FC<ProcessCardProps> = ({
  active,
  index,
  progress,
  reducedMotion,
  revealed,
  step,
}) => {
  const [start, end] = entryRanges[index];
  const settledX = settledOffsets[index];
  const settledY = `${index * 2.7}vh`;
  const x = useTransform(progress, [start, end], [settledX, settledX]);
  const y = useTransform(progress, [start, end], index === 0 ? ['0vh', '0vh'] : ['102vh', settledY]);
  const rotate = useTransform(progress, [start, end], [index === 0 ? settledRotations[index] : 9, settledRotations[index]]);
  const scale = useTransform(progress, [start, end], [index === 0 ? 1 : 0.92, 1]);

  return (
    <Box
      component={motion.article}
      aria-current={active ? 'step' : undefined}
      aria-label={`Step ${step.number}: ${step.title}`}
      aria-hidden={!reducedMotion && !revealed ? true : undefined}
      style={reducedMotion ? {
        x: settledX,
        y: settledY,
        rotate: settledRotations[index],
        scale: 1,
      } : { x, y, rotate, scale }}
      sx={{
        position: 'absolute',
        left: { xs: '5%', md: '3%' },
        top: { xs: '25%', md: '7%' },
        zIndex: 4 + index,
        width: { xs: '84vw', sm: '58vw', md: 'min(31vw, 440px)' },
        height: { xs: 'min(61vh, 560px)', md: 'min(72vh, 650px)' },
        minHeight: { xs: 410, md: 470 },
        bgcolor: '#F8F6EF',
        border: '1px solid rgba(72, 48, 48, 0.16)',
        boxShadow: active
          ? '0 22px 55px rgba(72, 48, 48, 0.2)'
          : '0 14px 34px rgba(72, 48, 48, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        transition: 'box-shadow 0.3s ease',
        '@media (max-height: 700px)': {
          top: '3%',
          width: { xs: '76vw', md: 'min(31vw, 380px)' },
          height: 'min(74vh, 440px)',
          minHeight: 360,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -15,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 1.5,
          py: 0.55,
          bgcolor: active ? '#96BBBB' : '#EAE5D7',
          color: '#3E4E50',
          borderRadius: '10px 10px 0 0',
          fontFamily: 'monospace',
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          transition: 'background-color 0.3s ease',
        }}
      >
        Process
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          p: { xs: 2.5, md: 3.5 },
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          '@media (max-height: 700px)': { p: 2.25 },
        }}
      >
        <Typography
          component="h3"
          sx={{
            color: 'text.primary',
            fontSize: { xs: 'clamp(2rem, 8vw, 3.2rem)', md: 'clamp(2.5rem, 3.7vw, 4rem)' },
            fontWeight: 700,
            letterSpacing: '-0.07em',
            lineHeight: 0.88,
            textTransform: 'uppercase',
            '@media (max-height: 700px)': { fontSize: 'clamp(1.8rem, 3.3vw, 2.7rem)' },
          }}
        >
          {step.title}
        </Typography>

        <Typography
          sx={{
            mt: 'auto',
            color: 'text.primary',
            fontSize: { xs: '2.65rem', md: '3.4rem' },
            fontWeight: 700,
            letterSpacing: '-0.06em',
            lineHeight: 1,
          }}
        >
          {step.number}.
        </Typography>
        <Typography
          sx={{
            maxWidth: 380,
            mx: 'auto',
            mt: 1.25,
            color: 'text.secondary',
            fontSize: { xs: '0.84rem', md: '0.92rem' },
            fontWeight: 500,
            lineHeight: 1.45,
            '@media (max-height: 700px)': { fontSize: '0.875rem', mt: 0.75 },
          }}
        >
          {step.description}
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          flex: '0 0 40%',
          minHeight: 150,
          overflow: 'hidden',
          bgcolor: step.visualColor,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box
          component="img"
          src={index % 2 === 0 ? '/images/paw.svg' : '/images/bone-flipped.svg'}
          alt=""
          aria-hidden="true"
          sx={{
            position: 'absolute',
            width: '72%',
            maxWidth: 300,
            opacity: 0.18,
            transform: `rotate(${index % 2 === 0 ? -15 : 12}deg)`,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            placeItems: 'center',
            width: { xs: 104, md: 130 },
            height: { xs: 104, md: 130 },
            borderRadius: '50%',
            bgcolor: 'rgba(248, 246, 239, 0.9)',
            color: '#3E4E50',
            border: '1px solid rgba(72, 48, 48, 0.12)',
            '& svg': { fontSize: { xs: 58, md: 72 } },
            '@media (max-height: 700px)': {
              width: 88,
              height: 88,
              '& svg': { fontSize: 52 },
            },
          }}
        >
          {step.icon}
        </Box>
      </Box>
    </Box>
  );
};

const MobileProcessCard: React.FC<{ index: number; step: (typeof steps)[number] }> = ({
  index,
  step,
}) => (
  <Box
    component="article"
    aria-label={`Step ${step.number}: ${step.title}`}
    sx={{
      position: 'relative',
      flex: '0 0 84vw',
      minHeight: 510,
      bgcolor: '#F8F6EF',
      border: '1px solid rgba(72, 48, 48, 0.16)',
      boxShadow: '0 16px 34px rgba(72, 48, 48, 0.13)',
      scrollSnapAlign: 'center',
      transform: `rotate(${[-1.4, 0.8, -0.6, 1.2][index]}deg)`,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: -14,
        left: '50%',
        transform: 'translateX(-50%)',
        px: 1.35,
        py: 0.5,
        bgcolor: '#96BBBB',
        color: '#3E4E50',
        borderRadius: '9px 9px 0 0',
        fontFamily: 'monospace',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}
    >
      Process
    </Box>

    <Box sx={{ flex: 1, p: 3, pt: 4, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
      <Typography
        component="h3"
        sx={{
          color: 'text.primary',
          fontSize: 'clamp(2.35rem, 11vw, 3.35rem)',
          fontWeight: 700,
          letterSpacing: '-0.07em',
          lineHeight: 0.88,
          textTransform: 'uppercase',
        }}
      >
        {step.title}
      </Typography>
      <Typography
        sx={{
          mt: 'auto',
          color: 'text.primary',
          fontSize: '3rem',
          fontWeight: 700,
          letterSpacing: '-0.06em',
          lineHeight: 1,
        }}
      >
        {step.number}.
      </Typography>
      <Typography sx={{ mt: 1.25, color: 'text.secondary', fontSize: '0.92rem', lineHeight: 1.5 }}>
        {step.description}
      </Typography>
    </Box>

    <Box
      sx={{
        position: 'relative',
        height: 205,
        overflow: 'hidden',
        bgcolor: step.visualColor,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box
        component="img"
        src={index % 2 === 0 ? '/images/paw.svg' : '/images/bone-flipped.svg'}
        alt=""
        aria-hidden="true"
        sx={{ position: 'absolute', width: '76%', opacity: 0.16, transform: `rotate(${index % 2 ? 12 : -15}deg)` }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          placeItems: 'center',
          width: 112,
          height: 112,
          borderRadius: '50%',
          bgcolor: 'rgba(248, 246, 239, 0.92)',
          color: '#3E4E50',
          border: '1px solid rgba(72, 48, 48, 0.12)',
          '& svg': { fontSize: 62 },
        }}
      >
        {step.icon}
      </Box>
    </Box>
  </Box>
);

const HowAdoptionWorks: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const blobRotate = useTransform(scrollYProgress, [0, 1], [-7, 7]);
  const titleX = useTransform(scrollYProgress, [0, 1], ['0vw', '-3vw']);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (reducedMotion) return;
    const nextStep = Math.min(steps.length - 1, Math.floor(progress * steps.length));
    setActiveStep((current) => current === nextStep ? current : nextStep);
  });

  const displayedStep = reducedMotion ? steps.length - 1 : activeStep;

  return (
    <Box
      ref={trackRef}
      component="section"
      aria-label="How adoption works"
      sx={{
        position: 'relative',
        height: { xs: 'auto', md: reducedMotion ? 'calc(100vh - 64px)' : '500vh' },
        bgcolor: '#EAE5D7',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        overflow: { xs: 'hidden', md: 'visible' },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: reducedMotion ? 'relative' : 'sticky',
          top: reducedMotion ? 0 : { xs: 60, md: 64 },
          height: { xs: 'calc(100svh - 60px)', md: 'calc(100vh - 64px)' },
          overflow: 'hidden',
          isolation: 'isolate',
          // Lifts the cards above the marquee band that scrolls up beneath them
          // (band 3, cards 4, portal stage 5) so the band can never clip them.
          zIndex: 4,
        }}
      >
        <Box
          component={motion.div}
          aria-hidden="true"
          style={reducedMotion ? { rotate: -4 } : { rotate: blobRotate }}
          sx={{
            position: 'absolute',
            zIndex: -1,
            width: { xs: '145vw', md: '118vw' },
            height: { xs: '112vh', md: '126vh' },
            left: { xs: '-28vw', md: '-12vw' },
            top: { xs: '-8vh', md: '-22vh' },
            borderRadius: '50%',
            bgcolor: 'rgba(150, 187, 187, 0.33)',
            border: '1px solid rgba(72, 48, 48, 0.06)',
          }}
        />

        <Box
          component={motion.div}
          style={reducedMotion ? undefined : { x: titleX }}
          sx={{
            position: 'absolute',
            zIndex: 1,
            top: { xs: '7%', md: '31%' },
            right: { xs: '4%', md: '2%' },
            width: { xs: '92%', md: '67%' },
            m: 0,
            color: 'text.primary',
            textAlign: { xs: 'center', md: 'right' },
            fontSize: { xs: 'clamp(3.3rem, 16vw, 5.5rem)', md: 'clamp(5rem, 8.5vw, 9rem)' },
            fontWeight: 700,
            letterSpacing: '-0.075em',
            lineHeight: 0.82,
            textTransform: 'uppercase',
            opacity: 0.9,
            '@media (max-height: 700px)': {
              top: '28%',
              fontSize: 'clamp(3.5rem, 7vw, 6rem)',
            },
          }}
        >
          <Typography
            id="how-adoption-works-title"
            component="h2"
            sx={{
              m: 0,
              color: 'inherit',
              font: 'inherit',
              letterSpacing: 'inherit',
              lineHeight: 'inherit',
              textTransform: 'inherit',
            }}
          >
            How adoption works?
          </Typography>
        </Box>

        {steps.map((step, index) => (
          <ProcessCard
            key={step.number}
            step={step}
            index={index}
            progress={scrollYProgress}
            active={index === displayedStep}
            revealed={index <= displayedStep}
            reducedMotion={reducedMotion}
          />
        ))}

        <Typography
          sx={{
            position: 'absolute',
            zIndex: 2,
            left: { xs: '50%', md: '54%' },
            bottom: { xs: 72, md: 44 },
            transform: 'translateX(-50%)',
            width: { xs: '80%', md: 360 },
            color: 'text.primary',
            textAlign: 'center',
            fontSize: { xs: '0.75rem', md: '0.82rem' },
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: { xs: 'none', md: 'block' },
          }}
        >
          A thoughtful match, a supported process, and a happier beginning for everyone.
        </Typography>

        <Button
          variant="contained"
          onClick={() => scrollToSection('products-section')}
          sx={{
            position: 'absolute',
            zIndex: 2,
            right: { xs: 18, md: 38 },
            bottom: { xs: 18, md: 30 },
            px: { xs: 2.5, md: 3.5 },
            py: 1.4,
            borderRadius: 999,
            bgcolor: '#3E4E50',
            color: '#F8F6EF',
            fontWeight: 700,
            letterSpacing: '0.06em',
            '&:hover': { bgcolor: '#6F9FA0' },
          }}
        >
          Meet the pets ·
        </Button>
      </Box>

      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'relative',
          py: 8,
          isolation: 'isolate',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            zIndex: -1,
            width: '145vw',
            height: '88%',
            left: '-24vw',
            top: '4%',
            borderRadius: '50%',
            bgcolor: 'rgba(150, 187, 187, 0.33)',
          }}
        />
        <Typography
          component="p"
          sx={{
            px: 3,
            color: 'text.secondary',
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Four simple steps · one forever home
        </Typography>
        <Typography
          component="h2"
          sx={{
            px: 2,
            mt: 1.5,
            mb: 6,
            color: 'text.primary',
            textAlign: 'center',
            fontSize: 'clamp(3.45rem, 16vw, 5.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.075em',
            lineHeight: 0.84,
            textTransform: 'uppercase',
          }}
        >
          How adoption works?
        </Typography>

        <Box
          role="region"
          aria-label="Adoption process steps. Scroll horizontally to view each step."
          tabIndex={0}
          sx={{
            display: 'flex',
            gap: 2.25,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollPaddingInline: '8vw',
            px: '8vw',
            pt: 2,
            pb: 4,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {steps.map((step, index) => (
            <MobileProcessCard key={step.number} step={step} index={index} />
          ))}
        </Box>

        <Button
          variant="contained"
          onClick={() => scrollToSection('products-section')}
          sx={{
            display: 'flex',
            mx: 'auto',
            mt: 4,
            px: 3.25,
            py: 1.35,
            borderRadius: 999,
            bgcolor: '#3E4E50',
            color: '#F8F6EF',
            fontWeight: 700,
            letterSpacing: '0.06em',
            '&:hover': { bgcolor: '#6F9FA0' },
          }}
        >
          Meet the pets ·
        </Button>
      </Box>
    </Box>
  );
};

export default HowAdoptionWorks;
