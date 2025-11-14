import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose, defaultTab = 'login' }) => {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'login' | 'register') => {
    setTab(newValue);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      onClose();
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(registerEmail, registerPassword, registerName);
      onClose();
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterName('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Login" value="login" />
          <Tab label="Register" value="register" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tab === 'login' ? (
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              disabled={loading}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              disabled={loading}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            <Typography variant="body2" color="text.secondary" align="center">
              Don't have an account?{' '}
              <Button onClick={() => setTab('register')} size="small">
                Register here
              </Button>
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              required
              disabled={loading}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
              disabled={loading}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
              disabled={loading}
              margin="normal"
              helperText="At least 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Typography variant="body2" color="text.secondary" align="center">
              Already have an account?{' '}
              <Button onClick={() => setTab('login')} size="small">
                Login here
              </Button>
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
