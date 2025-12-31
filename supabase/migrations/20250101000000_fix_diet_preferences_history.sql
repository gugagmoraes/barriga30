-- Migration to allow history in diet_preferences
-- 1. Drop the existing primary key (which was user_id)
ALTER TABLE public.diet_preferences DROP CONSTRAINT diet_preferences_pkey;

-- 2. Add a new ID column as Primary Key
ALTER TABLE public.diet_preferences ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY;

-- 3. Add is_active column for versioning
ALTER TABLE public.diet_preferences ADD COLUMN is_active boolean DEFAULT true;

-- 4. Create index for faster lookup of active preferences
CREATE INDEX IF NOT EXISTS idx_diet_preferences_user_active ON public.diet_preferences(user_id, is_active);
