import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Snackbar, 
  Alert, 
  InputAdornment,
  Paper, 
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Person, Email, Message, Send } from '@mui/icons-material';
import { api } from '../services/api';
import RevealText from './motion/RevealText';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    message: ''
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validateForm = () => {
    let valid = true;
    const errors = {
      name: '',
      email: '',
      message: ''
    };

    // Validate name
    if (!formData.name) {
      errors.name = 'Name is required';
      valid = false;
    }

    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    // Validate message
    if (!formData.message) {
      errors.message = 'Message is required';
      valid = false;
    } else if (formData.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.submitContact({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Show success message
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error message
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <RevealText>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            maxWidth: isMobile ? '100%' : 600,
            mx: 'auto',
          }}
        >
          <Box sx={{
            bgcolor: '#96BBBB',
            color: 'white',
            p: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h5" fontWeight="bold">
              Get In Touch
            </Typography>
            <Typography variant="body2">
              We'd love to hear from you!
            </Typography>
          </Box>

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 3,
              p: 4,
              bgcolor: '#f8f8f8',
            }}
          >
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              type="email"
              fullWidth
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={5}
              fullWidth
              required
              error={!!formErrors.message}
              helperText={formErrors.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <Message color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={isSubmitting}
              sx={{
                bgcolor: '#3E4E50',
                py: 1.5,
                '&:hover': {
                  bgcolor: '#96BBBB',
                },
                borderRadius: 0,
                fontWeight: 'bold',
                letterSpacing: '0.05em',
              }}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
            >
              {isSubmitting ? '[ Sending... ]' : '[ Send Message ]'}
            </Button>
          </Box>
        </Paper>
      </RevealText>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Message sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactForm;