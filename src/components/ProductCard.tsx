
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box,
  Grow,
  Divider,
  IconButton
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onAuthRequired?: () => void;
  initialFavorite?: { id: string, product_id: string } | null;
  onFavoriteChange?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAuthRequired,
  initialFavorite = null,
  onFavoriteChange
}) => {
  const { addToCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(!!initialFavorite);
  const [favoriteId, setFavoriteId] = useState<string | null>(initialFavorite?.id || null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Update favorite state when initialFavorite prop changes
  useEffect(() => {
    setIsFavorite(!!initialFavorite);
    setFavoriteId(initialFavorite?.id || null);
  }, [initialFavorite]);

  const handleAdopt = () => {
    if (!isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        alert('Please log in to adopt a pet');
      }
      return;
    }
    addToCart(product);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (!isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        alert('Please log in to save favorites');
      }
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        // Remove from favorites
        const response = await fetch(`${API_URL}/user/favorites/${favoriteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsFavorite(false);
          setFavoriteId(null);
          if (onFavoriteChange) onFavoriteChange();
        } else {
          console.error('Failed to remove favorite:', await response.text());
        }
      } else {
        // Add to favorites
        const response = await fetch(`${API_URL}/user/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: product.id })
        });

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(true);
          setFavoriteId(data.id);
          if (onFavoriteChange) onFavoriteChange();
        } else {
          const errorData = await response.json();
          console.error('Failed to add favorite:', errorData);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <Grow in={true} timeout={700} style={{ transformOrigin: '0 0 0' }}>
      <Card 
        elevation={isHovered ? 8 : 1}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ 
          maxWidth: 320, 
          flex: '1 1 calc(33% - 20px)', 
          minWidth: 280,
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-8px)' : 'none',
          overflow: 'hidden',
          borderRadius: 2,
          position: 'relative'
        }}
      >
        <CardMedia
          component="img"
          height="220"
          image={product.imageUrl}
          alt={product.name}
          sx={{ 
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            position: 'relative'
          }}
        />
        
        {/* Favorite Button Overlay */}
        <IconButton
          onClick={(e) => toggleFavorite(e)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)',
            },
            zIndex: 1
          }}
        >
          {isFavorite ? (
            <Favorite sx={{ color: '#ff1744' }} />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>
        
        <CardContent sx={{ p: 3 }}>
          <Typography 
            gutterBottom 
            variant="h5" 
            component="h3"
            sx={{ 
              fontWeight: 'bold',
              color: '#3E4E50'
            }}
          >
            {product.name}
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              height: 80, 
              overflow: 'hidden',
              mb: 2
            }}
          >
            {product.description}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 3
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: '#3E4E50' 
              }}
            >
              ${product.price.toFixed(2)}
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: '#3E4E50',
                '&:hover': {
                  bgcolor: '#93b7bb',
                  color: 'black',
                },
                borderRadius: 2,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                fontWeight: 'medium',
                px: 3
              }}
              onClick={handleAdopt}
            >
              Adopt
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
};

export default ProductCard;