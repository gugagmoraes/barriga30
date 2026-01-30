DROP INDEX IF EXISTS public.idx_unique_activity_reference;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_activity_reference_daily
ON public.user_activity_log(user_id, activity_type, reference_id, (metadata->>'date'))
WHERE reference_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.complete_workout(p_workout_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_today date;
  v_level text;
  v_type text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'unauthorized');
  END IF;

  v_today := (NOW() AT TIME ZONE 'utc')::date;

  SELECT level, type INTO v_level, v_type
  FROM public.workouts
  WHERE id = p_workout_id;

  IF v_level IS NULL THEN v_level := 'beginner'; END IF;
  IF v_type IS NULL THEN v_type := 'A'; END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_activity_log
    WHERE user_id = v_user_id
      AND activity_type = 'workout_completed'
      AND reference_id = p_workout_id
      AND (metadata->>'date') = v_today::text
  ) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'duplicate');
  END IF;

  INSERT INTO public.user_activity_log (user_id, activity_type, reference_id, xp_earned, metadata, created_at)
  VALUES (
    v_user_id,
    'workout_completed',
    p_workout_id,
    50,
    jsonb_build_object(
      'workoutId', p_workout_id,
      'date', v_today::text,
      'level', v_level,
      'type', v_type
    ),
    NOW()
  );

  RETURN jsonb_build_object('success', true, 'xp', 50);
END;
$$;

REVOKE ALL ON FUNCTION public.complete_workout(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_workout(uuid) TO authenticated;
