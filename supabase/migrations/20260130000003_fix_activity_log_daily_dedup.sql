DROP INDEX IF EXISTS idx_unique_activity_reference;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_activity_reference_daily
ON public.user_activity_log(user_id, activity_type, reference_id, (metadata->>'date'))
WHERE reference_id IS NOT NULL;
