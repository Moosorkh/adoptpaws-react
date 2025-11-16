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
  ListItemIcon
} from '@mui/material';
import {
  Settings,
  Notifications,
  Email,
  DarkMode,
  Language
} from '@mui/icons-material';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedEmailNotif = localStorage.getItem('emailNotifications');
    const savedPushNotif = localStorage.getItem('pushNotifications');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedEmailNotif !== null) setEmailNotifications(savedEmailNotif === 'true');
    if (savedPushNotif !== null) setPushNotifications(savedPushNotif === 'true');
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
  }, [open]);

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    localStorage.setItem('emailNotifications', String(checked));
  };

  const handlePushNotificationsChange = (checked: boolean) => {
    setPushNotifications(checked);
    localStorage.setItem('pushNotifications', String(checked));
  };

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem('darkMode', String(checked));
    // You can emit an event here or use a context to actually apply dark mode
    window.dispatchEvent(new CustomEvent('darkModeChange', { detail: checked }));
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
                  onChange={(e) => handleEmailNotificationsChange(e.target.checked)}
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
                  onChange={(e) => handlePushNotificationsChange(e.target.checked)}
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
                  onChange={(e) => handleDarkModeChange(e.target.checked)}
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#96BBBB',
            '&:hover': { bgcolor: '#3E4E50' }
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
