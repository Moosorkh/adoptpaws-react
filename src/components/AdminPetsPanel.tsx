import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  price: number;
  status: string;
  category: string;
  image_url: string;
  location: string;
}

interface AdminPetsPanelProps {
  onEdit: (pet: Pet) => void;
  onAdd: () => void;
}

const AdminPetsPanel: React.FC<AdminPetsPanelProps> = ({ onEdit, onAdd }) => {
  const { token } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchPets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterCategory !== 'all') params.append('category', filterCategory);

      const response = await fetch(`${API_URL}/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      } else {
        setError('Failed to fetch pets');
      }
    } catch (err) {
      setError('Error loading pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [filterStatus, filterCategory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete all adoption requests for this pet.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPets();
      } else {
        alert('Failed to delete pet');
      }
    } catch (err) {
      alert('Error deleting pet');
    }
  };

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'pending': return 'warning';
      case 'adopted': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#3E4E50">
          Manage Pets
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAdd}
          sx={{
            bgcolor: '#96BBBB',
            '&:hover': { bgcolor: '#3E4E50' }
          }}
        >
          Add New Pet
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search pets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: '#96BBBB' }} />
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="adopted">Adopted</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="dogs">Dogs</MenuItem>
              <MenuItem value="cats">Cats</MenuItem>
              <MenuItem value="special-needs">Special Needs</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchPets} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#EAE5D7' }}>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Species</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No pets found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPets.map((pet) => (
                  <TableRow key={pet.id} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={pet.image_url || 'https://via.placeholder.com/60'}
                        alt={pet.name}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">{pet.name}</Typography>
                    </TableCell>
                    <TableCell>{pet.species}</TableCell>
                    <TableCell>{pet.age} {pet.age === 1 ? 'year' : 'years'}</TableCell>
                    <TableCell>${pet.price}</TableCell>
                    <TableCell>
                      <Chip
                        label={pet.status}
                        color={getStatusColor(pet.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{pet.category}</TableCell>
                    <TableCell>{pet.location || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(pet)}
                          sx={{ color: '#96BBBB' }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(pet.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total: {filteredPets.length} {filteredPets.length === 1 ? 'pet' : 'pets'}
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminPetsPanel;
