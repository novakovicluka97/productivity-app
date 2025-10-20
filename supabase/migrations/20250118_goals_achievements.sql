-- Goals and Achievements Migration
-- Created: 2025-01-18
-- Description: Adds goals and achievements tables with RLS policies

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'custom')),
  metric TEXT NOT NULL CHECK (metric IN ('sessions', 'time', 'completion_rate', 'streak')),
  target_value INTEGER NOT NULL CHECK (target_value > 0),
  current_value INTEGER NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed ON goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Row Level Security (RLS) policies

-- Goals table RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own goals
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own goals
CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own goals
CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own goals
CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- User achievements table RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own achievements
CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own achievements (for testing/admin)
CREATE POLICY "Users can delete own achievements"
  ON user_achievements FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on goals table
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE goals IS 'User goals for tracking productivity metrics';
COMMENT ON TABLE user_achievements IS 'Unlocked achievements for users';
COMMENT ON COLUMN goals.type IS 'Goal timeframe: daily, weekly, monthly, or custom';
COMMENT ON COLUMN goals.metric IS 'What is being measured: sessions, time, completion_rate, or streak';
COMMENT ON COLUMN goals.target_value IS 'Target value to achieve the goal';
COMMENT ON COLUMN goals.current_value IS 'Current progress towards the goal';
COMMENT ON COLUMN user_achievements.achievement_id IS 'Reference to achievement definition in application code';
