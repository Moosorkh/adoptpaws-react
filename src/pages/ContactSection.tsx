import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Fade, 
  Card, 
  CardContent, 
  Divider, 
  Tab, 
  Tabs, 
  useMediaQuery,
  useTheme,
  Zoom,
  Badge,
  Tooltip,
  Button
} from '@mui/material';
import { 
  Email, 
  Phone, 
  LocationOn, 
  MessageOutlined, 
  PlaceOutlined, 
  TouchApp, 
  KeyboardArrowDown 
} from '@mui/icons-material';
import ContactForm from '../components/ContactForm';
import { api } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contact-tabpanel-${index}`}
      aria-labelledby={`contact-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ContactSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showTabHint, setShowTabHint] = useState(true);
  const [tabClicked, setTabClicked] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Hide the hint after some time or after tab interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTabHint(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setTabClicked(true);
    setShowTabHint(false);
  };

  const contactInfo = [
    { icon: <Email />, title: 'Email', content: settings.contact_email || 'info@adoptpaws.com' },
    { icon: <Phone />, title: 'Phone', content: settings.contact_phone || '(555) 123-4567' },
    { icon: <LocationOn />, title: 'Address', content: settings.contact_address || '150 Park Row, New York, NY 10007' }
  ];

  return (
    <Box id="contact-section" sx={{ mb: 8, mt: 4 }}>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              mb: 4, 
              textAlign: 'center',
              color: '#3E4E50',
              fontWeight: 'bold',
              position: 'relative',
              pb: 2,
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                width: '80px',
                height: '3px',
                backgroundColor: '#96BBBB',
                transform: 'translateX(-50%)'
              }
            }}
          >
            Contact Us
          </Typography>
          
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              mb: 3, 
              textAlign: 'center', 
              color: '#3E4E50',
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Have any questions about our furry friends? Want to know more about the adoption process? We're here to help!
          </Typography>
          
          {/* Contact Options Heading */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 2.5, 
            position: 'relative',
            zIndex: 2
          }}>
            <Zoom in={showTabHint && !tabClicked} timeout={500}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                left: '50%', 
                transform: 'translateX(-50%)',
                px: 2,
                py: 1,
                bgcolor: 'rgba(62, 78, 80, 0.1)',
                borderRadius: '10px 10px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.7 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.7 }
                }
              }}>
                <TouchApp color="primary" fontSize="small" />
                <Typography variant="caption" color="primary.main" fontWeight="medium">
                  Choose an option below
                </Typography>
              </Box>
            </Zoom>
            <Typography 
              variant="subtitle1" 
              fontWeight="medium" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              How would you like to contact us?
            </Typography>
            <KeyboardArrowDown sx={{ 
              color: '#96BBBB', 
              animation: 'bounce 1.5s infinite',
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                '40%': { transform: 'translateY(5px)' },
                '60%': { transform: 'translateY(3px)' }
              }
            }} />
          </Box>
          
          {/* Tabs Navigation */}
          <Box sx={{ 
            width: '100%', 
            mb: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
            }
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              centered
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#96BBBB',
                  height: 3
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'medium',
                  color: '#3E4E50',
                  opacity: 0.7,
                  py: 2,
                  mx: { xs: 0, md: 2 },
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: '#3E4E50',
                    fontWeight: 'bold',
                    opacity: 1
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(150, 187, 187, 0.1)',
                    opacity: 0.9
                  }
                },
              }}
            >
              <Tab 
                icon={<MessageOutlined />} 
                iconPosition="start" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Message Us
                    {activeTab === 0 && (
                      <Box 
                        sx={{ 
                          ml: 1, 
                          bgcolor: '#96BBBB', 
                          height: 8, 
                          width: 8, 
                          borderRadius: '50%' 
                        }} 
                      />
                    )}
                  </Box>
                }
                sx={{ 
                  borderRadius: '8px 8px 0 0',
                  border: activeTab === 0 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                  borderBottom: 'none',
                  bgcolor: activeTab === 0 ? 'rgba(150, 187, 187, 0.1)' : 'transparent',
                }}
              />
              <Tab 
                icon={<PlaceOutlined />} 
                iconPosition="start" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Visit Us
                    <Badge 
                      variant="dot" 
                      color="primary"
                      invisible={activeTab === 1 || tabClicked}
                      sx={{ 
                        '& .MuiBadge-dot': {
                          backgroundColor: '#3E4E50',
                          animation: 'pulse 1.5s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.6 },
                            '50%': { opacity: 1 },
                            '100%': { opacity: 0.6 }
                          }
                        }
                      }}
                    >
                      <Box sx={{ width: 6 }} />
                    </Badge>
                    {activeTab === 1 && (
                      <Box 
                        sx={{ 
                          ml: 1, 
                          bgcolor: '#96BBBB', 
                          height: 8, 
                          width: 8, 
                          borderRadius: '50%' 
                        }} 
                      />
                    )}
                  </Box>
                }
                sx={{ 
                  borderRadius: '8px 8px 0 0',
                  border: activeTab === 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                  borderBottom: 'none',
                  bgcolor: activeTab === 1 ? 'rgba(150, 187, 187, 0.1)' : 'transparent',
                }}
              />
            </Tabs>
          </Box>
          
          {/* Message Us Tab Panel */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Box sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3, 
                      color: '#3E4E50',
                      fontWeight: 'bold',
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  >
                    Get In Touch
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    {contactInfo.map((item, index) => (
                      <Paper
                        key={index}
                        elevation={1}
                        sx={{
                          p: 2,
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: 2,
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            mr: 2, 
                            p: 1.5, 
                            bgcolor: '#EAE5D7', 
                            borderRadius: '50%',
                            color: '#3E4E50'
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.content}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textAlign: { xs: 'center', md: 'left' },
                      fontStyle: 'italic',
                      color: 'text.secondary'
                    }}
                  >
                    We're available Monday through Saturday, 9am to 6pm.
                  </Typography>
                  
                  <Tooltip title="See our location">
                    <Button
                      variant="text"
                      onClick={() => setActiveTab(1)}
                      sx={{ 
                        mt: 3, 
                        alignSelf: { xs: 'center', md: 'flex-start' },
                        color: '#3E4E50',
                        '&:hover': {
                          backgroundColor: 'rgba(150, 187, 187, 0.1)',
                        }
                      }}
                      endIcon={<PlaceOutlined />}
                    >
                      Or visit our shelter in person
                    </Button>
                  </Tooltip>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={7}>
                <ContactForm />
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Visit Us Tab Panel */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', color: '#3E4E50', fontWeight: 'bold' }}>
              Visit Our Shelter
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box 
                  component="iframe" 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2s150%20Park%20Row%2C%20New%20York%2C%20NY%2010007%2C%20USA!5e0!3m2!1sen!2sbg!4v1445427717798" 
                  width="100%" 
                  height="500px" 
                  style={{ border: 0, borderRadius: 12 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="AdoptPaws Location"
                  aria-label="AdoptPaws Location Map"
                  sx={{ pointerEvents: 'auto' }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Contact Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ color: '#96BBBB', mr: 2 }} />
                      <Typography>
                        150 Park Row, New York, NY 10007
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ color: '#96BBBB', mr: 2 }} />
                      <Typography>
                        (555) 123-4567
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ color: '#96BBBB', mr: 2 }} />
                      <Typography>
                        info@adoptpaws.com
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Shelter Hours
                    </Typography>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2">Monday - Friday:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">9:00 AM - 6:00 PM</Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2">Saturday:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">10:00 AM - 5:00 PM</Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2">Sunday:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">11:00 AM - 4:00 PM</Typography>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="body2" color="text.secondary">
                      Directions: We're located at 150 Park Row, easily accessible by public transportation. The nearest subway stations are City Hall (R, W) and Chambers St (J, Z).
                    </Typography>
                    
                    <Tooltip title="Send us a message">
                      <Button
                        variant="text"
                        onClick={() => setActiveTab(0)}
                        sx={{ 
                          mt: 3, 
                          color: '#3E4E50',
                          '&:hover': {
                            backgroundColor: 'rgba(150, 187, 187, 0.1)',
                          }
                        }}
                        endIcon={<MessageOutlined />}
                      >
                        Or contact us online
                      </Button>
                    </Tooltip>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Fade>
    </Box>
  );
};

export default ContactSection;