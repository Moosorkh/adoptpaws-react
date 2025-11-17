import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Typography
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ open, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open && user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setValidationErrors({});
      setError('');
      setSuccess('');
    }
  }, [open, user]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    
    // Clear validation error when user types
    if (validationErrors.phone) {
      setValidationErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Validate full name
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    // Validate phone if provided
    if (phone) {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        errors.phone = 'Phone number must be 10 digits';
      }
    }

    // Validate address if provided
    if (address && address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone || undefined,
        address: address.trim() || undefined
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#96BBBB' }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h6">My Profile</Typography>
            <Typography variant="body2" color="text.secondary">
              Update your personal information
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            value={user?.email || ''}
            disabled
            margin="normal"
            helperText="Email cannot be changed"
          />
          <TextField
            fullWidth
            label="Full Name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (validationErrors.fullName) {
                setValidationErrors(prev => ({ ...prev, fullName: '' }));
              }
            }}
            required
            disabled={loading}
            margin="normal"
            error={!!validationErrors.fullName}
            helperText={validationErrors.fullName}
          />
          <TextField
            fullWidth
            label="Phone"
            value={phone}
            onChange={handlePhoneChange}
            disabled={loading}
            margin="normal"
            placeholder="(555) 123-4567"
            error={!!validationErrors.phone}
            helperText={validationErrors.phone || 'Optional: Format (XXX) XXX-XXXX'}
          />
          <TextField
            fullWidth
            label="Address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (validationErrors.address) {
                setValidationErrors(prev => ({ ...prev, address: '' }));
              }
            }}
            disabled={loading}
            margin="normal"
            multiline
            rows={2}
            placeholder="123 Main St, City, State ZIP"
            error={!!validationErrors.address}
            helperText={validationErrors.address || 'Optional: Your full address'}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
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
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;
