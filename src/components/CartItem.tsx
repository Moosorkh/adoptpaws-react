import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Avatar,
  Paper,
  Tooltip,
  ButtonGroup,
  Button,
  Collapse,
  Fade
} from '@mui/material';
import { Add, Remove, Delete, Info } from '@mui/icons-material';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const [showDetails, setShowDetails] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    // Small delay to allow animation to complete
    setTimeout(() => removeItem(item.id), 300);
  };

  return (
    <Fade in={!isRemoving} timeout={300}>
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            bgcolor: 'rgba(150, 187, 187, 0.05)'
          }
        }}
      >
        <Box sx={{ display: 'flex' }}>
          {/* Product Image */}
          <Avatar
            src={item.imageUrl}
            alt={item.name}
            variant="rounded"
            sx={{ 
              width: 70, 
              height: 70, 
              mr: 2,
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}
          />
          
          {/* Product Info */}
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="medium">
                {item.name}
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ color: '#3E4E50' }}
              >
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 1
              }}
            >
              {/* Price per unit */}
              <Typography variant="body2" color="text.secondary">
                ${item.price.toFixed(2)} each
              </Typography>
              
              {/* Item details toggle */}
              <Tooltip title="View details">
                <IconButton 
                  size="small" 
                  onClick={() => setShowDetails(!showDetails)}
                  sx={{ ml: 'auto', mr: 1 }}
                >
                  <Info fontSize="small" />
                </IconButton>
              </Tooltip>
              
              {/* Delete button */}
              <Tooltip title="Remove from cart">
                <IconButton 
                  size="small" 
                  onClick={handleRemove}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Quantity Control */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
                Quantity:
              </Typography>
              <ButtonGroup size="small" variant="outlined">
                <Button
                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  sx={{ minWidth: '36px' }}
                >
                  <Remove fontSize="small" />
                </Button>
                <Button 
                  disableRipple 
                  sx={{ 
                    minWidth: '36px', 
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: 'transparent',
                      cursor: 'default'
                    }
                  }}
                >
                  {item.quantity}
                </Button>
                <Button
                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                  sx={{ minWidth: '36px' }}
                >
                  <Add fontSize="small" />
                </Button>
              </ButtonGroup>
            </Box>
          </Box>
        </Box>
        
        {/* Collapsible Details */}
        <Collapse in={showDetails}>
          <Box 
            sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: '1px dashed #eee',
              borderRadius: 0
            }}
          >
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Adoption ID:</strong> {item.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Description:</strong> {item.description}
            </Typography>
          </Box>
        </Collapse>
      </Paper>
    </Fade>
  );
};

export default CartItem;