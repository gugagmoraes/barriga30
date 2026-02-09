-- Atualizar URLs dos vídeos de treino para os novos links da Bunny.net

-- Iniciante A
UPDATE workouts 
SET video_url = 'https://player.mediadelivery.net/embed/596490/6f95ded6-a3d2-4f96-808d-a745ae0afa2e'
WHERE title = 'Treino A' AND level = 'beginner';

-- Iniciante B
UPDATE workouts 
SET video_url = 'https://player.mediadelivery.net/embed/596490/74dcf17d-7f36-41a3-adba-a2665b05fa45'
WHERE title = 'Treino B' AND level = 'beginner';

-- Iniciante C
UPDATE workouts 
SET video_url = 'https://player.mediadelivery.net/embed/596490/ef0039f1-df26-4574-bda3-bb4663751ccb'
WHERE title = 'Treino C' AND level = 'beginner';

-- Intermediário A
UPDATE workouts 
SET video_url = 'https://player.mediadelivery.net/embed/596490/e302e40c-e48c-411d-b820-cfdfec351270'
WHERE title = 'Treino A' AND level = 'intermediate';

-- Intermediário B
UPDATE workouts 
SET video_url = 'https://player.mediadelivery.net/embed/596490/abad7ab5-0b68-4172-adb5-09e260367fbc'
WHERE title = 'Treino B' AND level = 'intermediate';

-- Intermediário C
UPDATE workouts 
SET video_url = 'https://player.mediadelivery.net/embed/596490/777ef8ed-3946-4a6e-a6f8-10476e4888af'
WHERE title = 'Treino C' AND level = 'intermediate';

-- Avançado A
UPDATE workouts 
SET video_url = 'https://player.mediadelivery.net/embed/596490/0535c9ae-80c5-4ad3-b326-deb7d82a1e18'
WHERE title = 'Treino A' AND level = 'advanced';

-- Avançado B
UPDATE workouts 
SET video_url = 'https://player.mediadelivery.net/embed/596490/11c2e7cb-c5a7-4c87-a84f-4af64dfde8fc'
WHERE title = 'Treino B' AND level = 'advanced';

-- Avançado C
UPDATE workouts 
SET video_url = 'https://player.mediadelivery.net/embed/596490/4e01329b-8b2e-41c3-8400-4f21374c6050'
WHERE title = 'Treino C' AND level = 'advanced';
