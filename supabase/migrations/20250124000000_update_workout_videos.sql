-- Update Beginner Workouts (A, B, C)
UPDATE public.workouts 
SET video_url = 'https://player.mediadelivery.net/embed/586050/bf37d638-b8b3-4082-b4e5-0a8a8e6dd6c3', 
    type = 'A' 
WHERE level = 'beginner' AND (name ILIKE '%Iniciante 1%' OR type = 'A');

UPDATE public.workouts 
SET video_url = 'https://player.mediadelivery.net/embed/586050/2b1b1e72-5b96-4f63-a970-7ca63a7a2ec2', 
    type = 'B' 
WHERE level = 'beginner' AND (name ILIKE '%Iniciante 2%' OR type = 'B');

UPDATE public.workouts 
SET video_url = 'https://player.mediadelivery.net/embed/586050/1f6c44b7-44c7-48bd-b607-08b49f9cf300', 
    type = 'C' 
WHERE level = 'beginner' AND (name ILIKE '%Iniciante 3%' OR type = 'C');

-- Update Intermediate Workouts (A, B, C)
UPDATE public.workouts 
SET video_url = 'https://player.mediadelivery.net/embed/586050/82804691-49fe-4057-acb2-deeaa7a9bd7e', 
    type = 'A' 
WHERE level = 'intermediate' AND (name ILIKE '%Intermediário 1%' OR type = 'A');

UPDATE public.workouts 
SET video_url = 'https://player.mediadelivery.net/embed/586050/f2eb9781-7016-468b-b191-dfd461ded6e8', 
    type = 'B' 
WHERE level = 'intermediate' AND (name ILIKE '%Intermediário 2%' OR type = 'B');

UPDATE public.workouts 
SET video_url = 'https://player.mediadelivery.net/embed/586050/40ba96b5-2c57-48a6-8452-a75c68c64bcf', 
    type = 'C' 
WHERE level = 'intermediate' AND (name ILIKE '%Intermediário 3%' OR type = 'C');

-- Update Advanced Workouts (A, B only - C link was duplicate/ambiguous)
UPDATE public.workouts 
SET video_url = 'https://player.mediadelivery.net/embed/586050/f9d023a5-0aff-4447-a95c-132702365def', 
    type = 'A' 
WHERE level = 'advanced' AND (name ILIKE '%Avançado 1%' OR type = 'A');

UPDATE public.workouts 
SET video_url = 'https://player.mediadelivery.net/embed/586050/633836c3-088e-4ca0-bdf5-34ab5da9bf94', 
    type = 'B' 
WHERE level = 'advanced' AND (name ILIKE '%Avançado 2%' OR type = 'B');

-- Ensure Advanced C has type C (video placeholder or keep existing if any)
UPDATE public.workouts 
SET type = 'C' 
WHERE level = 'advanced' AND (name ILIKE '%Avançado 3%' OR type = 'C');
