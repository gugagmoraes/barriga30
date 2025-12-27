-- Create tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  age INTEGER CHECK (age > 0 AND age < 120),
  height DECIMAL(5,2) CHECK (height > 0),
  weight DECIMAL(5,2) CHECK (weight > 0),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  stripe_price_id VARCHAR(255) UNIQUE,
  price DECIMAL(10, 2),
  features JSONB,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  video_url TEXT,
  exercises JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  points_earned INTEGER DEFAULT 10,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(50) CHECK (photo_type IN ('before', 'after', 'progress')),
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE weight_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX idx_workouts_level ON workouts(level);
CREATE INDEX idx_workouts_active ON workouts(is_active);
CREATE INDEX idx_workout_completions_user_id ON workout_completions(user_id);
CREATE INDEX idx_workout_completions_workout_id ON workout_completions(workout_id);
CREATE INDEX idx_workout_completions_completed_at ON workout_completions(completed_at DESC);
CREATE INDEX idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX idx_progress_photos_type ON progress_photos(photo_type);
CREATE INDEX idx_weight_records_user_id ON weight_records(user_id);
CREATE INDEX idx_weight_records_recorded_at ON weight_records(recorded_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
-- Need a policy to insert profile on signup? Usually handled via trigger or direct insert if using service role, but if client side, need insert policy.
-- The architecture says "Registration Method: Email registration". Usually creates auth.users entry. We need a trigger to create public.users or allow insert.
-- Let's add an insert policy for authenticated users to create their own profile matching their ID.
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);


-- Plans policies
CREATE POLICY "Anyone can view active plans" ON plans FOR SELECT USING (is_active = true);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Anyone can view active workouts" ON workouts FOR SELECT USING (is_active = true);
-- Admin policy placeholder (Supabase uses service role bypass usually, or checking app metadata role)
-- CREATE POLICY "Admin can manage all workouts" ON workouts FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Workout Completions policies
CREATE POLICY "Users can view own completions" ON workout_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON workout_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Progress Photos policies
CREATE POLICY "Users can view own photos" ON progress_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload own photos" ON progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON progress_photos FOR DELETE USING (auth.uid() = user_id);

-- Weight Records policies
CREATE POLICY "Users can view own weight records" ON weight_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight records" ON weight_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON workouts TO anon;
GRANT SELECT ON plans TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON subscriptions TO authenticated;
GRANT ALL PRIVILEGES ON workout_completions TO authenticated;
GRANT ALL PRIVILEGES ON progress_photos TO authenticated;
GRANT ALL PRIVILEGES ON weight_records TO authenticated;
