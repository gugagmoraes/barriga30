-- Create Gamification Tables

-- 1. Levels Configuration (Static Data)
CREATE TABLE levels (
  level INTEGER PRIMARY KEY,
  min_xp INTEGER NOT NULL,
  title VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Levels
INSERT INTO levels (level, min_xp, title) VALUES
(1, 0, 'Iniciante'),
(2, 100, 'Focado'),
(3, 300, 'Persistente'),
(4, 600, 'Atleta'),
(5, 1000, 'Mestre'),
(6, 1500, 'Lenda'); -- Expansível depois

-- 2. User Stats (Aggregated Snapshot)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Activity Log (Event Source)
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) CHECK (activity_type IN ('workout_completed', 'diet_checked', 'water_logged', 'daily_login')),
  reference_id UUID, -- ID of the workout or meal log if applicable
  xp_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB, -- Extra info
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_activity_log_user_date ON user_activity_log(user_id, created_at);
CREATE INDEX idx_activity_log_reference ON user_activity_log(reference_id) WHERE reference_id IS NOT NULL;

-- Protection against duplicate events (Optional constraint)
-- For example, prevent completing the SAME workout ID multiple times? 
-- Or maybe we allow repeating workouts but want to prevent double-click submissions?
-- Let's add a unique constraint on (user_id, activity_type, reference_id) ONLY if reference_id is provided.
CREATE UNIQUE INDEX idx_unique_activity_reference 
ON user_activity_log(user_id, activity_type, reference_id) 
WHERE reference_id IS NOT NULL;


-- 4. Trigger to Update User Stats automatically
CREATE OR REPLACE FUNCTION update_user_stats_on_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_date DATE;
  last_date DATE;
  new_streak INTEGER;
  new_level INTEGER;
BEGIN
  activity_date := NEW.created_at::DATE;
  
  -- Get current stats (lock row for update)
  SELECT last_activity_date, current_streak INTO last_date, new_streak 
  FROM user_stats WHERE user_id = NEW.user_id FOR UPDATE;

  -- If no stats exist, create them
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, current_streak, longest_streak, total_xp, level, last_activity_date)
    VALUES (NEW.user_id, 1, 1, NEW.xp_earned, 1, activity_date);
    RETURN NEW;
  END IF;

  -- Calculate Streak
  IF last_date = activity_date THEN
    -- Same day, streak doesn't change
    new_streak := new_streak; 
  ELSIF last_date = activity_date - 1 THEN
    -- Consecutive day, increment streak
    new_streak := new_streak + 1;
  ELSE
    -- Missed a day (or more), reset to 1
    new_streak := 1;
  END IF;

  -- Calculate Level based on new Total XP
  SELECT level INTO new_level FROM levels 
  WHERE min_xp <= (SELECT total_xp + NEW.xp_earned FROM user_stats WHERE user_id = NEW.user_id)
  ORDER BY level DESC LIMIT 1;

  -- Update Stats
  UPDATE user_stats
  SET 
    total_xp = total_xp + NEW.xp_earned,
    current_streak = new_streak,
    longest_streak = GREATEST(longest_streak, new_streak),
    last_activity_date = activity_date,
    level = COALESCE(new_level, level),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_gamification_stats
AFTER INSERT ON user_activity_log
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_activity();

-- RLS Policies
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read levels" ON levels FOR SELECT USING (true);
CREATE POLICY "Users read own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own activity" ON user_activity_log FOR SELECT USING (auth.uid() = user_id);

-- Only system/functions should insert into activity log usually, but if we do client-side logging (not recommended for XP)
-- ideally we wrap activity logging in Server Actions (which bypass RLS or use Service Role).
-- But for transparency, let's allow read-only for now on log.
