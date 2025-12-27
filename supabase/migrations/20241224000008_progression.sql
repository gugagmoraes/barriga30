-- 1. Update Users Table for Plans and Progression
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(20) CHECK (plan IN ('basic', 'plus', 'vip')) DEFAULT 'basic';
ALTER TABLE users ADD COLUMN IF NOT EXISTS workout_level VARCHAR(20) CHECK (workout_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';
ALTER TABLE users ADD COLUMN IF NOT EXISTS critical_mode_active BOOLEAN DEFAULT false;

-- 2. Formalize Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  type VARCHAR(1) CHECK (type IN ('A', 'B', 'C')) NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  video_url TEXT, -- Placeholder for future
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Seed Workouts (The Matrix: 3 Levels x 3 Types)
INSERT INTO workouts (name, level, type, duration_minutes) VALUES
-- Beginner
('Iniciante A - Full Body', 'beginner', 'A', 20),
('Iniciante B - Cardio Leve', 'beginner', 'B', 20),
('Iniciante C - Core & Postura', 'beginner', 'C', 20),
-- Intermediate
('Intermediário A - Força', 'intermediate', 'A', 30),
('Intermediário B - HIIT', 'intermediate', 'B', 30),
('Intermediário C - Pernas', 'intermediate', 'C', 30),
-- Advanced
('Avançado A - Hipertrofia', 'advanced', 'A', 45),
('Avançado B - Cardio Intenso', 'advanced', 'B', 45),
('Avançado C - Desafio Total', 'advanced', 'C', 45);

-- 4. Weekly Ranking View
-- Efficiently calculates XP earned in the current week (Monday to Sunday)
CREATE OR REPLACE VIEW weekly_ranking AS
SELECT 
  u.id as user_id,
  u.name,
  u.plan, -- needed for VIP highlight
  u.avatar_url, -- future use
  COALESCE(SUM(l.xp_earned), 0) as weekly_xp
FROM users u
LEFT JOIN user_activity_log l ON u.id = l.user_id 
  AND l.created_at >= date_trunc('week', NOW())
GROUP BY u.id
ORDER BY weekly_xp DESC;

-- RLS Update
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read workouts" ON workouts FOR SELECT USING (true);

-- Allow reading ranking
-- Note: Views inherit permissions of underlying tables usually, but RLS on views is tricky.
-- For MVP, we can query the view directly if we grant access, or just query the tables.
-- Let's stick to querying tables via Supabase Client for safety or create a secure function.
-- Actually, simple SELECT on view works if RLS policies on underlying tables allow it.
-- But user_activity_log has "Users read own activity" policy. 
-- This prevents seeing OTHER users' XP for ranking.
-- FIX: We need a "Public Read XP" policy for ranking purposes or a Security Definer function.

CREATE OR REPLACE FUNCTION get_weekly_ranking()
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  plan TEXT,
  weekly_xp BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.name, 'Usuário'),
    u.plan::TEXT,
    COALESCE(SUM(l.xp_earned), 0)
  FROM users u
  LEFT JOIN user_activity_log l ON u.id = l.user_id 
    AND l.created_at >= date_trunc('week', NOW())
  GROUP BY u.id
  ORDER BY COALESCE(SUM(l.xp_earned), 0) DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
