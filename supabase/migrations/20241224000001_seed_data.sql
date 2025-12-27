-- Seed Plans
INSERT INTO plans (name, price, stripe_price_id, features, is_active)
VALUES
('Basic', 29.00, 'price_basic_placeholder', '["Acesso aos treinos", "Dieta padrão", "Lista de compras"]'::jsonb, true),
('Plus', 49.00, 'price_plus_placeholder', '["Tudo do Básico", "Gamificação completa", "Histórico de fotos", "Suporte prioritário"]'::jsonb, true),
('VIP', 97.00, 'price_vip_placeholder', '["Tudo do Plus", "Acesso antecipado", "Badges exclusivos", "Grupo VIP"]'::jsonb, true);

-- Seed Workouts (Beginner)
INSERT INTO workouts (name, level, duration_minutes, video_url, exercises, is_active)
VALUES
('Iniciante 1: Core Básico', 'beginner', 30, 'https://www.youtube.com/watch?v=sample1', 
 '[
   {"name": "Abdominal Supra", "duration": 45, "rest": 15},
   {"name": "Prancha Isométrica", "duration": 30, "rest": 30},
   {"name": "Elevação Pélvica", "duration": 45, "rest": 15}
 ]'::jsonb, true),
('Iniciante 2: Queima Leve', 'beginner', 30, 'https://www.youtube.com/watch?v=sample2', 
 '[
   {"name": "Polichinelo", "duration": 45, "rest": 15},
   {"name": "Agachamento Livre", "duration": 45, "rest": 15},
   {"name": "Abdominal Infra", "duration": 45, "rest": 15}
 ]'::jsonb, true),
('Iniciante 3: Fortalecimento', 'beginner', 30, 'https://www.youtube.com/watch?v=sample3', 
 '[
   {"name": "Flexão de Braço (Joelho)", "duration": 30, "rest": 30},
   {"name": "Perdigueiro", "duration": 45, "rest": 15},
   {"name": "Abdominal Remador", "duration": 45, "rest": 15}
 ]'::jsonb, true);

-- Seed Workouts (Intermediate)
INSERT INTO workouts (name, level, duration_minutes, video_url, exercises, is_active)
VALUES
('Intermediário 1: Hiit Abdominal', 'intermediate', 30, 'https://www.youtube.com/watch?v=sample4', 
 '[
   {"name": "Mountain Climber", "duration": 45, "rest": 15},
   {"name": "Prancha Dinâmica", "duration": 45, "rest": 15},
   {"name": "Abdominal Bicicleta", "duration": 45, "rest": 15}
 ]'::jsonb, true),
('Intermediário 2: Queima Total', 'intermediate', 30, 'https://www.youtube.com/watch?v=sample5', 
 '[
   {"name": "Burpee Adaptado", "duration": 40, "rest": 20},
   {"name": "Agachamento com Salto", "duration": 40, "rest": 20},
   {"name": "Abdominal Canivete", "duration": 40, "rest": 20}
 ]'::jsonb, true),
('Intermediário 3: Core de Ferro', 'intermediate', 30, 'https://www.youtube.com/watch?v=sample6', 
 '[
   {"name": "Prancha Lateral", "duration": 30, "rest": 30},
   {"name": "Russian Twist", "duration": 45, "rest": 15},
   {"name": "Abdominal Invertido", "duration": 45, "rest": 15}
 ]'::jsonb, true);

-- Seed Workouts (Advanced)
INSERT INTO workouts (name, level, duration_minutes, video_url, exercises, is_active)
VALUES
('Avançado 1: Six Pack Attack', 'advanced', 30, 'https://www.youtube.com/watch?v=sample7', 
 '[
   {"name": "Dragon Flag (Adaptado)", "duration": 45, "rest": 15},
   {"name": "Toes to Bar (Chão)", "duration": 45, "rest": 15},
   {"name": "Prancha Serra", "duration": 60, "rest": 15}
 ]'::jsonb, true),
('Avançado 2: Derrete Gordura', 'advanced', 30, 'https://www.youtube.com/watch?v=sample8', 
 '[
   {"name": "Burpee Completo", "duration": 50, "rest": 10},
   {"name": "Mountain Climber Cruzado", "duration": 50, "rest": 10},
   {"name": "Abdominal V-Up", "duration": 50, "rest": 10}
 ]'::jsonb, true),
('Avançado 3: Desafio 30 Dias', 'advanced', 30, 'https://www.youtube.com/watch?v=sample9', 
 '[
   {"name": "Hollow Body Hold", "duration": 60, "rest": 30},
   {"name": "L-Sit (Chão)", "duration": 30, "rest": 30},
   {"name": "Abdominal Grupado Suspenso", "duration": 45, "rest": 15}
 ]'::jsonb, true);
