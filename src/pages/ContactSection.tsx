import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Fade, 
  Divider
} from '@mui/material';
import { 
  Email, 
  Phone, 
  LocationOn
} from '@mui/icons-material';
import ContactForm from '../components/ContactForm';
import { api } from '../services/api';
import RevealText from '../components/motion/RevealText';
import MaskedWords from '../components/motion/MaskedWords';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const ContactSection: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
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
    { icon: <LocationOn />, title: 'Address', content: settings.contact_address || '150 Park Row, New York, NY 10007' }
  ];

  return (
    <Box ref={sectionRef} id="contact-section" sx={{ mb: 8, mt: 4, px: { xs: 2, md: 6 } }}>
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
                component="iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2s150%20Park%20Row%2C%20New%20York%2C%20NY%2010007%2C%20USA!5e0!3m2!1sen!2sbg!4v1445427717798"
                width="100%"
                style={{ border: 0, borderRadius: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AdoptPaws Location"
                aria-label="AdoptPaws Location Map"
                sx={{
                  display: 'block',
                  height: '100%',
                  minHeight: { xs: 420, md: 690 },
                  pointerEvents: 'auto'
                }}
              />
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
                          <Box sx={{ color: '#96BBBB', display: 'flex' }}>{item.icon}</Box>
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
        </Box>
      </Fade>
    </Box>
  );
};

export default ContactSection;
