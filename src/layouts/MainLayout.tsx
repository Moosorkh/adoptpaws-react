import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Fade, 
  Snackbar, 
  Alert, 
  Button, 
  Tooltip,
  Fab
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import { 
  Pets, 
  ChatBubble, 
  WifiOff, 
  Refresh, 
  Cancel
} from '@mui/icons-material';
import ShoppingListModal from '../components/ShoppingListModal';
import ChatWidget from '../components/ChatWidget';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [openShoppingList, setOpenShoppingList] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [openChatWidget, setOpenChatWidget] = useState(false);
  
  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Offline status notification */}
      <Snackbar
        open={!isOnline}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: { xs: 56, sm: 64 } }}
      >
        <Alert 
          severity="warning" 
          icon={<WifiOff />}
          sx={{ width: '100%' }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          You're offline. Some features may be unavailable.
        </Alert>
      </Snackbar>
      
      {/* Main Content Wrapper */}
      <Fade in={true} timeout={300}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Header */}
          <Header onOpenCart={() => setOpenShoppingList(true)} />
            
            {/* Main Content */}
            <Box 
              component="main" 
              sx={{ 
                flex: 1,
                position: 'relative',
                zIndex: 1,
                '&::before': {
                  content: '""',
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(150, 187, 187, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(150, 187, 187, 0.1) 2%, transparent 0%)',
                  backgroundSize: '100px 100px',
                  pointerEvents: 'none',
                  zIndex: -1
                }
              }}
            >
              {/* Welcome message */}
              <Snackbar
                open={showWelcome}
                autoHideDuration={4000}
                onClose={() => setShowWelcome(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ top: { xs: !isOnline ? 116 : 56, sm: !isOnline ? 124 : 64 } }}
              >
                <Alert 
                  icon={<Pets />}
                  severity="success"
                  sx={{ width: '100%' }}
                >
                  Welcome to AdoptPaws! Find your perfect pet companion today.
                </Alert>
              </Snackbar>
              
              {/* Main content */}
              {children}
            </Box>
            
            {/* Footer */}
            <Footer />
            
            {/* Back to Top Button */}
            <BackToTop />
            
            {/* Chat Widget Button */}
            <Box sx={{ position: 'fixed', bottom: 90, right: 20, zIndex: 1000 }}>
              <Tooltip title={openChatWidget ? "Close support chat" : "Need help? Chat with us"}>
                <Fab
                  color="primary"
                  size="medium"
                  onClick={() => setOpenChatWidget(!openChatWidget)}
                  sx={{ 
                    bgcolor: openChatWidget ? '#3E4E50' : '#96BBBB',
                    '&:hover': {
                      bgcolor: openChatWidget ? '#566265' : '#7fa8a8'
                    }
                  }}
                >
                  {openChatWidget ? <Cancel /> : <ChatBubble />}
                </Fab>
              </Tooltip>
            </Box>
            
            {/* Shopping Cart Modal */}
            <ShoppingListModal
              open={openShoppingList}
              onClose={() => setOpenShoppingList(false)}
            />
            
            {/* Chat Widget */}
            <ChatWidget 
              open={openChatWidget} 
              onClose={() => setOpenChatWidget(false)} 
            />
          </Box>
        </Fade>
    </Box>
  );
};

export default MainLayout;