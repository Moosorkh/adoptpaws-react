import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useReducedMotion, useScroll } from 'framer-motion';

interface MarqueeProps {
  text: string;
  alternateText?: string;
  /** Word whose letterforms become the aperture you travel through. */
  portalWord?: string;
  repeat?: number;
}

const BAND_HEIGHT = 104;
/** The band's own type size — the size the portal lettering starts at. */
const BAND_FONT = 36;
const CREAM = { r: 234, g: 229, b: 215 }; // page cream
const INK = { r: 72, g: 48, b: 48 }; // page ink
/** A deep shade of the brand teal (#96BBBB) — what the scene fades down to. */
const DEEP = { r: 47, g: 75, b: 75 };

type Rgb = typeof CREAM;
const mix = (a: Rgb, b: Rgb, t: number) =>
  `rgb(${Math.round(a.r + (b.r - a.r) * t)}, ${Math.round(a.g + (b.g - a.g) * t)}, ${Math.round(
    a.b + (b.b - a.b) * t
  )})`;

/**
 * Timeline over the pinned track (1 = 260svh). It opens on the frame the fourth
 * process card finishes settling.
 *
 * The band rises into view, sweeps sideways and the scene fades out behind it —
 * all three at once — and comes to rest with the invitation centred. That
 * sentence then becomes the portal.
 */
const APPROACH = [0, 0.34] as const; // slide + ascent + background fade, together
// Everything but the invitation clears: the band's own surface, its rules, the
// other words. The sentence is left alone on the dark field.
const CHROME_OUT = [0.34, 0.42] as const;
const COVER_IN = [0.39, 0.46] as const; // the masked cover takes the plate's place
const SCENE_OUT = [0.46, 0.5] as const; // the fade plate retires behind the aperture
// The painted sentence gives way to the identical hole beneath it. Invisible:
// by now the cover is opaque and its aperture already reveals the same cream.
const PHRASE_OUT = [0.46, 0.52] as const;
// Given a long, unhurried run and finished well before the pin lets go, so the
// reveal does not detonate straight into the pet index.
const FLIGHT = [0.5, 0.85] as const;
// The aperture is vast by now but a stem can still clip an edge; retire it.
const COVER_OUT = [0.8, 0.86] as const;
// From 0.86 nothing moves at all: the stage is inert and the pet index behind it
// is pinned (see HomePage), so the reveal ends on a dead stop before the page
// hands back to ordinary scrolling.

const power3InOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const power3In = (t: number) => t * t * t;
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
/** Normalise progress within a sub-range of the timeline. */
const at = (p: number, [from, to]: readonly [number, number]) => clamp01((p - from) / (to - from));

const Marquee: React.FC<MarqueeProps> = ({
  text,
  alternateText,
  portalWord = 'meet',
  repeat = 8,
}) => {
  const maskId = useId().replace(/:/g, '');
  const bandRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const coverRef = useRef<SVGRectElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const phrase = (alternateText ?? text).toLocaleUpperCase();
  // Seeded from the viewport rather than zero: the measuring pass needs the
  // <text> node to already exist, so the SVG can never be gated on its result.
  const [stage, setStage] = useState(() => {
    const w = typeof window === 'undefined' ? 1440 : window.innerWidth;
    const h = typeof window === 'undefined' ? 900 : window.innerHeight;
    return { w, h, originX: w / 2, originY: h / 2 };
  });
  /** How far the band must travel left to park the invitation dead centre. */
  const [restX, setRestX] = useState(0);
  /** The repetition of the invitation that ends up centred — the one that stays. */
  const restNodeRef = useRef<HTMLElement | null>(null);

  // Measures the pin. The stage is hoisted so that it locks the moment the band
  // starts to appear, which is why there is no approach phase in the offsets.
  const { scrollYProgress: portalProgress } = useScroll({
    target: portalRef,
    offset: ['start start', 'end end'],
  });

  // Locate the portal word inside the phrase so the fly-through is centred on
  // its letterforms rather than on the middle of the sentence.
  useLayoutEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      const t = textRef.current;
      if (!el || !t) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;

      let originX = w / 2;
      const idx = phrase.indexOf(portalWord.toLocaleUpperCase());
      if (idx >= 0) {
        try {
          const start = t.getStartPositionOfChar(idx);
          const end = t.getEndPositionOfChar(idx + portalWord.length - 1);
          originX = (start.x + end.x) / 2;
        } catch {
          /* glyph positions unavailable — fall back to the sentence centre */
        }
      }
      setStage({ w, h, originX, originY: h / 2 });
    };

    measure();
    void document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [phrase, portalWord]);

  // Pick which repetition of the invitation the sweep should come to rest on,
  // and how far left that is. Measured off the live DOM so it stays true to the
  // real advance widths of the font.
  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const width = track.parentElement?.clientWidth ?? window.innerWidth;
      const trackLeft = track.getBoundingClientRect().left;
      const targets = Array.from(track.querySelectorAll<HTMLElement>('[data-invitation]'))
        .map((node) => {
          const r = node.getBoundingClientRect();
          // Both rects carry the track's transform, so the difference is the
          // untransformed offset regardless of where the sweep currently sits.
          return { node, offset: width / 2 - (r.left - trackLeft + r.width / 2) };
        })
        // Never travel past the halfway point of the doubled track, or the
        // seam at the end of the loop would scroll into frame.
        .filter(({ offset }) => offset > -track.offsetWidth / 2);
      if (!targets.length) return;
      // The one nearest a viewport-and-a-bit of travel: enough to read as a
      // sweep without racing.
      const ideal = -width * 1.15;
      const rest = targets.reduce((a, b) =>
        Math.abs(b.offset - ideal) < Math.abs(a.offset - ideal) ? b : a
      );
      restNodeRef.current = rest.node;
      setRestX(rest.offset);
    };

    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [text, alternateText, repeat]);

  // Drive everything imperatively: a handful of attributes per frame, and no
  // re-render of the subtree on every scroll tick.
  useLayoutEffect(() => {
    if (!stage.w) return undefined;

    const apply = (raw: number) => {
      const p = clamp01(raw);

      // 1..3. Sweep, ascent and fade run on one curve, so they resolve together
      //       on the invitation sitting dead centre.
      const approach = power3InOut(at(p, APPROACH));
      const chrome = 1 - at(p, CHROME_OUT);
      // Starts a hair below the fold and finishes with the band's midline on the
      // viewport's midline.
      const from = BAND_HEIGHT;
      const to = -(stage.h / 2 - BAND_HEIGHT / 2);
      if (bandRef.current) {
        bandRef.current.style.transform = `translateY(${(from + (to - from) * approach).toFixed(2)}px)`;
        // Inverts well ahead of the scene behind it. Interpolated at the same
        // rate as the fade it would spend the middle of the ascent as mauve type
        // on grey; committing early keeps the invitation legible throughout and
        // reads as the band leading the scene down.
        const inverted = clamp01(approach / 0.2);
        const bg = mix(CREAM, DEEP, inverted);
        bandRef.current.style.backgroundColor = `rgba(${bg.slice(4, -1)}, ${chrome.toFixed(3)})`;
        bandRef.current.style.color = mix(INK, CREAM, inverted);
        bandRef.current.style.borderColor = `rgba(${Math.round(
          INK.r + (CREAM.r - INK.r) * inverted
        )}, ${Math.round(INK.g + (CREAM.g - INK.g) * inverted)}, ${Math.round(
          INK.b + (CREAM.b - INK.b) * inverted
        )}, ${((0.18 + 0.06 * inverted) * chrome).toFixed(3)})`;
        // Everything but the invitation clears away; the sentence itself holds
        // until the aperture beneath it can take over.
        bandRef.current.style.setProperty('--chrome', chrome.toFixed(3));
      }
      if (restNodeRef.current) {
        restNodeRef.current.style.opacity = String(1 - at(p, PHRASE_OUT));
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${(restX * approach).toFixed(2)}px)`;
      }
      if (fadeRef.current) {
        fadeRef.current.style.opacity = String(approach * (1 - at(p, SCENE_OUT)));
      }

      // 4. The sentence is now a hole punched through the cover, and the
      //    viewport flies through the portal word.
      const scale = 1 + power3In(at(p, FLIGHT)) * 260;
      groupRef.current?.setAttribute(
        'transform',
        `translate(${stage.originX.toFixed(2)} ${stage.originY.toFixed(2)}) ` +
          `scale(${scale.toFixed(4)}) ` +
          `translate(${(-stage.originX).toFixed(2)} ${(-stage.originY).toFixed(2)})`
      );
      coverRef.current?.setAttribute('opacity', String(at(p, COVER_IN) * (1 - at(p, COVER_OUT))));
    };

    // Paint the starting state too: `on('change')` alone leaves everything unset
    // until the first scroll tick, which flashed an empty stage.
    apply(portalProgress.get());
    const unsubscribe = portalProgress.on('change', apply);
    return () => unsubscribe();
  }, [portalProgress, stage, restX]);

  const items = Array.from({ length: repeat }, (_, index) => {
    const invitation = Boolean(alternateText) && index % 2 === 1;
    return (
      <Box
        component="span"
        key={index}
        sx={{
          display: 'inline-block',
          px: 3,
          color: 'inherit',
          fontSize: { xs: '1.5rem', md: `${BAND_FONT}px` },
          fontWeight: 700,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        <Box
          component="span"
          sx={{ opacity: 'var(--chrome, 1)' }}
          {...(invitation ? { 'data-invitation': '' } : {})}
        >
          {invitation ? alternateText : text}
        </Box>{' '}
        <Box component="span" sx={{ mx: 2, color: 'inherit', opacity: 'calc(var(--chrome, 1) * 0.55)' }}>
          &bull;
        </Box>
      </Box>
    );
  });

  const band = (
    <Box
      ref={bandRef}
      sx={{
        position: 'sticky',
        top: `calc(100svh - ${BAND_HEIGHT}px)`,
        // Above the fading scene, so the band is the last thing left standing
        // before the portal takes over.
        zIndex: 6,
        width: '100%',
        height: BAND_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        color: 'text.primary',
        willChange: 'transform, opacity',
      }}
    >
      <motion.div ref={trackRef} style={{ display: 'flex', width: 'fit-content', willChange: 'transform' }}>
        <Box sx={{ display: 'flex' }}>{items}</Box>
        <Box sx={{ display: 'flex' }} aria-hidden="true">
          {items}
        </Box>
      </motion.div>
    </Box>
  );

  if (shouldReduceMotion) {
    return (
      <>
        {band}
        <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', textTransform: 'uppercase' }}>
            {phrase}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    // Timed off the process cards' choreography: they finish assembling 80svh
    // before that section's track ends, so an 80svh pull-up puts the band's
    // first frame on the frame the fourth card lands.
    <Box sx={{ position: 'relative', mt: { xs: 0, md: '-80svh' } }}>
      {band}

      <Box
        ref={portalRef}
        aria-hidden="true"
        sx={{
          position: 'relative',
          // Hoisted a viewport (plus the band's height) so the stage is already
          // locked as the band appears, leaving a 200svh pin. The bottom margin
          // brings the pet index up behind the stage for the final 100svh, so it
          // is in place — visible through the lettering — as the pin releases.
          mt: { xs: 0, md: `calc(-100svh - ${BAND_HEIGHT}px)` },
          height: '360svh',
          // Brings the pet index up far enough that it is already sitting at the
          // top of the viewport before the aperture opens — it is pinned there
          // (HomePage) rather than sliding up through the reveal. The extra
          // 117svh is exactly the hold, so both release on the same frame.
          mb: { xs: '-100svh', md: '-217svh' },
          // Over the process cards, under the band.
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <Box ref={stageRef} sx={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden' }}>
          {/* The scene fading out behind the rising band. */}
          <Box
            ref={fadeRef}
            sx={{ position: 'absolute', inset: 0, zIndex: 0, bgcolor: `rgb(${DEEP.r}, ${DEEP.g}, ${DEEP.b})`, opacity: 0 }}
          />

          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${stage.w} ${stage.h}`}
            preserveAspectRatio="none"
            // Positioned so it paints above the absolutely-placed fade plate;
            // a static SVG would sit underneath it.
            style={{ display: 'block', position: 'absolute', inset: 0, zIndex: 1 }}
          >
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse">
                {/* White keeps the cover; the black lettering punches the hole. */}
                <rect x="0" y="0" width={stage.w} height={stage.h} fill="white" />
                <g ref={groupRef}>
                  <text
                    ref={textRef}
                    x={stage.w / 2}
                    y={stage.h / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'Space Grotesk', sans-serif"
                    fontWeight={700}
                    fontSize={BAND_FONT}
                    letterSpacing="0.02em"
                    fill="black"
                  >
                    {phrase}
                  </text>
                </g>
              </mask>
            </defs>

            <rect
              ref={coverRef}
              x="0"
              y="0"
              width={stage.w}
              height={stage.h}
              fill={`rgb(${DEEP.r}, ${DEEP.g}, ${DEEP.b})`}
              opacity={0}
              mask={`url(#${maskId})`}
            />
          </svg>
        </Box>
      </Box>
    </Box>
  );
};

export default Marquee;
