import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Pets,
  Message,
  CheckCircle,
  HourglassEmpty,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface AdoptionRequest {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
}

interface FavoritePet {
  id: string;
  product_id: string;
  product_name: string;
  product_breed: string;
  product_age: string;
  product_price: number;
  product_image: string;
  added_at: string;
}

const UserDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [favorites, setFavorites] = useState<FavoritePet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsDialog, setDetailsDialog] = useState<AdoptionRequest | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (tabValue === 0) {
      fetchAdoptionRequests();
    } else if (tabValue === 1) {
      fetchFavorites();
    }
  }, [tabValue, token]);

  const fetchAdoptionRequests = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/user/adoption-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdoptionRequests(data);
      } else {
        setError('Failed to load adoption requests');
      }
    } catch (err) {
      setError('An error occurred while fetching adoption requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/user/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        setError('Failed to load favorites');
      }
    } catch (err) {
      setError('An error occurred while fetching favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/user/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      }
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <HourglassEmpty color="warning" />;
    }
  };

  const getStatusColor = (status: string): "success" | "error" | "warning" => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning">Please log in to view your dashboard</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user.full_name}!
        </Typography>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<Pets />} label="My Adoption Requests" />
          <Tab icon={<Favorite />} label="My Favorites" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Adoption Requests Tab */}
          {tabValue === 0 && (
            <Box>
              {adoptionRequests.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Pets sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No adoption requests yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Start browsing pets and submit an adoption request!
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => window.location.href = '#products-section'}
                  >
                    Browse Pets
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {adoptionRequests.map((request) => (
                    <Grid item xs={12} md={6} key={request.id}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="200"
                          image={request.product_image || '/placeholder-pet.jpg'}
                          alt={request.product_name}
                        />
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {request.product_name}
                            </Typography>
                            <Chip
                              icon={getStatusIcon(request.status)}
                              label={request.status.toUpperCase()}
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Submitted: {new Date(request.created_at).toLocaleDateString()}
                          </Typography>
                          {request.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              <strong>Your message:</strong> {request.notes.substring(0, 100)}
                              {request.notes.length > 100 && '...'}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            startIcon={<Message />}
                            onClick={() => setDetailsDialog(request)}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Favorites Tab */}
          {tabValue === 1 && (
            <Box>
              {favorites.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <FavoriteBorder sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No favorites yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add pets to your favorites to keep track of them!
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => window.location.href = '#products-section'}
                  >
                    Browse Pets
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {favorites.map((favorite) => (
                    <Grid item xs={12} sm={6} md={4} key={favorite.id}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="200"
                          image={favorite.product_image || '/placeholder-pet.jpg'}
                          alt={favorite.product_name}
                        />
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {favorite.product_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {favorite.product_breed} • {favorite.product_age}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                            ${favorite.product_price}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Added: {new Date(favorite.added_at).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'space-between' }}>
                          <Button
                            size="small"
                            onClick={() => window.location.href = '#products-section'}
                          >
                            View Details
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFavorite(favorite.id)}
                          >
                            <Favorite />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </>
      )}

      {/* Details Dialog */}
      <Dialog
        open={!!detailsDialog}
        onClose={() => setDetailsDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        {detailsDialog && (
          <>
            <DialogTitle>
              Adoption Request Details
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <img
                  src={detailsDialog.product_image || '/placeholder-pet.jpg'}
                  alt={detailsDialog.product_name}
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                {detailsDialog.product_name}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  icon={getStatusIcon(detailsDialog.status)}
                  label={detailsDialog.status.toUpperCase()}
                  color={getStatusColor(detailsDialog.status)}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Submitted:</strong> {new Date(detailsDialog.created_at).toLocaleString()}
              </Typography>
              {detailsDialog.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Your Message:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2">
                      {detailsDialog.notes}
                    </Typography>
                  </Paper>
                </Box>
              )}
              {detailsDialog.status === 'pending' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Your request is being reviewed. We'll notify you once there's an update!
                </Alert>
              )}
              {detailsDialog.status === 'approved' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Congratulations! Your adoption request has been approved. We'll contact you soon!
                </Alert>
              )}
              {detailsDialog.status === 'rejected' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  We're sorry, but this adoption request was not approved. Please contact us for more information.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default UserDashboard;
