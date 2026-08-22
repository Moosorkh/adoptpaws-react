import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface IntroVideoProps {
  onComplete: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Never leave visitors stuck on the intro if playback is interrupted.
    const fallbackTimer = window.setTimeout(onComplete, 8000);
    return () => window.clearTimeout(fallbackTimer);
  }, [onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playback = video.play();
    playback?.catch(onComplete);
  }, [onComplete]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        bgcolor: '#f7f7f5',
      }}
    >
      <Box
        ref={videoRef}
        component="video"
        src="/images/hero-video.mp4"
        aria-label="AdoptPaws introduction"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onComplete}
        onError={onComplete}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
};

export default IntroVideo;
