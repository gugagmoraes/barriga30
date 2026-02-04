ALTER TABLE public.daily_tracking 
ADD COLUMN IF NOT EXISTS meals_data JSONB DEFAULT '{}'::jsonb;
