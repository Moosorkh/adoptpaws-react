import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Grid,
  Fade,
  Button,
  Badge,
  Card,
  CardContent,
  List,
  InputBase,
  IconButton,
  Collapse,
  Alert,
  AlertTitle,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { 
  ShoppingCart, 
  Delete, 
  ShoppingBag, 
  EventAvailable,
  Visibility,
  Pets,
  Search,
  Clear,
  Favorite,
  CheckCircle,
} from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import CartItem from '../components/CartItem';
import { api } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthDialog from '../components/AuthDialog';
import { getApiBaseUrl } from '../utils/apiBaseUrl';
import RevealText from '../components/motion/RevealText';
import Marquee from '../components/motion/Marquee';
import MaskedWords from '../components/motion/MaskedWords';

interface ProductsSectionProps {
  onOpenShoppingList: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ onOpenShoppingList }) => {
  const API_URL = getApiBaseUrl();
  const { cart, addToCart, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [pendingGuestProduct, setPendingGuestProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [adoptionProgress, setAdoptionProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<{id: string, product_id: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch favorites when user is authenticated
  const fetchFavorites = async () => {
    if (!isAuthenticated || !token) {
      setFavorites([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated, token]);
  

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // Default: no sorting
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleAuthRequired = (product?: Product) => {
    setPendingGuestProduct(product || null);
    setAuthDialogOpen(true);
  };

  const handleCloseAuthDialog = () => {
    setAuthDialogOpen(false);
    setPendingGuestProduct(null);
  };

  const handleContinueAsGuest = () => {
    if (pendingGuestProduct) {
      addToCart(pendingGuestProduct);
    }
    handleCloseAuthDialog();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Check authentication
    if (!isAuthenticated) {
      handleAuthRequired();
      return;
    }
    
    // Submit adoption requests for each pet in cart
    setAdoptionProgress(0);
    let completed = 0;
    
    for (const item of cart) {
      try {
        const response = await fetch(`${API_URL}/adoptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: item.id,
            notes: `Adopting ${item.name}`
          })
        });
        
        if (response.ok) {
          completed++;
          setAdoptionProgress((completed / cart.length) * 100);
        }
      } catch (error) {
        console.error('Error submitting adoption request:', error);
      }
    }
    
    setSuccessMessage(`Your adoption request${cart.length > 1 ? 's have' : ' has'} been submitted successfully! Check your dashboard for updates.`);
    setTimeout(() => {
      clearCart();
      setSuccessMessage(null);
    }, 5000);
  };

  // Calculate how many more pets needed for free adoption fee
  const petsNeededForPromo = Math.max(0, 3 - totalItems);
  const showPromo = petsNeededForPromo > 0 && petsNeededForPromo < 3;
  
  return (
    <Fade in={true} timeout={800}>
      <Box>
      <Box id="products-section" sx={{ mb: 8, mt: 2, px: { xs: 2, md: 6 } }}>
        {/* Header Section */}
        <Typography
          variant="h2"
          component="h2"
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          <MaskedWords lines={['[ Adopt a Friend ]']} justify="center" />
        </Typography>

        <RevealText>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              mb: 5,
              maxWidth: 800,
              mx: 'auto',
              color: 'text.secondary',
              fontWeight: 400,
            }}
          >
            Meet our wonderful pets waiting for their forever homes. Each one has a unique personality and lots of love to give.
          </Typography>
        </RevealText>
        
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ color: '#96BBBB' }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
        {/* Inline filter band inspired by Hot Lab's projects index. */}
        <Box
          sx={{
            mb: 1.5,
            mx: { xs: -2, md: -6 },
            px: { xs: 2, md: 6 },
            py: { xs: 3, md: 5 },
            bgcolor: '#ffffff',
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.35fr) repeat(2, minmax(180px, 0.8fr))' },
              gap: { xs: 3, md: 4 },
              maxWidth: 1180,
              mx: 'auto',
            }}
          >
            <Box
              component="form"
              onSubmit={(event: React.FormEvent) => event.preventDefault()}
              sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'text.primary' }}
            >
              <InputBase
                inputProps={{ 'aria-label': 'Search pets' }}
                placeholder="Search pets"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ flex: 1, px: 1, py: 1, fontSize: '0.82rem' }}
              />
              {searchQuery && (
                <IconButton size="small" aria-label="Clear search" onClick={() => setSearchQuery('')}>
                  <Clear sx={{ fontSize: 17 }} />
                </IconButton>
              )}
              <Search sx={{ fontSize: 18, mx: 1, color: 'text.primary' }} />
            </Box>

            <FormControl variant="standard" fullWidth>
              <Select
                value={activeCategory}
                onChange={(event: SelectChangeEvent) => setActiveCategory(event.target.value)}
                aria-label="Pet type"
                disableUnderline
                sx={{
                  px: 1,
                  py: 0.25,
                  borderBottom: '1px solid',
                  borderColor: 'text.primary',
                  fontSize: '0.82rem',
                  '& .MuiSelect-select': { py: 1 },
                  '& .MuiSelect-icon': { fontSize: 18 },
                }}
              >
                <MenuItem value="all">Pet Type</MenuItem>
                {categories.filter((category) => category.slug !== 'all').map((category) => (
                  <MenuItem key={category.id} value={category.slug}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                displayEmpty
                aria-label="Sort pets"
                disableUnderline
                renderValue={(value) => value ? ({
                  'price-asc': 'Fee: Low to High',
                  'price-desc': 'Fee: High to Low',
                  name: 'Name',
                }[value] || value) : 'Sort By'}
                sx={{
                  px: 1,
                  py: 0.25,
                  borderBottom: '1px solid',
                  borderColor: 'text.primary',
                  fontSize: '0.82rem',
                  '& .MuiSelect-select': { py: 1 },
                  '& .MuiSelect-icon': { fontSize: 18 },
                }}
              >
                <MenuItem value="">Default</MenuItem>
                <MenuItem value="price-asc">Fee: Low to High</MenuItem>
                <MenuItem value="price-desc">Fee: High to Low</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Pet Listings */}
        <Box sx={{ position: 'relative', mx: { xs: -2, md: -6 } }}>
          {/* Show count of filtered results */}
          {searchQuery || activeCategory !== 'all' || sortBy ? (
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2,
                px: { xs: 2, md: 6 },
                color: 'text.secondary',
                textAlign: 'center'
              }}
            >
              Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'pet' : 'pets'}
              {searchQuery && <> matching "{searchQuery}"</>}
              {activeCategory !== 'all' && <> in {categories.find(c => c.slug === activeCategory)?.name}</>}
            </Typography>
          ) : null}
          
          {/* No results message */}
          {sortedProducts.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              color: 'text.secondary'
            }}>
              <Pets sx={{ fontSize: 64, color: '#cccccc', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No pets found
              </Typography>
              <Typography>
                Try adjusting your search or filter criteria.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setSortBy('');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, md: 1.5 }, alignItems: 'stretch', mb: 8 }}>
              {sortedProducts.map((product, idx) => {
                const productFavorite = favorites.find(fav => fav.product_id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAuthRequired={handleAuthRequired}
                    initialFavorite={productFavorite || null}
                    onFavoriteChange={fetchFavorites}
                    index={idx}
                  />
                );
              })}
            </Box>
          )}
        </Box>

        <Box sx={{ mx: { xs: -2, sm: -4 }, mb: 8 }}>
          <Marquee text="ADOPT · DON'T SHOP" />
        </Box>

        {/* Adoption Process */}
        <Box sx={{ mb: 8 }}>
          <RevealText>
            <Typography
              variant="h5"
              component="h3"
              sx={{
                mb: 4,
                textAlign: 'center',
                color: 'text.primary',
                fontWeight: 700
              }}
            >
              How Adoption Works
            </Typography>
          </RevealText>
          
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ p: 1, bgcolor: '#96BBBB', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Step 1
                </Box>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <ShoppingCart sx={{ fontSize: 48, color: '#96BBBB', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Choose Your Pet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse our available pets and add your favorites to your cart.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ p: 1, bgcolor: '#96BBBB', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Step 2
                </Box>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <ShoppingBag sx={{ fontSize: 48, color: '#96BBBB', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Submit Request
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete your adoption request with your contact information.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ p: 1, bgcolor: '#96BBBB', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Step 3
                </Box>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <EventAvailable sx={{ fontSize: 48, color: '#96BBBB', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Meet & Greet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule a time to meet your potential new family member.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ p: 1, bgcolor: '#96BBBB', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Step 4
                </Box>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Pets sx={{ fontSize: 48, color: '#96BBBB', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Welcome Home
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete the adoption process and welcome your pet home!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Special Promotion Banner */}
        {showPromo && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              mb: 4, 
              borderRadius: 0,
              bgcolor: 'rgba(150, 187, 187, 0.15)',
              border: '1px dashed #96BBBB',
              maxWidth: 'none',
              mx: 'auto',
              textAlign: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Favorite sx={{ color: '#96BBBB' }} />
              <Typography fontWeight="medium">
                Adopt {petsNeededForPromo} more {petsNeededForPromo === 1 ? 'pet' : 'pets'} and receive a free adoption kit!
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(totalItems / 3) * 100} 
              sx={{ 
                mt: 1, 
                height: 8, 
                borderRadius: 0,
                bgcolor: 'rgba(255,255,255,0.8)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#96BBBB'
                }
              }} 
            />
          </Paper>
        )}
        </>
        )}

        {/* Cart Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 0, 
            borderRadius: 0,
            mb: 5,
            maxWidth: 'none',
            mx: 'auto',
            overflow: 'hidden'
          }}
        >
          <Box sx={{
            bgcolor: '#3E4E50',
            color: '#ffffff',
            borderBottom: '1px solid',
            borderColor: 'divider',
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge 
                badgeContent={totalItems} 
                color="primary"
                sx={{ 
                  '& .MuiBadge-badge': { 
                    bgcolor: '#96BBBB',
                    fontWeight: 'bold',
                    animation: totalItems > 0 ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }
                }}
              >
                <ShoppingCart sx={{ fontSize: 28, mr: 2, color: 'white' }} />
              </Badge>
              <Typography variant="h5" fontWeight="bold">
                Your Adoption Cart
              </Typography>
            </Box>
            
            <Box>
              {totalItems > 0 && (
                <Typography variant="subtitle1">
                  Total: ${totalPrice.toFixed(2)}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {/* Success Message */}
            <Collapse in={!!successMessage}>
              <Alert 
                severity="success" 
                icon={<CheckCircle />}
                sx={{ mb: 3 }}
              >
                <AlertTitle>Success!</AlertTitle>
                {successMessage}
              </Alert>
            </Collapse>
            
            {/* Progress Bar for Checkout */}
            <Collapse in={adoptionProgress > 0 && adoptionProgress < 100}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Processing your adoption request...
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={adoptionProgress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 0,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#96BBBB'
                    }
                  }} 
                />
              </Box>
            </Collapse>
            
            {/* Empty Cart State */}
            {cart.length === 0 && !successMessage ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                color: 'text.secondary'
              }}>
                <ShoppingCart sx={{ fontSize: 64, color: '#cccccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Your cart is empty
                </Typography>
                <Typography>
                  Add some furry friends to get started!
                </Typography>
              </Box>
            ) : (
              <>
                {/* Cart Items */}
                {cart.length > 0 && (
                  <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 3 }}>
                    <List>
                      {cart.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </List>
                  </Box>
                )}
                
                {/* Summary and Actions */}
                {cart.length > 0 && (
                  <>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      justifyContent: 'space-between',
                      alignItems: { xs: 'stretch', sm: 'center' },
                      gap: 2
                    }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Summary
                        </Typography>
                        <Typography variant="body2">
                          Total Items: {totalItems}
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          Total: ${totalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={handleClearCart}
                          disabled={adoptionProgress > 0 && adoptionProgress < 100}
                          sx={{ borderRadius: 0 }}
                        >
                          Clear Cart
                        </Button>
                        
                        <Button
                          variant="contained"
                          startIcon={<Visibility />}
                          onClick={onOpenShoppingList}
                          disabled={adoptionProgress > 0 && adoptionProgress < 100}
                          sx={{ 
                            bgcolor: '#3E4E50',
                            '&:hover': {
                              bgcolor: '#96BBBB',
                            },
                            borderRadius: 0
                          }}
                        >
                          View Details
                        </Button>
                        
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ShoppingCart />}
                          onClick={handleCheckout}
                          disabled={adoptionProgress > 0 && adoptionProgress < 100}
                          sx={{ 
                            bgcolor: '#96BBBB',
                            '&:hover': {
                              bgcolor: '#7a9b9b',
                            },
                            borderRadius: 0
                          }}
                        >
                          1 Click Checkout
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Box>
      
      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onClose={handleCloseAuthDialog}
        onContinueAsGuest={pendingGuestProduct ? handleContinueAsGuest : undefined}
      />
      </Box>
    </Fade>
  );
};

export default ProductsSection;
