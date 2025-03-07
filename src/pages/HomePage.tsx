import React, { useState } from 'react';
import { Container } from '@mui/material';
import Banner from '../components/Banner';
import AboutSection from './AboutSection';
import ProductsSection from './ProductsSection';
import ContactSection from './ContactSection';
import ShoppingListModal from '../components/ShoppingListModal';

const HomePage: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

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