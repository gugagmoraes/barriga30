-- Create Badges Tables

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL, -- e.g. "first_login", "streak_3"
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Lucide icon name or emoji
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Users read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

-- Seed Initial Badges
INSERT INTO badges (key, title, description, icon) VALUES
('first_login', 'Começou a Jornada', 'Fez o primeiro login no app.', 'rocket'),
('first_workout', 'Primeiro Passo', 'Concluiu o primeiro treino.', 'dumbbell'),
('first_streak', 'Chama Acesa', 'Iniciou seu primeiro dia de streak.', 'flame'),
('streak_3', 'Consistência', 'Manteve o streak por 3 dias seguidos.', 'zap'),
('streak_7', 'Imparável', 'Uma semana inteira de foco!', 'trophy'),
('workouts_5', 'Aquecendo', 'Completou 5 treinos.', 'biceps'),
('workouts_10', 'Atleta', 'Completou 10 treinos.', 'medal');
