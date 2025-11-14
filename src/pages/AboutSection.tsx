import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Divider,
  Collapse,
  Tabs,
  Tab,
  Zoom,
  Avatar,
  Button,
  Fade
} from '@mui/material';
import { 
  Pets, 
  Favorite, 
  VolunteerActivism, 
  ChildCare, 
  FormatQuote, 
  Timeline, 
  Person, 
  ExpandMore, 
  ExpandLess 
} from '@mui/icons-material';
import { api } from '../services/api';

const AboutSection: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [historyTimeline, setHistoryTimeline] = useState<any[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [team, history] = await Promise.all([
          api.getTeamMembers(),
          api.getHistory()
        ]);
        setTeamMembers(team);
        setHistoryTimeline(history);
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const features = [
    {
      icon: <Pets />,
      title: "Pet-Friendly Homes",
      description: "We ensure all our pets go to loving, suitable homes where they'll thrive."
    },
    {
      icon: <Favorite />,
      title: "Health Checked",
      description: "All pets are thoroughly examined and receive necessary vaccinations."
    },
    {
      icon: <VolunteerActivism />,
      title: "Support Network",
      description: "Adopters receive ongoing support and resources from our community."
    },
    {
      icon: <ChildCare />,
      title: "Family Matching",
      description: "We carefully match pets with families based on lifestyle and needs."
    }
  ];

  return (
    <Box id="about-section" sx={{ py: 8 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Header Section */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  mb: 2,
                  color: '#3E4E50',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  position: 'relative',
                  pb: 2,
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '15%',
                    right: '15%',
                    height: '3px',
                    background: 'linear-gradient(to right, transparent, #96BBBB, transparent)'
                  }
                }}
              >
                Our Story
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ 
                  maxWidth: 800, 
                  mx: 'auto',
                  fontSize: '1.1rem',
                  lineHeight: 1.6
                }}
              >
                Helping pets find their forever homes since 2012
              </Typography>
            </Box>
            
            {/* Main Content Section */}
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                mb: 8,
                backgroundImage: 'linear-gradient(to bottom right, rgba(150, 187, 187, 0.1), transparent)',
              }}
            >
              <Grid container spacing={0}>
                <Grid 
                  item 
                  xs={12} 
                  md={6} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: { xs: 4, md: 6 },
                    order: { xs: 2, md: 1 }
                  }}
                >
                  <Box>
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ 
                        mb: 3, 
                        fontWeight: 'bold',
                        color: '#3E4E50'
                      }}
                    >
                      Who We Are
                    </Typography>
                    
                    <Typography 
                      paragraph 
                      sx={{ 
                        mb: 3,
                        fontSize: '1.05rem',
                        lineHeight: 1.7,
                      }}
                    >
                      At AdoptPaws, we believe every pet deserves a loving home. Our dedicated team works tirelessly to rescue, rehabilitate, and rehome animals in need throughout the community. Founded with a mission of compassion, we've helped thousands of furry friends find their forever families.
                    </Typography>
                    
                    <Typography 
                      paragraph
                      sx={{ 
                        fontSize: '1.05rem',
                        lineHeight: 1.7,
                      }}
                    >
                      What sets us apart is our commitment to matching the right pet with the right family. We take the time to understand both the animal's personality and the family's lifestyle to ensure a perfect match that will last a lifetime. Our adoption process is designed to create lasting bonds and happy homes.
                    </Typography>

                    <Collapse in={expanded}>
                      <Typography 
                        paragraph
                        sx={{ 
                          fontSize: '1.05rem',
                          lineHeight: 1.7,
                        }}
                      >
                        Beyond adoptions, we provide ongoing support, training resources, and community education to promote responsible pet ownership. Our network of volunteers, foster families, and veterinary partners work together to give each animal the care they need before finding their forever home.
                      </Typography>
                    </Collapse>
                    
                    <Button 
                      variant="text" 
                      color="primary"
                      onClick={() => setExpanded(!expanded)}
                      endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                      sx={{ mt: 1 }}
                    >
                      {expanded ? "Read Less" : "Read More"}
                    </Button>
                  </Box>
                </Grid>
                
                <Grid 
                  item 
                  xs={12} 
                  md={6} 
                  sx={{ 
                    p: 0,
                    position: 'relative',
                    order: { xs: 1, md: 2 },
                    height: { xs: 300, md: 'auto' }
                  }}
                >
                  <Box 
                    component="img"
                    src="https://muensterpet.com/cdn/shop/articles/shutterstock_612226109_Alt.jpg"
                    alt="Dog sitting in front of a laptop looking back"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <Box 
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: { xs: '50%', md: '30%' },
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                      display: { xs: 'flex', md: 'none' },
                      alignItems: 'flex-end',
                      p: 3
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                      }}
                    >
                      Our Mission
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Tabbed Content Section */}
            <Box sx={{ mb: 8 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                centered
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons="auto"
                sx={{ 
                  mb: 4,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'medium',
                    minWidth: 120
                  },
                  '& .Mui-selected': {
                    color: '#3E4E50',
                    fontWeight: 'bold'
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#96BBBB',
                    height: 3
                  }
                }}
              >
                <Tab icon={<Favorite />} iconPosition="start" label="Why Choose Us" />
                <Tab icon={<Person />} iconPosition="start" label="Our Team" />
                <Tab icon={<Timeline />} iconPosition="start" label="Our History" />
              </Tabs>
              
              {/* Why Choose Us Tab */}
              <Box role="tabpanel" hidden={activeTab !== 0} sx={{ p: 1 }}>
                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    {features.map((feature, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                          <Card 
                            elevation={2}
                            sx={{ 
                              height: '100%',
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <CardContent sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              textAlign: 'center',
                              p: 3
                            }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: 'rgba(150, 187, 187, 0.1)',
                                  color: '#96BBBB',
                                  width: 64,
                                  height: 64,
                                  mb: 2
                                }}
                              >
                                {feature.icon}
                              </Avatar>
                              <Typography 
                                variant="h6" 
                                gutterBottom
                                sx={{ fontWeight: 'bold', color: '#3E4E50' }}
                              >
                                {feature.title}
                              </Typography>
                              <Typography color="text.secondary">
                                {feature.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
              
              {/* Our Team Tab */}
              <Box role="tabpanel" hidden={activeTab !== 1} sx={{ p: 1 }}>
                {activeTab === 1 && (
                  <Grid container spacing={4}>
                    {teamMembers.map((member, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Fade in={true} timeout={500 + index * 300}>
                          <Card sx={{ 
                            borderRadius: 3, 
                            height: '100%',
                            '&:hover': {
                              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                            }
                          }}>
                            <Box sx={{ position: 'relative', pt: '75%' }}>
                              <Box 
                                component="img"
                                src={member.photo}
                                alt={member.name}
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                            <CardContent>
                              <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {member.name}
                              </Typography>
                              <Typography color="primary" variant="subtitle2" gutterBottom>
                                {member.role}
                              </Typography>
                              <Divider sx={{ my: 1.5 }} />
                              <Typography variant="body2" color="text.secondary">
                                {member.bio}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
              
              {/* Our History Tab */}
              <Box role="tabpanel" hidden={activeTab !== 2} sx={{ p: 1 }}>
                {activeTab === 2 && (
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      bottom: 0, 
                      left: '50%', 
                      width: 4, 
                      bgcolor: '#96BBBB',
                      display: { xs: 'none', md: 'block' }
                    }} />
                    
                    {historyTimeline.map((item, index) => (
                      <Fade
                        key={index}
                        in={true}
                        timeout={800 + index * 200}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          mb: 4,
                          flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
                          alignItems: { xs: 'flex-start', md: 'center' }
                        }}>
                          <Box sx={{ 
                            flex: 1, 
                            textAlign: { 
                              xs: 'left',
                              md: index % 2 === 0 ? 'right' : 'left' 
                            },
                            pr: { md: index % 2 === 0 ? 4 : 0 },
                            pl: { md: index % 2 === 0 ? 0 : 4 },
                          }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {item.year}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#3E4E50" gutterBottom>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ 
                            display: { xs: 'none', md: 'flex' },
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 2
                          }}>
                            <Avatar sx={{ 
                              bgcolor: '#3E4E50', 
                              width: 40, 
                              height: 40,
                              boxShadow: '0 0 0 4px #EAE5D7'
                            }}>
                              {item.year.slice(2)}
                            </Avatar>
                          </Box>
                          
                          <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
                        </Box>
                      </Fade>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
            
            {/* Quote Section */}
            <Paper 
              elevation={2}
              sx={{
                p: 5,
                borderRadius: 4,
                bgcolor: '#96BBBB',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <FormatQuote 
                sx={{ 
                  position: 'absolute', 
                  top: -15, 
                  left: 20, 
                  fontSize: 120, 
                  opacity: 0.1,
                  color: '#ffffff'
                }} 
              />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', position: 'relative', zIndex: 2 }}>
                "Every pet deserves a loving home, and every home is better with a pet."
              </Typography>
              <Typography variant="subtitle1" sx={{ position: 'relative', zIndex: 2 }}>
                Our Founder - Mehdi Azar
              </Typography>
            </Paper>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default AboutSection;