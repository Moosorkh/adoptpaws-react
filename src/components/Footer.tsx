import React from 'react';
import { Box, Typography, Grid, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, Email, Phone, LocationOn } from '@mui/icons-material';
import { scrollToSection, scrollToTop } from '../utils/helpers';

const Footer: React.FC = () => {
  const handleNavigation = (id: string) => {
    // If on dashboard page, navigate to homepage first
    if (window.location.hash === '#dashboard') {
      window.location.hash = '';
      // Wait for navigation then scroll
      setTimeout(() => scrollToSection(id), 100);
    } else {
      scrollToSection(id);
    }
  };

  const handleLogoClick = () => {
    // Navigate to homepage if on dashboard, otherwise scroll to top
    if (window.location.hash === '#dashboard') {
      window.location.hash = '';
    }
    scrollToTop();
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: 'background.default',
        color: 'text.primary',
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 8,
        pb: 3
      }}
    >
      <Box sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6 } }}>
        <Box
          onClick={handleLogoClick}
          sx={{ cursor: 'pointer', mb: 6 }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              fontSize: { xs: '2.75rem', sm: '4rem', md: '5.5rem' },
            }}
          >
            Ad
            <Box
              component="span"
              sx={{
                position: 'relative',
                display: 'inline-block',
                width: '0.86em',
                height: '0.88em',
                mx: '0.025em',
                transform: 'translateY(0.055em)',
              }}
            >
              <Box
                component="img"
                src="/images/adoptpaws-paw-o.svg"
                alt="O"
                sx={{
                  position: 'absolute',
                  width: '1.25em',
                  height: '1.25em',
                  left: '-0.19em',
                  top: '-0.16em',
                  display: 'block',
                }}
              />
            </Box>
            ptPaws
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Open your heart and home to a new friend. Our mission is to find loving homes for pets in need.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'text.primary', border: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'text.primary', border: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'text.primary', border: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
                <Instagram fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="overline" sx={{ mb: 2, display: 'block', color: 'text.secondary', letterSpacing: '0.1em' }}>
              Quick Links
            </Typography>
            <Box component="nav">
              <Link
                component="button"
                underline="none"
                onClick={() => handleNavigation('about-section')}
                sx={{
                  display: 'block',
                  mb: 1,
                  color: 'text.primary',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                [ About Us ]
              </Link>
              <Link
                component="button"
                underline="none"
                onClick={() => handleNavigation('products-section')}
                sx={{
                  display: 'block',
                  mb: 1,
                  color: 'text.primary',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                [ Our Pets ]
              </Link>
              <Link
                component="button"
                underline="none"
                onClick={() => handleNavigation('contact-section')}
                sx={{
                  display: 'block',
                  mb: 1,
                  color: 'text.primary',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                [ Contact Us ]
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="overline" sx={{ mb: 2, display: 'block', color: 'text.secondary', letterSpacing: '0.1em' }}>
              Contact Info
            </Typography>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">123 Pet Lane, Pawsville, CA 90210</Typography>
            </Box>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Phone sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">(555) 123-4567</Typography>
            </Box>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Email sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">info@adoptpaws.com</Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          &copy; {new Date().getFullYear()} AdoptPaws. All rights reserved. Designed with care and love.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
