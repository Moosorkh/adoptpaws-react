import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Banner from '../components/Banner';
import AboutSection from './AboutSection';
import ProductsSection from './ProductsSection';
import ContactSection from './ContactSection';
import UserDashboard from './UserDashboard';
import HowAdoptionWorks from '../components/HowAdoptionWorks';
import Marquee from '../components/motion/Marquee';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'dashboard') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange(); // Check initial hash
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // If user navigates to dashboard but is not authenticated, redirect to home
  useEffect(() => {
    if (currentView === 'dashboard' && !isAuthenticated) {
      window.location.hash = '';
      setCurrentView('home');
    }
  }, [currentView, isAuthenticated]);

  if (currentView === 'dashboard') {
    return <UserDashboard />;
  }

  return (
    <>
      <Banner title="Open Your Heart to a New Friend" />
      
      {/* Full-bleed: each section manages its own horizontal padding */}
      <Box sx={{ py: 4 }}>
        <AboutSection />
        <HowAdoptionWorks />
        <Marquee
          text="ADOPT · DON'T SHOP"
          alternateText="Ready to meet your friend?"
          portalWord="meet"
        />
        {/* Held still for the portal: the pet index is already at the top of the
            viewport before the aperture opens, and stays put through the reveal
            and a beat afterwards. The spacer is the length of that hold, and
            matches the pull-up the Marquee applies. zIndex keeps it above the
            process cards, whose own track has not quite ended yet, so the
            aperture always reveals this section. */}
        <Box sx={{ position: 'relative' }}>
          {/* Pinned below the sticky header, not under it, or the heading is
              hidden behind it for the length of the hold. */}
          <Box sx={{ position: 'sticky', top: { xs: 60, md: 64 }, zIndex: 4 }}>
            <ProductsSection />
          </Box>
          <Box aria-hidden sx={{ height: { xs: 0, md: '173svh' } }} />
        </Box>
        <ContactSection />
      </Box>
    </>
  );
};

export default HomePage;
