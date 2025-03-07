import React from 'react';
import { Box, Typography, Container, Grid, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, Pets, Email, Phone, LocationOn } from '@mui/icons-material';
import { scrollToSection } from '../utils/helpers';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto',
        bgcolor: '#96BBBB',
        color: 'white',
        pt: 6,
        pb: 3
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Pets sx={{ mr: 1, color: '#3E4E50', fontSize: 28 }} />
              <Typography variant="h5" sx={{ color: '#3E4E50', fontWeight: 'bold' }}>
                AdoptPaws
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: '#ffffff' }}>
              Open your heart and home to a new friend. Our mission is to find loving homes for pets in need.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: '#3E4E50', bgcolor: 'rgba(255, 255, 255, 0.3)' }}>
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#3E4E50', bgcolor: 'rgba(255, 255, 255, 0.3)' }}>
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#3E4E50', bgcolor: 'rgba(255, 255, 255, 0.3)' }}>
                <Instagram fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#3E4E50' }}>
              Quick Links
            </Typography>
            <Box component="nav">
              <Link 
                component="button" 
                underline="none" 
                onClick={() => scrollToSection('about-section')}
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  color: 'white',
                  '&:hover': { color: '#3E4E50' }
                }}
              >
                About Us
              </Link>
              <Link 
                component="button" 
                underline="none" 
                onClick={() => scrollToSection('products-section')}
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  color: 'white',
                  '&:hover': { color: '#3E4E50' }
                }}
              >
                Our Pets
              </Link>
              <Link 
                component="button" 
                underline="none" 
                onClick={() => scrollToSection('contact-section')}
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  color: 'white',
                  '&:hover': { color: '#3E4E50' }
                }}
              >
                Contact Us
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#3E4E50' }}>
              Contact Info
            </Typography>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1, fontSize: 18, color: '#3E4E50' }} />
              <Typography variant="body2">123 Pet Lane, Pawsville, CA 90210</Typography>
            </Box>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Phone sx={{ mr: 1, fontSize: 18, color: '#3E4E50' }} />
              <Typography variant="body2">(555) 123-4567</Typography>
            </Box>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Email sx={{ mr: 1, fontSize: 18, color: '#3E4E50' }} />
              <Typography variant="body2">info@adoptpaws.com</Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#FFFFFF' }}>
          &copy; {new Date().getFullYear()} AdoptPaws. All rights reserved. Designed with care and love.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;