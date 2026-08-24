import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Fade, 
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import { 
  Close,
  Email, 
  Phone, 
  LocationOn
} from '@mui/icons-material';
import ContactForm from '../components/ContactForm';
import { api } from '../services/api';
import RevealText from '../components/motion/RevealText';
import MaskedWords from '../components/motion/MaskedWords';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const MAP_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2s150%20Park%20Row%2C%20New%20York%2C%20NY%2010007%2C%20USA!5e0!3m2!1sen!2sbg!4v1445427717798';

const ContactSection: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [mapOpen, setMapOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const sectionInView = useInView(sectionRef, { margin: '240px 0px' });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [18, -18]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const contactInfo = [
    { icon: <Email />, title: 'Email', content: settings.contact_email || 'info@adoptpaws.com' },
    { icon: <Phone />, title: 'Phone', content: settings.contact_phone || '(555) 123-4567' },
    { icon: <LocationOn />, title: 'Address', content: settings.contact_address || '150 Park Row, New York, NY 10007', opensMap: true }
  ];

  return (
    <Box
      ref={sectionRef}
      id="contact-section"
      sx={{
        mb: 0,
        mt: 4,
        pb: 12,
        px: { xs: 2, md: 6 },
        background: `
          linear-gradient(to bottom, #EAE5D7 0%, rgba(234,229,215,0) 112px),
          linear-gradient(to bottom, rgba(234,229,215,0) calc(100% - 96px), #EAE5D7 100%),
          radial-gradient(circle at 58% 30%, rgba(255,255,255,0.98), rgba(255,255,255,0.28) 31%, transparent 58%),
          linear-gradient(115deg, #f3f0e8 0%, #d9d3c8 58%, #b8b4ae 100%)
        `,
      }}
    >
      <Fade in={true} timeout={800}>
        <Box>
          <Box
            component={motion.div}
            style={reducedMotion ? undefined : { y: headingY }}
            sx={{ willChange: reducedMotion ? 'auto' : 'transform' }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mb: 3,
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              <MaskedWords lines={['[ Contact Us ]']} justify="center" />
            </Typography>

            <RevealText delay={0.2}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  mb: 3,
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontWeight: 400,
                  maxWidth: 700,
                  mx: 'auto'
                }}
              >
                Have any questions about our furry friends? Want to know more about the adoption process? We're here to help!
              </Typography>
            </RevealText>
          </Box>
          
          <Grid container spacing={3} alignItems="stretch" sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  minHeight: { xs: 420, md: 690 },
                  overflow: 'hidden',
                  bgcolor: 'transparent',
                }}
              >
                {sectionInView && !reducedMotion ? (
                  <Box
                    component="iframe"
                    src="/ready-to-adopt-demo.html"
                    title="Ready to adopt interactive dog animation"
                    aria-label="Interactive Golden Retriever following a tennis ball beneath the words Ready to Adopt"
                    sx={{ display: 'block', width: '100%', height: '100%', border: 0 }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'grid',
                      placeItems: 'center',
                      p: 3,
                      bgcolor: 'transparent',
                    }}
                  >
                    <Typography
                      aria-label="Ready to adopt?"
                      sx={{
                        color: '#151515',
                        fontSize: { xs: '4rem', md: 'clamp(4.5rem, 7vw, 7rem)' },
                        fontWeight: 900,
                        lineHeight: 0.8,
                        letterSpacing: '-0.075em',
                        textAlign: 'center',
                      }}
                    >
                      READY TO<br />ADOPT?
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 0,
                  overflow: 'hidden',
                  bgcolor: '#f8f8f8'
                }}
              >
                <Box sx={{ p: { xs: 2.5, sm: 4 }, pb: { xs: 2.5, sm: 3 } }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.75 }}>
                    Send us a message
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    We'd love to hear from you. You can also reach or visit us using the details below.
                  </Typography>

                  <Grid container spacing={2}>
                    {contactInfo.map((item) => (
                      <Grid item xs={12} sm={item.title === 'Address' ? 12 : 6} key={item.title}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          {item.opensMap ? (
                            <IconButton
                              aria-label="Open location map"
                              title="Open map"
                              onClick={() => setMapOpen(true)}
                              size="small"
                              sx={{
                                position: 'relative',
                                color: '#96BBBB',
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                overflow: 'visible',
                                border: '1px solid rgba(150, 187, 187, 0.68)',
                                bgcolor: 'rgba(150, 187, 187, 0.12)',
                                transition: 'transform 180ms ease, color 180ms ease, background-color 180ms ease',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  inset: 2,
                                  borderRadius: '50%',
                                  border: '1px solid rgba(150, 187, 187, 0.72)',
                                  pointerEvents: 'none',
                                  animation: reducedMotion ? 'none' : 'locationMapPulse 2.7s ease-out infinite',
                                },
                                '@keyframes locationMapPulse': {
                                  '0%, 42%': { transform: 'scale(0.82)', opacity: 0 },
                                  '50%': { opacity: 0.62 },
                                  '82%, 100%': { transform: 'scale(1.82)', opacity: 0 },
                                },
                                '&:hover': {
                                  color: '#483030',
                                  bgcolor: 'rgba(150, 187, 187, 0.25)',
                                  transform: 'scale(1.08)',
                                },
                                '&:focus-visible': {
                                  outline: '2px solid #483030',
                                  outlineOffset: 3,
                                },
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  display: 'flex',
                                  position: 'relative',
                                  zIndex: 1,
                                  animation: reducedMotion ? 'none' : 'locationPinBounce 2.7s ease-in-out infinite',
                                  '@keyframes locationPinBounce': {
                                    '0%, 47%, 66%, 100%': { transform: 'translateY(0)' },
                                    '53%': { transform: 'translateY(-3px)' },
                                    '60%': { transform: 'translateY(-1px)' },
                                  },
                                }}
                              >
                                {item.icon}
                              </Box>
                            </IconButton>
                          ) : (
                            <Box sx={{ color: '#96BBBB', display: 'flex' }}>{item.icon}</Box>
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ display: 'block' }}>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.content}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Divider />
                <ContactForm embedded />
              </Paper>
            </Grid>
          </Grid>

          <Dialog
            open={mapOpen}
            onClose={() => setMapOpen(false)}
            fullWidth
            maxWidth="lg"
            aria-labelledby="location-map-title"
            PaperProps={{ sx: { borderRadius: 0, bgcolor: '#f8f8f8' } }}
          >
            <DialogTitle id="location-map-title" sx={{ pr: 7 }}>
              Visit AdoptPaws
              <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {settings.contact_address || '150 Park Row, New York, NY 10007'}
              </Typography>
              <IconButton
                aria-label="Close location map"
                onClick={() => setMapOpen(false)}
                sx={{ position: 'absolute', top: 12, right: 12 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, height: { xs: '62vh', md: '72vh' } }}>
              {mapOpen && (
                <Box
                  component="iframe"
                  src={MAP_SRC}
                  width="100%"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="AdoptPaws Location"
                  aria-label="AdoptPaws Location Map"
                  sx={{ display: 'block', width: '100%', height: '100%', border: 0 }}
                />
              )}
            </DialogContent>
          </Dialog>
        </Box>
      </Fade>
    </Box>
  );
};

export default ContactSection;
