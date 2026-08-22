import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Fade,
  Button,
  InputBase,
  IconButton,
  Alert,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { 
  Pets,
  Search,
  Clear,
} from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthDialog from '../components/AuthDialog';
import { getApiBaseUrl } from '../utils/apiBaseUrl';
import RevealText from '../components/motion/RevealText';
import MaskedWords from '../components/motion/MaskedWords';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ProductsSection: React.FC = () => {
  const API_URL = getApiBaseUrl();
  const { addToCart } = useCart();
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
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: { xs: 1, md: 1.5 },
                alignItems: 'stretch',
                mb: 8,
              }}
            >
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

        </>
        )}

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
