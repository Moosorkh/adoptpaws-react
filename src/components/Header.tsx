import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
  Container,
  Slide,
  Fade,
  Badge,
  Tooltip,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Close, 
  Pets, 
  Info, 
  ShoppingCart, 
  ContactMail, 
  Person,
  ExitToApp,
  Settings,
  DarkMode,
  LightMode,
  Login,
  Dashboard
} from '@mui/icons-material';
import { scrollToSection, scrollToTop } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import NotificationMenu from './NotificationMenu';
import AuthDialog from './AuthDialog';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';

// Navigation items
const navItems = [
  { id: 'about-section', label: 'About Us', icon: <Info /> },
  { id: 'products-section', label: 'Adopt a Pet', icon: <Pets /> },
  { id: 'contact-section', label: 'Contact', icon: <ContactMail /> }
];

interface HeaderProps {
  onOpenCart?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const { isDarkModeEnabled, loading: featureFlagsLoading } = useFeatureFlags();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  // Debug log
  useEffect(() => {
    console.log('Header - isDarkModeEnabled:', isDarkModeEnabled, 'loading:', featureFlagsLoading);
  }, [isDarkModeEnabled, featureFlagsLoading]);

  // Force light mode if dark mode feature is disabled
  useEffect(() => {
    if (!featureFlagsLoading && !isDarkModeEnabled && darkMode) {
      console.log('Forcing light mode because feature is disabled');
      toggleDarkMode();
    }
  }, [isDarkModeEnabled, darkMode, toggleDarkMode, featureFlagsLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (id: string) => {
    // If on dashboard page, navigate to homepage first
    if (window.location.hash === '#dashboard') {
      window.location.hash = '';
      // Wait for navigation then scroll
      setTimeout(() => scrollToSection(id), 100);
    } else {
      scrollToSection(id);
    }
    setMenuOpen(false);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={scrolled ? 4 : 0}
      sx={{ 
        bgcolor: scrolled ? 'rgba(150, 187, 187, 0.95)' : '#96BBBB',
        transition: 'all 0.3s ease',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: scrolled ? 0.5 : 1 }}>
          {/* Logo */}
          <Box 
            onClick={() => {
              // Navigate to homepage if on dashboard, otherwise scroll to top
              if (window.location.hash === '#dashboard') {
                window.location.hash = '';
              }
              scrollToTop();
            }} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              flexGrow: 1 
            }}
          >
            <Pets sx={{ 
              mr: 1, 
              color: '#3E4E50', 
              fontSize: { xs: 30, md: 36 },
              transition: 'transform 0.3s ease',
              animation: !scrolled ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' }
              },
              '&:hover': {
                transform: 'rotate(15deg)'
              }
            }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-start' } }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1" 
                sx={{ 
                  color: '#3E4E50', 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', md: '2.2rem' },
                  letterSpacing: scrolled ? 0 : 1,
                  transition: 'letter-spacing 0.3s ease',
                  lineHeight: 1.1
                }}
              >
                AdoptPaws
              </Typography>
              {!isMobile && !scrolled && (
                <Fade in={!scrolled}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#3E4E50', 
                      opacity: 0.8,
                      fontStyle: 'italic',
                      ml: 0.5
                    }}
                  >
                    Find your forever friend
                  </Typography>
                </Fade>
              )}
            </Box>
          </Box>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                {navItems.map((item, index) => (
                  <Slide key={item.id} direction="down" in={true} timeout={300 + index * 100}>
                    <Button 
                      variant="text"
                      startIcon={!isMedium ? item.icon : null}
                      onClick={() => handleNavigation(item.id)}
                      sx={{ 
                        mx: 0.5, 
                        color: 'white', 
                        fontWeight: 'medium',
                        position: 'relative',
                        fontSize: '1rem',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          width: '0%',
                          height: '2px',
                          backgroundColor: '#3E4E50',
                          transition: 'all 0.3s ease',
                          transform: 'translateX(-50%)'
                        },
                        '&:hover': { 
                          backgroundColor: 'transparent',
                          color: '#3E4E50',
                          '&::after': {
                            width: '80%'
                          }
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  </Slide>
                ))}
              </Box>
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Cart Button */}
                <Tooltip title="View Cart">
                  <IconButton 
                    color="inherit" 
                    onClick={onOpenCart}
                    sx={{ position: 'relative' }}
                  >
                    <Badge 
                      badgeContent={totalItems} 
                      color="error"
                      sx={{ 
                        '& .MuiBadge-badge': { 
                          backgroundColor: totalItems > 0 ? '#3E4E50' : 'transparent',
                          transition: 'all 0.3s ease',
                          animation: totalItems > 0 ? 'pulse 1.5s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.1)' },
                            '100%': { transform: 'scale(1)' }
                          }
                        }
                      }}
                    >
                      <ShoppingCart />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                {/* Notifications */}
                <NotificationMenu />
                
                {/* User Menu */}
                {isAuthenticated ? (
                  <Tooltip title="Account settings">
                    <IconButton 
                      onClick={handleOpenUserMenu}
                      sx={{ p: 0, ml: 1 }}
                    >
                      <Avatar 
                        alt={user?.full_name || 'User'} 
                        sx={{ 
                          width: 36, 
                          height: 36,
                          border: '2px solid #3E4E50',
                          bgcolor: '#3E4E50'
                        }}
                      >
                        {user?.full_name?.charAt(0) || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Login />}
                    onClick={() => setAuthDialogOpen(true)}
                    sx={{
                      ml: 1,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: '#3E4E50',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Login
                  </Button>
                )}
              </Box>
              
              {/* User Menu Dropdown */}
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                  elevation: 3,
                  sx: { mt: 1.5, width: 200, borderRadius: 2 }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { 
                  window.location.hash = 'dashboard'; 
                  handleCloseUserMenu(); 
                }}>
                  <ListItemIcon>
                    <Dashboard fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="My Dashboard" />
                </MenuItem>
                <MenuItem onClick={() => { 
                  setProfileDialogOpen(true); 
                  handleCloseUserMenu(); 
                }}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </MenuItem>
                {isDarkModeEnabled && (
                  <MenuItem onClick={toggleDarkMode}>
                    <ListItemIcon>
                      {darkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
                  </MenuItem>
                )}
                <MenuItem onClick={() => { 
                  setSettingsDialogOpen(true); 
                  handleCloseUserMenu(); 
                }}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToApp fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Sign Out" />
                </MenuItem>
              </Menu>
            </Box>
          )}
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="View Cart">
                <IconButton 
                  color="inherit" 
                  onClick={onOpenCart}
                  sx={{ mr: 1 }}
                >
                  <Badge 
                    badgeContent={totalItems} 
                    color="error"
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        backgroundColor: '#3E4E50'
                      }
                    }}
                  >
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <IconButton 
                color="inherit" 
                edge="end" 
                onClick={() => setMenuOpen(true)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <Box sx={{ width: 280, height: '100%', bgcolor: '#EAE5D7' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2,
            bgcolor: '#96BBBB' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Pets sx={{ mr: 1, color: '#3E4E50' }} />
              <Typography variant="h6" sx={{ color: '#3E4E50', fontWeight: 'bold' }}>
                AdoptPaws
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setMenuOpen(false)}
              sx={{ color: '#3E4E50' }}
            >
              <Close />
            </IconButton>
          </Box>
          
          <Divider />
          
          {/* User Profile Section in Mobile Menu */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Avatar 
                  alt={user?.full_name || 'User'} 
                  sx={{ width: 50, height: 50, mr: 2, bgcolor: '#3E4E50' }}
                >
                  {user?.full_name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.full_name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </>
            ) : (
              <Button
                variant="contained"
                fullWidth
                startIcon={<Login />}
                onClick={() => {
                  setAuthDialogOpen(true);
                  setMenuOpen(false);
                }}
                sx={{
                  bgcolor: '#96BBBB',
                  '&:hover': { bgcolor: '#3E4E50' }
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
          
          <Divider />
          
          {/* Navigation Links */}
          <List sx={{ p: 2 }}>
            {navItems.map((item) => (
              <ListItemButton 
                key={item.id} 
                onClick={() => handleNavigation(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(150, 187, 187, 0.2)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#96BBBB', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{
                    fontWeight: 'medium',
                    color: '#3E4E50'
                  }}
                />
              </ListItemButton>
            ))}
          </List>
          
          <Divider />
          
          {/* User Actions Section */}
          {isAuthenticated && (
            <>
              <Box sx={{ p: 2 }}>
                <ListItemButton 
                  onClick={() => { 
                    window.location.hash = 'dashboard'; 
                    setMenuOpen(false); 
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'rgba(150, 187, 187, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: '#96BBBB', minWidth: 40 }}>
                    <Dashboard fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="My Dashboard" 
                    primaryTypographyProps={{
                      fontWeight: 'medium',
                      color: '#3E4E50'
                    }}
                  />
                </ListItemButton>
                <ListItemButton 
                  onClick={() => { 
                    setProfileDialogOpen(true); 
                    setMenuOpen(false); 
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'rgba(150, 187, 187, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: '#96BBBB', minWidth: 40 }}>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="My Profile" 
                    primaryTypographyProps={{
                      fontWeight: 'medium',
                      color: '#3E4E50'
                    }}
                  />
                </ListItemButton>
              </Box>
              <Divider />
            </>
          )}
          
          {/* Settings Section */}
          <Box sx={{ p: 2 }}>
            {isDarkModeEnabled && (
              <ListItemButton 
                onClick={toggleDarkMode}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(150, 187, 187, 0.2)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#96BBBB', minWidth: 40 }}>
                  {darkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </ListItemIcon>
                <ListItemText 
                  primary={darkMode ? "Light Mode" : "Dark Mode"} 
                  primaryTypographyProps={{
                    fontWeight: 'medium',
                    color: '#3E4E50'
                  }}
                />
              </ListItemButton>
            )}
            
            <ListItemButton 
              sx={{
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(150, 187, 187, 0.2)'
                }
              }}
              onClick={() => { 
                setSettingsDialogOpen(true); 
                setMenuOpen(false); 
              }}
            >
              <ListItemIcon sx={{ color: '#96BBBB', minWidth: 40 }}>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Settings" 
                primaryTypographyProps={{
                  fontWeight: 'medium',
                  color: '#3E4E50'
                }}
              />
            </ListItemButton>
            
            {/* Logout for Mobile */}
            {isAuthenticated && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItemButton 
                  onClick={() => { 
                    handleLogout(); 
                    setMenuOpen(false); 
                  }}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 0, 0, 0.1)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                    <ExitToApp fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sign Out" 
                    primaryTypographyProps={{
                      fontWeight: 'medium',
                      color: 'error.main'
                    }}
                  />
                </ListItemButton>
              </>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
      />

      {/* Profile Dialog */}
      <ProfileDialog 
        open={profileDialogOpen} 
        onClose={() => setProfileDialogOpen(false)} 
      />

      {/* Settings Dialog */}
      <SettingsDialog 
        open={settingsDialogOpen} 
        onClose={() => setSettingsDialogOpen(false)} 
      />
    </AppBar>
  );
};

export default Header;