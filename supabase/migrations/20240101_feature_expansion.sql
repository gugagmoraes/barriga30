-- 1. Update Workouts
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('A', 'B', 'C'));

-- 2. Diet Preferences (Mini-Onboarding)
CREATE TABLE IF NOT EXISTS public.diet_preferences (
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    weight numeric,
    height numeric,
    age int,
    gender text,
    workout_frequency text,
    workout_duration text,
    food_preferences jsonb,
    water_bottle_size_ml int,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.diet_preferences ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diet_preferences' AND policyname = 'Users can view own diet preferences') THEN
        CREATE POLICY "Users can view own diet preferences" ON public.diet_preferences FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diet_preferences' AND policyname = 'Users can insert own diet preferences') THEN
        CREATE POLICY "Users can insert own diet preferences" ON public.diet_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diet_preferences' AND policyname = 'Users can update own diet preferences') THEN
        CREATE POLICY "Users can update own diet preferences" ON public.diet_preferences FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Daily Tracking
CREATE TABLE IF NOT EXISTS public.daily_tracking (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    water_ml int DEFAULT 0,
    meals_completed int DEFAULT 0,
    workout_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

ALTER TABLE public.daily_tracking ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_tracking' AND policyname = 'Users can view own tracking') THEN
        CREATE POLICY "Users can view own tracking" ON public.daily_tracking FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_tracking' AND policyname = 'Users can insert own tracking') THEN
        CREATE POLICY "Users can insert own tracking" ON public.daily_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_tracking' AND policyname = 'Users can update own tracking') THEN
        CREATE POLICY "Users can update own tracking" ON public.daily_tracking FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Measurements (Progress)
CREATE TABLE IF NOT EXISTS public.measurements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    waist numeric,
    hips numeric,
    thigh numeric,
    arm numeric,
    bust numeric,
    recorded_at timestamptz DEFAULT now()
);

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'measurements' AND policyname = 'Users can view own measurements') THEN
        CREATE POLICY "Users can view own measurements" ON public.measurements FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'measurements' AND policyname = 'Users can insert own measurements') THEN
        CREATE POLICY "Users can insert own measurements" ON public.measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
