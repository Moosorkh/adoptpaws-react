import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

interface StackedCardsProps {
  children: React.ReactNode;
  /** Child indexes that provide their own long scroll track and sticky stage. */
  flowItems?: number[];
  /** Visible sliver of each card left behind as the next slides over it. */
  peek?: number;
  /** Offset of the first card from the top of the viewport (clears the header). */
  topOffset?: number;
  /**
   * Uniform card height. Equal heights are what make the stack work: a sticky
   * card stays pinned only while its parent still has room beneath it, so with
   * N cards of height H each card's pinned range is exactly (N-1)·H — precisely
   * long enough to stay put until the last card lands. Mismatched heights make
   * the earlier cards let go too soon. The reference uses ~858px for all of its.
   */
  cardHeight?: number;
}

/**
 * Scroll-stacking panels, matching developios.com's case-study cards: every
 * panel is `position: sticky` with a `top` that steps down by `peek` for each
 * successive card, so each one slides up over the previous and pins just below
 * it. The reference does this with sticky alone — no transforms, no opacity
 * fades and no JS — so the motion is driven entirely by scroll position and
 * inherits the browser's own scrolling cadence.
 *
 * Disabled on phones, where stacking full-height panels eats the viewport.
 */
const StackedCards: React.FC<StackedCardsProps> = ({
  children,
  flowItems = [],
  peek = 20,
  topOffset = 88,
  cardHeight = 800,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const items = React.Children.toArray(children);

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((child, i) => (
          <Box key={i}>{child}</Box>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {items.map((child, i) => (
        flowItems.includes(i) ? (
          <React.Fragment key={i}>{child}</React.Fragment>
        ) : (
          <Box
            key={i}
            sx={{
              position: 'sticky',
              top: `${topOffset + i * peek}px`,
              height: cardHeight,
              // Panels must be opaque to occlude the card pinned beneath them.
              bgcolor: 'background.default',
              // Leading edge + upward shadow so each card reads as a distinct
              // layer sliding over the last, rather than cream on cream.
              borderTop: '1px solid',
              borderColor: 'divider',
              boxShadow: i === 0 ? 'none' : '0 -10px 28px rgba(72, 48, 48, 0.10)',
              display: 'flex',
              alignItems: 'stretch',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ width: '100%', height: '100%' }}>{child}</Box>
          </Box>
        )
      ))}

      {/* Real spacer, not padding: a sticky element is contained by its
          parent's *content* box, so padding-bottom would not extend the pinned
          range. This gives the final card room to hold on screen before the
          whole stack releases together. */}
      {!flowItems.includes(items.length - 1) && (
        <Box aria-hidden="true" sx={{ height: `${Math.round(cardHeight * 0.6)}px` }} />
      )}
    </Box>
  );
};

export default StackedCards;
