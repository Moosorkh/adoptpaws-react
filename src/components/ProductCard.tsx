
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box,
  Grow,
  Divider
} from '@mui/material';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

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
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
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
              onClick={() => addToCart(product)}
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