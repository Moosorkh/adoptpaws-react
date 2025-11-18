-- Add dark_mode_enabled column to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS dark_mode_enabled BOOLEAN DEFAULT true;
