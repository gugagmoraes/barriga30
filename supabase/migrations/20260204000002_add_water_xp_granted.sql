ALTER TABLE public.daily_tracking 
ADD COLUMN IF NOT EXISTS water_xp_granted BOOLEAN DEFAULT FALSE;
