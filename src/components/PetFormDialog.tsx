import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface Pet {
  id?: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  price: number;
  description: string;
  image_url: string;
  status: string;
  category: string;
  location: string;
  medical_history: string;
  personality_traits: string;
}

interface PetFormDialogProps {
  open: boolean;
  onClose: () => void;
  pet?: Pet | null;
  onSuccess: () => void;
}

const PetFormDialog: React.FC<PetFormDialogProps> = ({ open, onClose, pet, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Pet>({
    name: '',
    species: '',
    breed: '',
    age: 1,
    gender: 'unknown',
    price: 0,
    description: '',
    image_url: '',
    status: 'available',
    category: 'dogs',
    location: '',
    medical_history: '',
    personality_traits: ''
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (open) {
      if (pet) {
        setFormData(pet);
      } else {
        setFormData({
          name: '',
          species: '',
          breed: '',
          age: 1,
          gender: 'unknown',
          price: 0,
          description: '',
          image_url: '',
          status: 'available',
          category: 'dogs',
          location: '',
          medical_history: '',
          personality_traits: ''
        });
      }
      setError('');
      setValidationErrors({});
    }
  }, [open, pet]);

  const validate = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.species.trim()) {
      errors.species = 'Species is required';
    }
    if (formData.age < 0) {
      errors.age = 'Age must be 0 or greater';
    }
    if (formData.price < 0) {
      errors.price = 'Price must be 0 or greater';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = pet 
        ? `${API_URL}/api/products/${pet.id}`
        : `${API_URL}/api/products`;
      
      const method = pet ? 'PUT' : 'POST';

      // Remove id from body when updating (it's in the URL)
      const { id, ...dataToSend } = formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(method === 'PUT' ? dataToSend : formData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save pet');
      }
    } catch (err) {
      setError('Error saving pet');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Pet, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#96BBBB', color: 'white' }}>
        {pet ? 'Edit Pet' : 'Add New Pet'}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              error={!!validationErrors.name}
              helperText={validationErrors.name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Species"
              value={formData.species}
              onChange={(e) => handleChange('species', e.target.value)}
              required
              error={!!validationErrors.species}
              helperText={validationErrors.species}
              placeholder="e.g., Dog, Cat, Bird"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Breed"
              value={formData.breed}
              onChange={(e) => handleChange('breed', e.target.value)}
              placeholder="e.g., Golden Retriever"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
              required
              error={!!validationErrors.age}
              helperText={validationErrors.age}
              InputProps={{
                endAdornment: <InputAdornment position="end">years</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Adoption Fee"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              required
              error={!!validationErrors.price}
              helperText={validationErrors.price}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                label="Category"
              >
                <MenuItem value="dogs">Dogs</MenuItem>
                <MenuItem value="cats">Cats</MenuItem>
                <MenuItem value="special-needs">Special Needs</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="adopted">Adopted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Main Shelter, Foster Home"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Image URL"
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              multiline
              rows={3}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Medical History"
              value={formData.medical_history}
              onChange={(e) => handleChange('medical_history', e.target.value)}
              multiline
              rows={2}
              placeholder="Vaccinations, conditions, treatments..."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Personality Traits"
              value={formData.personality_traits}
              onChange={(e) => handleChange('personality_traits', e.target.value)}
              multiline
              rows={2}
              placeholder="Friendly, energetic, loves children..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#96BBBB',
            '&:hover': { bgcolor: '#3E4E50' }
          }}
        >
          {loading ? 'Saving...' : pet ? 'Update Pet' : 'Add Pet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PetFormDialog;
