-- Add Slack channel ID to glow_girls for pod integration
ALTER TABLE glow_girls ADD COLUMN IF NOT EXISTS slack_channel_id text;
