import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

interface BannerProps {
  imageUrl?: string;
  title: string;
}

const Banner: React.FC<BannerProps> = ({ 
  imageUrl = 'https://i.imgur.com/xOBUOkG.jpeg',
  title 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      sx={{ 
        height: { xs: 300, sm: 400, md: 450 }, 
        width: '100%', 
        backgroundImage: `url(${imageUrl})`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        mb: 5,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: '70%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'white',
          p: 3,
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          borderRadius: 2,
          zIndex: 2,
          width: { xs: '90%', sm: 'auto' },
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transform: 'translate(-50%, -50%) scale(1.02)'
          }
        }}
      >
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h2"
          sx={{
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default Banner;