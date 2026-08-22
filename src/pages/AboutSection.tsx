import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 

  Paper, 
  Grid,
  Collapse,

  Avatar,
  Button,
  Fade
} from '@mui/material';
import { 
  Pets, 
  Favorite, 
  VolunteerActivism, 
  ChildCare, 

  ExpandMore, 
  ExpandLess 
} from '@mui/icons-material';
import { api } from '../services/api';
import RevealText from '../components/motion/RevealText';
import MaskedWords from '../components/motion/MaskedWords';
import StoryTimeline, { StoryChapter } from '../components/motion/StoryTimeline';
import TeamAccordion, { TeamMember } from '../components/TeamAccordion';
import StackedCards from '../components/motion/StackedCards';
import SineCarousel from '../components/motion/SineCarousel';

// Figure images for the history chapters, matched by index.
const HISTORY_IMAGES = [
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900&q=80',
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&q=80',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900&q=80',
  'https://images.unsplash.com/photo-1591768575198-88dac53fbd0a?w=900&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=900&q=80',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=900&q=80',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900&q=80',
];

// Imagery for the Why Choose Us cards.
const FEATURE_IMAGES = [
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=700&q=80',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=700&q=80',
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=700&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=700&q=80',
];

// Keep the team visible when the content API is temporarily unavailable.
// These entries mirror the public seed data and use bundled project images.
const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Founder & Director',
    bio: 'Animal lover and community advocate with 15 years of experience in animal welfare. Dr. Chen founded AdoptPaws with a mission to create lasting bonds between pets and families.',
    photo: '/images/sara-chen.webp',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Adoption Coordinator',
    bio: 'Former veterinary assistant passionate about finding perfect matches for our pets. Michael brings expertise in animal behavior and family counseling to every adoption.',
    photo: '/images/michael-rodriguez.webp',
  },
  {
    name: 'Emily Watson',
    role: 'Veterinary Care Manager',
    bio: 'Licensed veterinary technician with a decade of experience. Emily ensures all our animals receive top-quality medical care and are healthy before adoption.',
    photo: '/images/emily-watson.webp',
  },
  {
    name: 'James Park',
    role: 'Community Outreach Director',
    bio: 'Dedicated to building partnerships and educating the community about responsible pet ownership. James organizes adoption events and volunteer programs.',
    photo: '/images/james-park.webp',
  },
  {
    name: 'Lisa Thompson',
    role: 'Foster Program Manager',
    bio: 'Coordinates our network of foster families who provide temporary homes for animals. Lisa has personally fostered over 100 animals in her career.',
    photo: '/images/lisa-thompson.webp',
  },
  {
    name: 'David Kim',
    role: 'Operations Manager',
    bio: 'Handles daily operations and facility management. David ensures our shelter runs smoothly and provides the best environment for our animals.',
    photo: '/images/david-kim.webp',
  },
];

/** Small numbered eyebrow that replaces the old tab bar. */
const SectionLabel: React.FC<{ index: string; title: string }> = ({ index, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 4 }}>
    <Typography
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.72rem',
        letterSpacing: '0.18em',
        color: 'text.secondary',
      }}
    >
      {index}
    </Typography>
    <Box sx={{ width: 28, height: '1px', bgcolor: 'text.secondary', opacity: 0.5 }} />
    <Typography
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.72rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'text.primary',
      }}
    >
      {title}
    </Typography>
  </Box>
);

const AboutSection: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [historyTimeline, setHistoryTimeline] = useState<StoryChapter[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        api.getTeamMembers()
          .then((team) => {
            if (team.length) setTeamMembers(team);
          })
          .catch((error) => console.error('Error fetching team data:', error)),
        api.getHistory()
          .then((history) => setHistoryTimeline(history))
          .catch((error) => console.error('Error fetching history data:', error)),
      ]);
    };

    fetchData();
  }, []);

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
    <Box
      id="about-section"
      sx={{
        // Pulled up a full viewport so the section climbs over the hero mosaic
        // — which is still pinned at this point — instead of starting below it
        // after a dead gap. Same slide-over as the cards stacked inside.
        mt: { xs: 0, md: '-100vh' },
        position: 'relative',
        zIndex: 2,
        bgcolor: 'background.default',
        py: { xs: 6, md: 0 },
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Fade in={true} timeout={800}>
          <Box>
            <StackedCards
              flowItems={[3]}
              // Let each full panel settle before the next one slides over it.
              holdAfter={{ 0: '70vh', 1: '70vh' }}
            >
              {/* Main Content Section */}
              <Paper 
                elevation={3} 
                sx={{ 
                  borderRadius: 0, 
                  overflow: 'hidden',
                  backgroundImage: 'linear-gradient(to bottom right, rgba(150, 187, 187, 0.1), transparent)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Keep the story title and its content in one sticky viewport. */}
                <Box sx={{ flex: '0 0 auto', py: { xs: 4, md: 3 }, textAlign: 'center', px: { xs: 2, md: 6 } }}>
                  <Typography
                    variant="h2"
                    component="h2"
                    sx={{
                      mb: 0.75,
                      fontWeight: 700,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    <MaskedWords lines={['[ Our Story ]']} justify="center" />
                  </Typography>
                  <RevealText delay={0.2}>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ mx: 'auto', fontSize: { xs: '1rem', md: '1.05rem' }, lineHeight: 1.4 }}
                    >
                      Helping pets find their forever homes since 2012
                    </Typography>
                  </RevealText>
                </Box>

                <Grid container spacing={0} sx={{ flex: 1, minHeight: 0 }}>
                  <Grid 
                    item 
                    xs={12} 
                    md={6} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: { xs: 4, md: 4 },
                      order: { xs: 2, md: 1 }
                    }}
                  >
                    <Box>
                      <Typography 
                        variant="h5" 
                        component="h3" 
                        sx={{ 
                          mb: 2, 
                          fontWeight: 'bold',
                          color: '#3E4E50'
                        }}
                      >
                        Who We Are
                      </Typography>
                    
                      <Typography 
                        paragraph 
                        sx={{ 
                          mb: 2,
                          fontSize: { md: '0.98rem', lg: '1.05rem' },
                          lineHeight: 1.6,
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
                            fontSize: { md: '0.98rem', lg: '1.05rem' },
                            lineHeight: 1.6,
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
                      // Explicit height decouples the photo from the text column:
                      // with `auto` the Grid stretches it to the row, so expanding
                      // "Read More" resized the image. An explicit cross-size opts
                      // out of `align-items: stretch`, so it stays put.
                      height: { xs: 300, md: '100%' },
                      // Centred so that if the prose ever outruns the photo (narrow
                      // desktop widths), the slack reads as inset rather than a
                      // lopsided gap under the image.
                      alignSelf: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Box 
                      component="img"
                      src="/images/about-image.jpg"
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
            
              {/* Our Team */}
              <Box
                sx={{
                  px: { xs: 2, md: 6 },
                  py: 0,
                  height: { md: '100%' },
                  display: { md: 'flex' },
                  flexDirection: { md: 'column' },
                }}
              >
                <SectionLabel index="01" title="Our Team" />
                <Box
                  sx={{
                    flex: { md: 1 },
                    minHeight: 0,
                    display: { md: 'flex' },
                    alignItems: { md: 'center' },
                  }}
                >
                  <TeamAccordion members={teamMembers} />
                </Box>
              </Box>
              {/* Why Choose Us — embellished cards on an endless ticker */}
              <Box>
                <Box sx={{ px: { xs: 2, md: 6 } }}>
                  <SectionLabel index="02" title="Why Choose Us" />
                </Box>
                <SineCarousel>
                  {features.map((feature, index) => (
                    <Box
                      key={feature.title}
                      sx={{
                        width: 320,
                        flexShrink: 0,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          bgcolor: 'background.default',
                        }}
                      >
                        <Box
                          component="img"
                          src={FEATURE_IMAGES[index % FEATURE_IMAGES.length]}
                          alt=""
                          sx={{
                            display: 'block',
                            width: '100%',
                            height: 'auto',
                            maxHeight: 360,
                            objectFit: 'contain',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(to bottom, rgba(72,48,48,0) 45%, rgba(72,48,48,0.62) 100%)',
                          }}
                        />
                        <Avatar
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: 'background.paper',
                            color: 'primary.main',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        <Typography
                          sx={{ fontWeight: 700, fontSize: '1.05rem', mb: 1 }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          sx={{ color: 'text.secondary', fontSize: '0.88rem', lineHeight: 1.65 }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </SineCarousel>
              </Box>

              {/* Our History remains a long chapter track, but now participates
                  in the same stepped stack as the preceding cards. */}
              <Box>
                <StoryTimeline
                  chapters={historyTimeline}
                  images={HISTORY_IMAGES}
                  stageTop={148}
                  header={(
                    <Box sx={{ px: { xs: 2, md: 6 }, pt: 1 }}>
                      <SectionLabel index="03" title="Our History" />
                    </Box>
                  )}
                />
              </Box>

            </StackedCards>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default AboutSection;
