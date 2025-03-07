import React, { useState, useEffect } from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { scrollToTop } from '../utils/helpers';

const BackToTop: React.FC = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Zoom in={showButton}>
      <Tooltip title="Back to top" arrow placement="left">
        <Fab 
          color="secondary"
          size="medium" 
          aria-label="scroll back to top"
          sx={{ 
            position: 'fixed',
            bottom: 30,
            right: 30,
            color: 'white',
            bgcolor: 'rgba(62, 78, 80, 0.8)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#3E4E50',
              transform: 'translateY(-5px)'
            }
          }}
          onClick={scrollToTop}
        >
          <KeyboardArrowUp />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default BackToTop;