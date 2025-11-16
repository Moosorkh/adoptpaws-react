import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Fade, 
  Typography, 
  Snackbar, 
  Alert, 
  Button, 
  LinearProgress,
 // useMediaQuery,
 // useTheme,
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
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [openShoppingList, setOpenShoppingList] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [openChatWidget, setOpenChatWidget] = useState(false);
  
  // Theme hooks
  //const theme = useTheme();
  //const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Loading simulation with progress bar
  useEffect(() => {
    let loadingTimer: ReturnType<typeof setTimeout>;
    const progressTimer = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + Math.floor(Math.random() * 20);
        return Math.min(newProgress, 100);
      });
    }, 200);
    
    loadingTimer = setTimeout(() => {
      clearInterval(progressTimer);
      setProgress(100);
      
      setTimeout(() => {
        setLoading(false);
        
        // Show welcome message after loading completes
        setTimeout(() => {
          setShowWelcome(true);
        }, 500);
      }, 500);
    }, 1500);
    
    return () => {
      clearTimeout(loadingTimer);
      clearInterval(progressTimer);
    };
  }, []);
  
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
      
      {/* Loading screen */}
      {loading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            bgcolor: '#EAE5D7'
          }}
        >
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Pets 
              sx={{ 
                fontSize: 80, 
                color: '#3E4E50',
                animation: 'bounce 1.5s infinite'
              }} 
            />
            <style>{`
              @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-20px); }
                60% { transform: translateY(-10px); }
              }
            `}</style>
          </Box>
          
          <Typography 
            variant="h5" 
            color="#3E4E50" 
            fontWeight="bold"
            sx={{ mb: 3 }}
          >
            AdoptPaws
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Finding your perfect pet companion...
          </Typography>
          
          <Box sx={{ width: '300px', mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(150, 187, 187, 0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#96BBBB'
                }
              }} 
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            {progress}% loaded
          </Typography>
        </Box>
      ) : (
        <Fade in={!loading} timeout={800}>
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
      )}
    </Box>
  );
};

export default MainLayout;