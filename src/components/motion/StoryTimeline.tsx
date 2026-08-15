import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

export interface StoryChapter {
  year: string;
  title: string;
  description: string;
}

interface StoryTimelineProps {
  chapters: StoryChapter[];
  /** Figure images, matched to chapters by index. */
  images?: string[];
  /** Label or controls that remain at the top of the pinned stage. */
  header?: React.ReactNode;
  /** Top offset for participating in a stepped sticky-card stack. */
  stageTop?: number;
}

const pad2 = (n: number) => String(n + 1).padStart(2, '0');

/**
 * Pinned, scroll-driven chapter timeline in the manner of drinkstill.nz's
 * story section: the section holds the viewport while each chapter cross-fades
 * through, with a large outlined year behind and a year rail down the side.
 *
 * Progress is derived from the track's own bounding rect on scroll rather than
 * a motion-value chain — the cross-fade is a plain CSS transition keyed off the
 * active index, which keeps the whole thing deterministic and easy to verify.
 * Falls back to a stacked list on phones, where pinning reads poorly.
 */
const StoryTimeline: React.FC<StoryTimelineProps> = ({
  chapters,
  images = [],
  header,
  stageTop = 0,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (isMobile || !chapters.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pinRange = rect.height - window.innerHeight;
      if (pinRange <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / pinRange));
      const idx = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));
      setActive((prev) => (prev === idx ? prev : idx));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isMobile, chapters.length]);

  if (!chapters.length) return null;

  // Phones: no pinning, just a readable stacked list.
  if (isMobile) {
    return (
      <Box>
        {header}
        {chapters.map((c, i) => (
          <Box key={c.year + c.title} sx={{ mb: 6 }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 1,
              }}
            >
              Chapter {pad2(i)} · <Box component="span" sx={{ color: 'text.primary' }}>{c.year}</Box>
            </Typography>
            <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.6rem', mb: 2 }}>
              {c.title}
            </Typography>
            {images[i] && (
              <Box
                component="img"
                src={images[i]}
                alt={`${c.title}, ${c.year}`}
                sx={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', mb: 2 }}
              />
            )}
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{c.description}</Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box ref={trackRef} sx={{ position: 'relative', height: `${chapters.length * 100}vh` }}>
      <Box
        sx={{
          position: 'sticky',
          top: `${stageTop}px`,
          height: `calc(100svh - ${stageTop}px)`,
          overflow: 'hidden',
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -10px 28px rgba(72, 48, 48, 0.10)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {header && <Box sx={{ flex: '0 0 auto', position: 'relative', zIndex: 3 }}>{header}</Box>}

        <Box sx={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {chapters.map((chapter, i) => {
          const isActive = i === active;
          return (
            <Box
              key={chapter.year + chapter.title}
              aria-hidden={!isActive}
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                pl: { xs: 3, md: 8 },
                // Extra right padding so content clears the year rail.
                pr: { xs: 3, md: 14 },
                pointerEvents: 'none',
                opacity: isActive ? 1 : 0,
                transition: 'opacity 0.55s ease',
              }}
            >
              {/* Large outlined year watermark */}
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 'clamp(18rem, 34vw, 34rem)',
                  lineHeight: 1,
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(72, 48, 48, 0.16)',
                  userSelect: 'none',
                  transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isActive ? 'scale(1)' : 'scale(1.06)',
                }}
              >
                {chapter.year.slice(2)}
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 4, md: 8 },
                  width: '100%',
                  maxWidth: 1400,
                  mx: 'auto',
                  flexDirection: { xs: 'column', md: 'row' },
                }}
              >
                {/* Chapter copy */}
                <Box
                  sx={{
                    flex: 1,
                    maxWidth: 520,
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isActive ? 'translateY(0)' : 'translateY(24px)',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                      mb: 2,
                    }}
                  >
                    Chapter {pad2(i)}
                    <Box component="span" sx={{ mx: 1, opacity: 0.5 }}>·</Box>
                    <Box component="span" sx={{ color: 'text.primary' }}>{chapter.year}</Box>
                  </Typography>

                  <Typography
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      lineHeight: 1.08,
                      letterSpacing: '-0.01em',
                      fontSize: { xs: '2rem', md: '3rem' },
                      mb: 3,
                    }}
                  >
                    {chapter.title}
                  </Typography>

                  <Box sx={{ width: 56, height: '1px', bgcolor: 'text.secondary', opacity: 0.5, mb: 3 }} />

                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, maxWidth: 460 }}>
                    {chapter.description}
                  </Typography>
                </Box>

                {/* Figure */}
                {images[i] && (
                  <Box sx={{ flex: 1, maxWidth: 620, width: '100%' }}>
                    <Box sx={{ overflow: 'hidden', width: '100%' }}>
                      <Box
                        component="img"
                        src={images[i]}
                        alt={`${chapter.title}, ${chapter.year}`}
                        sx={{
                          display: 'block',
                          width: '100%',
                          aspectRatio: '4 / 3',
                          objectFit: 'cover',
                          transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                          transform: isActive ? 'scale(1)' : 'scale(1.08)',
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        mt: 1.5,
                        fontFamily: 'monospace',
                        fontSize: '0.62rem',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                      }}
                    >
                      <Box component="span" sx={{ mr: 1 }}>●</Box>
                      Fig. {pad2(i)} · {chapter.title} · {chapter.year}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
          })}

          {/* Year rail */}
          <Box
            sx={{
              position: 'absolute',
              right: { md: 24, lg: 40 },
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              borderLeft: '1px solid',
              borderColor: 'divider',
              pl: 2,
            }}
          >
            {chapters.map((c, i) => (
              <Typography
                key={c.year}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  transition: 'color 0.3s ease, opacity 0.3s ease',
                  color: i === active ? 'text.primary' : 'text.secondary',
                  fontWeight: i === active ? 700 : 400,
                  opacity: i === active ? 1 : 0.45,
                }}
              >
                {c.year}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StoryTimeline;
