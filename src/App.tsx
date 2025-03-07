import React from 'react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import { CartProvider } from './context/CartContext';

const App: React.FC = () => {
  return (
    <CartProvider>
      <MainLayout>
        <HomePage />
      </MainLayout>
    </CartProvider>
  );
};

export default App;