import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  adoption_updates: boolean;
  message_alerts: boolean;
  dark_mode_enabled: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  marketing_emails: true,
  adoption_updates: true,
  message_alerts: true,
  dark_mode_enabled: true, // Dark mode available by default
};

export const useFeatureFlags = () => {
  const { isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchPreferences = async () => {
    if (!isAuthenticated) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched preferences:', data); // Debug log
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...data,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [isAuthenticated, refetchTrigger]);

  // Listen for preference updates from other components
  useEffect(() => {
    const handlePreferenceUpdate = () => {
      setRefetchTrigger(prev => prev + 1);
    };

    window.addEventListener('preferencesUpdated', handlePreferenceUpdate);
    return () => window.removeEventListener('preferencesUpdated', handlePreferenceUpdate);
  }, []);

  const updatePreference = async (key: keyof UserPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:3001/api/preferences', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ [key]: value }),
        });
      } catch (error) {
        console.error('Error updating preference:', error);
        // Revert on error
        setPreferences(preferences);
      }
    }
  };

  return {
    preferences,
    loading,
    updatePreference,
    // Helper methods for specific features
    isDarkModeEnabled: preferences.dark_mode_enabled,
    isEmailNotificationsEnabled: preferences.email_notifications,
    isPushNotificationsEnabled: preferences.push_notifications,
    isSmsNotificationsEnabled: preferences.sms_notifications,
    isMarketingEmailsEnabled: preferences.marketing_emails,
    isAdoptionUpdatesEnabled: preferences.adoption_updates,
    isMessageAlertsEnabled: preferences.message_alerts,
  };
};
