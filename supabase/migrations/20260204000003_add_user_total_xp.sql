ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- Optional: Migrate existing xp from user_stats if needed, but keeping it simple for now as requested.
-- UPDATE public.users SET total_xp = (SELECT total_xp FROM public.user_stats WHERE user_stats.user_id = users.id);
