import React, { useState, useEffect } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo: string;
}

interface TeamAccordionProps {
  members: TeamMember[];
  /** Auto-advance dwell per card, ms. Pass 0 to disable. */
  cycleMs?: number;
}

// Timings measured from the developios.com process accordion.
const WIDTH_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const WIDTH_TRANSITION = `flex-grow 0.9s ${WIDTH_EASE}`;
const BODY_TRANSITION = 'opacity 0.6s ease, transform 0.6s ease';
const IMAGE_TRANSITION = 'opacity 0.7s ease, transform 0.7s ease';

const PHOTO_POSITION: Record<string, string> = {
  'Dr. Sarah Chen': '72% center',
  'James Park': '72% center',
  'Lisa Thompson': '58% center',
};

const getPhotoPosition = (name: string) => PHOTO_POSITION[name] || 'center center';

const pad2 = (n: number) => String(n + 1).padStart(2, '0');

/**
 * Horizontal hover accordion in the manner of developios.com's delivery
 * process cards: the hovered card grows wider than the resting cards,
 * others over 0.9s, revealing its body copy and photo, which fade and rise
 * into place slightly behind the width change. Auto-advances while idle.
 * Falls back to stacked cards on narrow screens, as the reference does.
 */
const TeamAccordion: React.FC<TeamAccordionProps> = ({ members, cycleMs = 5000 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (isMobile || paused || !cycleMs || members.length < 2) return;
    const id = window.setInterval(
      () => setActive((prev) => (prev + 1) % members.length),
      cycleMs
    );
    return () => window.clearInterval(id);
  }, [isMobile, paused, cycleMs, members.length]);

  if (!members.length) return null;

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {members.map((m, i) => (
          <Box
            key={m.name}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>{m.name}</Typography>
            <Typography sx={{ color: 'primary.main', fontSize: '0.8rem', mb: 2 }}>{m.role}</Typography>
            <Box
              component="img"
              src={m.photo}
              alt={m.name}
              sx={{
                display: 'block',
                width: '100%',
                aspectRatio: '3 / 2',
                objectFit: 'cover',
                objectPosition: getPhotoPosition(m.name),
                mb: 2,
              }}
            />
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.7 }}>
              {m.bio}
            </Typography>
            <Typography
              sx={{ mt: 2, fontWeight: 700, fontSize: '2rem', lineHeight: 1, color: 'text.primary', opacity: 0.25 }}
            >
              .{pad2(i)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: 'flex', gap: '12px', width: '100%', height: 560, overflow: 'hidden' }}
      onMouseLeave={() => setPaused(false)}
    >
      {members.map((m, i) => {
        const isActive = i === active;
        return (
          <Box
            key={m.name}
            onMouseEnter={() => {
              setActive(i);
              setPaused(true);
            }}
            sx={{
              // Keep the expanded card compact enough for a taller portrait
              // frame while still filling the row edge to edge.
              flexGrow: isActive ? 1.55 : 1,
              flexBasis: 0,
              minWidth: 0,
              transition: WIDTH_TRANSITION,
              willChange: 'flex-grow',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: isActive ? 'text.primary' : 'divider',
              bgcolor: 'background.paper',
              // Padding lives on the inner wrapper: on the flex item itself it
              // would add to each card's base size and skew the width ratio.
            }}
          >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
            {/* Always-visible heading */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.05rem',
                lineHeight: 1.25,
                // Wrap onto multiple lines rather than truncate, as the
                // reference's collapsed cards do.
                overflowWrap: 'break-word',
              }}
            >
              {m.name}
            </Typography>

            {/* Role + bio rise into place just behind the width change */}
            <Box
              sx={{
                mt: 1,
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateY(0)' : 'translateY(10px)',
                transition: BODY_TRANSITION,
              }}
            >
              <Typography
                sx={{
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  mb: 1.5,
                  whiteSpace: 'nowrap',
                }}
              >
                {m.role}
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                  lineHeight: 1.65,
                  minWidth: 240,
                }}
              >
                {m.bio}
              </Typography>
            </Box>

            {/* Photo sits above the number, revealed a beat later */}
            <Box
              sx={{
                mt: 'auto',
                position: 'relative',
                // Own clipping box: the image crops cleanly to this frame
                // regardless of how narrow the collapsed card gets, and the
                // index number below is positioned against this box rather
                // than the card, so it can't get chopped by the card's edge.
                overflow: 'hidden',
                // A near-square frame shows the full vertical composition of
                // the 3:2 portraits and crops only their less important sides.
                height: 300,
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(15px)',
                  transition: IMAGE_TRANSITION,
                }}
              >
                <Box
                  component="img"
                  src={m.photo}
                  alt={m.name}
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: getPhotoPosition(m.name),
                  }}
                />
              </Box>

              {/* Oversized index, always visible, inset so it stays whole */}
              <Typography
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  right: 8,
                  bottom: 4,
                  fontWeight: 700,
                  fontSize: '3.5rem',
                  lineHeight: 1,
                  color: isActive ? '#ffffff' : 'text.primary',
                  opacity: isActive ? 0.95 : 0.3,
                  transition: 'color 0.6s ease, opacity 0.6s ease',
                  textShadow: isActive ? '0 2px 12px rgba(48,32,32,0.45)' : 'none',
                  pointerEvents: 'none',
                }}
              >
                .{pad2(i)}
              </Typography>
            </Box>
          </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default TeamAccordion;
