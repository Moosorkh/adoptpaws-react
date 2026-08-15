import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Divider,
  IconButton
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/apiBaseUrl';

interface ProductCardProps {
  product: Product;
  onAuthRequired?: (product?: Product) => void;
  initialFavorite?: { id: string, product_id: string } | null;
  onFavoriteChange?: () => void;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAuthRequired,
  initialFavorite = null,
  onFavoriteChange,
  index = 0
}) => {
  const { addToCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(!!initialFavorite);
  const [favoriteId, setFavoriteId] = useState<string | null>(initialFavorite?.id || null);

  const API_URL = getApiBaseUrl();

  // Update favorite state when initialFavorite prop changes
  useEffect(() => {
    setIsFavorite(!!initialFavorite);
    setFavoriteId(initialFavorite?.id || null);
  }, [initialFavorite]);

  const handleAdopt = () => {
    if (!isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired(product);
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
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      sx={{
        display: 'flex',
        width: '100%',
        minWidth: 0,
      }}
    >
      <Card
        elevation={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-6px)' : 'none',
          overflow: 'hidden',
          borderRadius: 0,
          border: '1px solid',
          borderColor: isHovered ? 'text.primary' : 'divider',
          bgcolor: 'background.paper',
          position: 'relative',
          width: '100%',
        }}
      >
        {/* Image sits in a stable mask so it can zoom without resizing the card */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            height: { xs: 280, md: 320 },
          }}
        >
          <CardMedia
            component="img"
            image={product.imageUrl}
            alt={product.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 38%',
              transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease',
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
              filter: isHovered ? 'grayscale(0%)' : 'grayscale(20%)',
            }}
          />

          {/* Breed / age tags slide up out of the bottom edge on hover */}
          <Box
            sx={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              gap: 0.5,
              pointerEvents: 'none',
            }}
          >
            {[product.breed, product.age].filter(Boolean).map((tag, i) => (
              <Box
                key={`${tag}-${i}`}
                component="span"
                sx={{
                  bgcolor: 'rgba(62, 78, 80, 0.8)',
                  color: '#ffffff',
                  fontSize: '0.6rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  px: 1,
                  py: 0.4,
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
                  transitionDelay: `${i * 60}ms`,
                  transform: isHovered ? 'translateY(0)' : 'translateY(140%)',
                  opacity: isHovered ? 1 : 0,
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Favorite Button Overlay */}
        <IconButton
          onClick={(e) => toggleFavorite(e)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(62, 78, 80, 0.75)',
            borderRadius: 0,
            '&:hover': {
              bgcolor: 'rgba(62, 78, 80, 0.92)',
            },
            zIndex: 1
          }}
        >
          {isFavorite ? (
            <Favorite sx={{ color: '#ff1744' }} />
          ) : (
            <FavoriteBorder sx={{ color: '#ffffff' }} />
          )}
        </IconButton>

        <CardContent sx={{ p: 3 }}>
          <Typography
            gutterBottom
            variant="h5"
            component="h3"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'text.primary',
              letterSpacing: '0.01em'
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
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              ${product.price.toFixed(2)}
            </Typography>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 0,
                borderColor: 'text.primary',
                color: 'text.primary',
                fontWeight: 500,
                letterSpacing: '0.05em',
                px: 3,
                '&:hover': {
                  bgcolor: 'text.primary',
                  color: 'background.default',
                  borderColor: 'text.primary',
                },
              }}
              onClick={handleAdopt}
            >
              [ Adopt ]
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductCard;
