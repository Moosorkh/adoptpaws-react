import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import Banner from '../components/Banner';
import AboutSection from './AboutSection';
import ProductsSection from './ProductsSection';
import ContactSection from './ContactSection';
import UserDashboard from './UserDashboard';
import ShoppingListModal from '../components/ShoppingListModal';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
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
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <AboutSection />
        <ProductsSection onOpenShoppingList={() => setOpenModal(true)} />
        <ContactSection />
      </Container>

      <ShoppingListModal 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
      />
    </>
  );
};

export default HomePage;