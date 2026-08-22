import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
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
  Login,
  Dashboard
} from '@mui/icons-material';
import { scrollToSection, scrollToTop } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import NotificationMenu from './NotificationMenu';
import AuthDialog from './AuthDialog';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';

// Navigation items — bracket style, Produx-inspired
const navItems = [
  { id: 'about-section', label: 'ABOUT', icon: <Info /> },
  { id: 'products-section', label: 'ADOPT', icon: <Pets /> },
  { id: 'contact-section', label: 'CONTACT', icon: <ContactMail /> }
];

interface HeaderProps {
  onOpenCart?: () => void;
}

const MotionAppBar = motion.create(AppBar);

const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  // The morphing wordmark only makes sense over the homepage hero.
  const [isDashboard, setIsDashboard] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#dashboard'
  );
  const logoRef = useRef<HTMLDivElement>(null);
  // The wordmark is rendered at hero size and scaled DOWN into the navbar.
  // Scaling text *up* with a transform makes the browser stretch a bitmap
  // rasterised at the small layout size, which is what made the title look
  // blurry; downscaling a large raster always stays crisp.
  const [logoBox, setLogoBox] = useState({ topScale: 1, navScale: 1, w: 0, h: 0 });

  useEffect(() => {
    const onHashChange = () => setIsDashboard(window.location.hash === '#dashboard');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Measure the hero-size wordmark, then derive the two ends of the morph.
  useLayoutEffect(() => {
    const measure = () => {
      const el = logoRef.current;
      if (!el) return;
      const naturalWidth = el.offsetWidth;
      const naturalHeight = el.offsetHeight;
      if (!naturalWidth) return;

      // Read the size off the text itself — the wrapper has no font-size of
      // its own and would report the inherited 16px, inverting the morph.
      const textEl = el.querySelector('h1') ?? el;
      const renderedPx = parseFloat(getComputedStyle(textEl).fontSize);
      const navPx = isMobile ? 20 : 25.6; // 1.25rem / 1.6rem
      const navScale = navPx / renderedPx;

      const available = el.closest('.MuiToolbar-root')?.clientWidth ?? window.innerWidth;
      // Clamped to 1: scaling above the rendered size would reintroduce the
      // blur this whole approach exists to avoid.
      const topScale = isDashboard ? navScale : Math.min(1, available / naturalWidth);

      setLogoBox({
        topScale,
        navScale,
        // The element is taken out of flow, so the placeholder keeps the
        // navbar-sized footprint the Toolbar needs to lay out around.
        w: naturalWidth * navScale,
        h: naturalHeight * navScale,
      });
    };
    measure();
    // Re-measure once the webfont lands — the fallback font is a different width.
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isMobile, isDashboard]);

  // Continuous scroll-linked morph (Produx-style) instead of a hard cutoff.
  const { scrollY } = useScroll();
  const bgColor = useTransform(scrollY, [0, 80], ['rgba(234, 229, 215, 0)', 'rgba(234, 229, 215, 0.92)']);
  const borderColor = useTransform(scrollY, [0, 80], ['rgba(62, 78, 80, 0)', 'rgba(62, 78, 80, 0.18)']);

  // Giant hero wordmark shrinking into the navbar, matching the reference's
  // steep ease-out (most of the shrink happens in the first ~200px of scroll).
  const { topScale: sTop, navScale: sNav } = logoBox;
  const ease = (k: number) => sNav + (sTop - sNav) * k;
  const logoScale = useTransform(
    scrollY,
    [0, 100, 200, 300, 400, 460],
    [sTop, ease(0.368), ease(0.141), ease(0.043), ease(0.006), sNav]
  );
  // Nav links stay hidden over the giant wordmark, then fade in.
  const navOpacity = useTransform(scrollY, isDashboard ? [0, 1] : [160, 340], [isDashboard ? 1 : 0, 1]);
  const [navInteractive, setNavInteractive] = useState(isDashboard);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
    setNavInteractive(isDashboard || latest > 260);
  });

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
    <MotionAppBar
      position="sticky"
      elevation={0}
      style={{
        backgroundColor: bgColor,
        borderBottomColor: borderColor,
      }}
      sx={{
        borderBottom: '1px solid',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'backdrop-filter 0.3s ease',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: scrolled ? 1 : 2, transition: 'padding 0.3s ease' }}>
          {/* Logo — morphs from a full-width hero wordmark down into the navbar */}
          <Box
            onClick={() => {
              // Navigate to homepage if on dashboard, otherwise scroll to top
              if (window.location.hash === '#dashboard') {
                window.location.hash = '';
              }
              scrollToTop();
            }}
            sx={{
              position: 'relative',
              // Navbar-sized footprint; the hero-scale wordmark overflows it.
              width: logoBox.w || 'auto',
              height: logoBox.h || 'auto',
              cursor: 'pointer',
              pointerEvents: navInteractive ? 'auto' : 'none',
            }}
          >
            <Box
              component={motion.div}
              ref={logoRef}
              style={{ scale: logoScale }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                transformOrigin: 'left top',
                willChange: 'transform',
                whiteSpace: 'nowrap',
              }}
            >
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              component="h1"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                // Rendered at hero size so the morph only ever scales down.
                fontSize: { xs: '16vw', md: '17vw' },
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                lineHeight: 1,
                whiteSpace: 'nowrap'
              }}
            >
              Ad
              <Box
                component="span"
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '0.86em',
                  height: '0.88em',
                  mx: '0.025em',
                  transform: 'translateY(0.055em)',
                }}
              >
                <Box
                  component="img"
                  src="/images/adoptpaws-paw-o.svg"
                  alt="O"
                  sx={{
                    position: 'absolute',
                    width: '1.25em',
                    height: '1.25em',
                    left: '-0.19em',
                    top: '-0.16em',
                    display: 'block',
                  }}
                />
              </Box>
              ptPaws
            </Typography>
            </Box>
          </Box>

          {/* Spacer — the wordmark is transform-scaled so it can't drive layout */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box
              component={motion.div}
              style={{ opacity: navOpacity }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                pointerEvents: navInteractive ? 'auto' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="text"
                    startIcon={!isMedium ? item.icon : null}
                    onClick={() => handleNavigation(item.id)}
                    sx={{
                      mx: 0.5,
                      color: 'text.primary',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      letterSpacing: '0.08em',
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: 'primary.main',
                      },
                      '&::before': { content: '"[ "' },
                      '&::after': { content: '" ]"' },
                    }}
                  >
                    {item.label}
                  </Button>
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
                          backgroundColor: totalItems > 0 ? 'primary.main' : 'transparent',
                          color: '#ffffff',
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
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          color: 'text.primary'
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
                      color: 'text.primary',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'text.primary',
                        bgcolor: 'rgba(0, 0, 0, 0.04)'
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
                  sx: { mt: 1.5, width: 200, border: '1px solid', borderColor: 'divider' }
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
            <Box
              component={motion.div}
              style={{ opacity: navOpacity }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                pointerEvents: navInteractive ? 'auto' : 'none',
              }}
            >
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
                        backgroundColor: 'primary.main',
                        color: '#ffffff'
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
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
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
        <Box sx={{ width: 280, height: '100%', bgcolor: 'background.default' }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, textTransform: 'uppercase' }}>
              AdoptPaws
            </Typography>
            <IconButton
              onClick={() => setMenuOpen(false)}
              sx={{ color: 'text.primary' }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* User Profile Section in Mobile Menu */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            {isAuthenticated ? (
              <>
                <Avatar
                  alt={user?.full_name || 'User'}
                  sx={{ width: 50, height: 50, mr: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
                >
                  {user?.full_name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    {user?.full_name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Login />}
                onClick={() => {
                  setAuthDialogOpen(true);
                  setMenuOpen(false);
                }}
                sx={{
                  color: 'text.primary',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'text.primary' }
                }}
              >
                Sign In
              </Button>
            )}
          </Box>

          {/* Navigation Links */}
          <List sx={{ p: 2 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                sx={{
                  mb: 1,
                  border: '1px solid transparent',
                  '&:hover': {
                    borderColor: 'divider'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={`[ ${item.label} ]`}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: 'text.primary',
                    letterSpacing: '0.05em'
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
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
                    <Dashboard fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="My Dashboard"
                    primaryTypographyProps={{
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    setProfileDialogOpen(true);
                    setMenuOpen(false);
                  }}
                  sx={{
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="My Profile"
                    primaryTypographyProps={{
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  />
                </ListItemButton>
              </Box>
              <Divider />
            </>
          )}

          {/* Settings Section */}
          <Box sx={{ p: 2 }}>
            <ListItemButton
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
              onClick={() => {
                setSettingsDialogOpen(true);
                setMenuOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: 'text.primary'
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
                      fontWeight: 500,
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
    </MotionAppBar>
  );
};

export default Header;
