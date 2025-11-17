import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Settings,
  Notifications,
  Email,
  DarkMode,
  Language,
  Sms,
  Campaign
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const { darkMode, toggleDarkMode } = useThemeMode();
  const { token, isAuthenticated } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (open && isAuthenticated && token) {
      fetchPreferences();
    }
  }, [open, isAuthenticated, token]);

  const fetchPreferences = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.email_notifications ?? true);
        setPushNotifications(data.push_notifications ?? true);
        setSmsNotifications(data.sms_notifications ?? false);
        setMarketingEmails(data.marketing_emails ?? false);
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) {
      setError('Please log in to save preferences');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          sms_notifications: smsNotifications,
          marketing_emails: marketingEmails
        })
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError('Failed to save preferences');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Settings sx={{ color: '#96BBBB' }} />
          <Typography variant="h6">Settings</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading && !saveSuccess && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Preferences saved successfully!
          </Alert>
        )}
        
        {!loading && !saveSuccess && (
          <List>
            {/* Notifications Section */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1 }}>
              Notifications
            </Typography>
            <ListItem>
              <ListItemIcon>
                <Email sx={{ color: '#96BBBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive email updates about your adoption requests"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    color="primary"
                  />
                }
                label=""
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Notifications sx={{ color: '#96BBBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Push Notifications"
                secondary="Get notified about new messages and updates"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    color="primary"
                  />
                }
                label=""
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Sms sx={{ color: '#96BBBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="SMS Notifications"
                secondary="Receive important updates via text message"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    color="primary"
                  />
                }
                label=""
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Campaign sx={{ color: '#96BBBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Marketing Emails"
                secondary="Get updates about new pets and special events"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                    color="primary"
                  />
                }
                label=""
              />
            </ListItem>

            <Divider sx={{ my: 2 }} />

            {/* Appearance Section */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1 }}>
              Appearance
            </Typography>
            <ListItem>
              <ListItemIcon>
                <DarkMode sx={{ color: '#96BBBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Dark Mode"
                secondary="Switch between light and dark theme"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    color="primary"
                  />
                }
                label=""
              />
            </ListItem>

            <Divider sx={{ my: 2 }} />

            {/* Language Section */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1 }}>
              Language & Region
            </Typography>
            <ListItem>
              <ListItemIcon>
                <Language sx={{ color: '#96BBBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Language"
                secondary="English (US)"
              />
            </ListItem>
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !isAuthenticated}
          sx={{
            bgcolor: '#96BBBB',
            '&:hover': { bgcolor: '#3E4E50' }
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
