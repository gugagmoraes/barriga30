ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS video_url text;

UPDATE public.workouts
SET video_url = 'https://player.mediadelivery.net/embed/586050/1dcf6779-1ae3-497c-a99d-84c1c38a4c50'
WHERE name = 'Treino C - Avançado'
  AND (video_url IS NULL OR video_url = '');
