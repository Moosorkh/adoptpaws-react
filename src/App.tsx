import React from 'react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <MainLayout>
            <HomePage />
          </MainLayout>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;