-- Add workout_level to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS workout_level VARCHAR(20) CHECK (workout_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';

-- Update get_weekly_ranking to use plan_type instead of plan
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
    u.plan_type::TEXT as plan,
    COALESCE(SUM(l.xp_earned), 0)
  FROM users u
  LEFT JOIN user_activity_log l ON u.id = l.user_id 
    AND l.created_at >= date_trunc('week', NOW())
  GROUP BY u.id
  ORDER BY COALESCE(SUM(l.xp_earned), 0) DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
