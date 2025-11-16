import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Modal, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Divider,
  Paper,
  Button,
  Fade,
  Collapse,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  List
} from '@mui/material';
import { 
  Close, 
  ShoppingCart, 
  DeleteSweep, 
  ArrowForward,
  ArrowBack,
  Check,
  PetsOutlined
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';

interface ShoppingListModalProps {
  open: boolean;
  onClose: () => void;
}

const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ open, onClose }) => {
  const { cart, clearCart, totalItems, totalPrice } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Checkout process state
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const steps = ['Review Cart', 'Adoption Details', 'Confirmation'];

  const handleClearCart = () => {
    if (confirmClear) {
      clearCart();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Process adoption - create adoption request for each pet
      if (!isAuthenticated || !token || !user) {
        setError('Please log in to complete adoption');
        return;
      }

      setIsProcessing(true);
      setError('');

      try {
        // Create an adoption request for each pet in the cart
        const adoptionPromises = cart.map(async (item) => {
          const response = await fetch(`${API_URL}/api/user/adoption-requests`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              product_id: item.id,
              notes: `Adoption request for ${item.name}`
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to submit adoption request for ${item.name}`);
          }

          return response.json();
        });

        await Promise.all(adoptionPromises);

        setIsProcessing(false);
        setShowSuccessAlert(true);
        clearCart();
        // Reset to first step after delay
        setTimeout(() => {
          setActiveStep(0);
          setShowSuccessAlert(false);
          handleCloseModal();
        }, 3000);
      } catch (err: any) {
        setIsProcessing(false);
        setError(err.message || 'Failed to submit adoption request');
      }
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleCloseModal = () => {
    // Reset state before closing
    setActiveStep(0);
    setConfirmClear(false);
    setShowSuccessAlert(false);
    onClose();
  };

  // Render different content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ minHeight: 300 }}>
            {cart.length === 0 ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  py: 6
                }}
              >
                <ShoppingCart sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                <Typography sx={{ color: '#999', fontWeight: 'medium', mb: 1 }}>
                  Your cart is empty
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Add some furry friends to your cart to get started with the adoption process
                </Typography>
              </Box>
            ) : (
              <Box>
                <List sx={{ maxHeight: 400, overflow: 'auto', pb: 1 }}>
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </List>
                
                <Collapse in={confirmClear} timeout={300}>
                  <Alert 
                    severity="warning" 
                    sx={{ mb: 2 }}
                    action={
                      <Button 
                        color="inherit" 
                        size="small" 
                        onClick={() => setConfirmClear(false)}
                      >
                        Cancel
                      </Button>
                    }
                  >
                    <AlertTitle>Confirm Clear Cart</AlertTitle>
                    Are you sure you want to remove all items from your cart?
                  </Alert>
                </Collapse>
              </Box>
            )}
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ minHeight: 300, py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Adoption Information
            </Typography>
            <Typography variant="body2" paragraph>
              Our adoption process ensures each pet finds its perfect home. Before proceeding, please note:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                We'll conduct a brief interview to ensure a good match
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Home visits may be required for some adoptions
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Adoption fees cover vaccinations, microchipping, and spay/neuter
              </Typography>
              <Typography component="li" variant="body2">
                All adopters receive a starter kit and follow-up support
              </Typography>
            </Box>
            
            <Paper elevation={0} sx={{ mt: 3, p: 2, bgcolor: 'rgba(150, 187, 187, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Note:</strong> By proceeding to the next step, you're confirming your interest in adopting
                these pets. Our team will contact you to complete the process.
              </Typography>
            </Paper>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your Adoption
              </Typography>
              
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f8f8', borderRadius: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Total Pets:</Typography>
                  <Typography variant="body2" fontWeight="bold">{totalItems}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Adoption Fees:</Typography>
                  <Typography variant="body2" fontWeight="bold">${totalPrice.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Processing Fee:</Typography>
                  <Typography variant="body2" fontWeight="bold">$15.00</Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight="bold">Total Due:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    ${(totalPrice + 15).toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Next Steps</AlertTitle>
                After submitting your request, our team will contact you within 1-2 business days 
                to schedule a meet-and-greet with your new potential family members.
              </Alert>
            </Box>
            
            <Fade in={showSuccessAlert}>
              <Alert 
                icon={<Check fontSize="inherit" />} 
                severity="success"
                sx={{ mt: 2 }}
              >
                <AlertTitle>Adoption Request Submitted!</AlertTitle>
                Thank you for your interest in adopting! We'll be in touch soon.
              </Alert>
            </Fade>
          </Box>
        );
      
      default:
        return <Box></Box>;
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="shopping-list-modal"
      closeAfterTransition
    >
      <Fade in={open}>
        <Paper
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '95%' : 700,
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 3,
            outline: 'none'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 3,
              bgcolor: '#96BBBB',
              color: 'white',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCart sx={{ mr: 1.5, color: '#3E4E50' }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                {activeStep === 0 ? 'Your Cart' : 
                 activeStep === 1 ? 'Adoption Process' :
                 'Complete Adoption'}
              </Typography>
            </Box>
            <IconButton 
              onClick={handleCloseModal}
              sx={{ 
                color: '#3E4E50',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{ mb: 4, display: isMobile ? 'none' : 'flex' }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
            
            {renderStepContent()}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {activeStep === 0 ? (
                <>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteSweep />}
                    onClick={handleClearCart}
                    disabled={cart.length === 0}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    {confirmClear ? 'Confirm Clear' : 'Clear Cart'}
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    endIcon={<ArrowForward />}
                    disabled={cart.length === 0}
                    onClick={handleNext}
                    sx={{ 
                      bgcolor: '#3E4E50',
                      '&:hover': {
                        bgcolor: '#96BBBB',
                      },
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Continue
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    disabled={isProcessing}
                    onClick={handleBack}
                    startIcon={<ArrowBack />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Back
                  </Button>
                  
                  <Button
                    variant="contained"
                    disabled={isProcessing}
                    onClick={handleNext}
                    endIcon={isProcessing ? 
                      <CircularProgress size={16} color="inherit" /> : 
                      activeStep === steps.length - 1 ? <PetsOutlined /> : <ArrowForward />
                    }
                    sx={{ 
                      bgcolor: '#3E4E50',
                      '&:hover': {
                        bgcolor: '#96BBBB',
                      },
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    {activeStep === steps.length - 1 ? 
                      (isProcessing ? 'Processing...' : 'Submit Adoption Request') : 
                      'Continue'}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default ShoppingListModal;