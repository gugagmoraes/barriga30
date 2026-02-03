-- Remove the problematic "manage" policy that overrides specific insert policies
-- This policy had a USING clause but no WITH CHECK clause for INSERT, causing silent failures.
DROP POLICY IF EXISTS "Users can manage own diet preferences" ON public.diet_preferences;
