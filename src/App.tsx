import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import IntroVideo from './components/IntroVideo';

const shouldSkipIntro = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

const App: React.FC = () => {
  const [introComplete, setIntroComplete] = useState(shouldSkipIntro);
  const completeIntro = useCallback(() => setIntroComplete(true), []);

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait" initial={false}>
        {!introComplete ? (
          <IntroVideo key="intro" onComplete={completeIntro} />
        ) : (
          <motion.div
            key="website"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <ToastProvider>
              <AuthProvider>
                <CartProvider>
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                </CartProvider>
              </AuthProvider>
            </ToastProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
};

export default App;
