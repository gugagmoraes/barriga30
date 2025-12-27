-- Create diet plans table
CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  daily_calories INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meals table (Breakfast, Lunch, etc)
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., "Café da Manhã"
  order_index INTEGER NOT NULL, -- To sort meals correctly
  time_of_day TIME, -- Optional suggested time
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal items (The actual food)
CREATE TABLE meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "Ovos mexidos"
  quantity VARCHAR(100), -- e.g., "2 unidades"
  calories INTEGER, -- Optional approximate calories
  category VARCHAR(50), -- e.g., "protein", "carb", "veg" - useful for shopping list
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assign diet plan to user
ALTER TABLE users ADD COLUMN current_diet_plan_id UUID REFERENCES diet_plans(id);

-- Policies
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view active diet plans (or at least authenticated users)
CREATE POLICY "Authenticated users can view diet plans" ON diet_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view meals" ON meals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view meal items" ON meal_items FOR SELECT TO authenticated USING (true);

-- Seed Initial Diet (The one hardcoded in the MVP)
INSERT INTO diet_plans (name, description, daily_calories, is_active)
VALUES ('Plano Básico de Perda de Peso', 'Dieta balanceada com foco em déficit calórico moderado.', 1600, true);

-- We need to get the ID of the inserted plan to seed meals. 
-- In a real migration script we might use DO block, but for simplicity here we'll assume we can query it or just insert.
-- Since this is a migration file run by Supabase, let's use a DO block to be safe and clean.

DO $$
DECLARE
  plan_id UUID;
  breakfast_id UUID;
  lunch_id UUID;
  snack_id UUID;
  dinner_id UUID;
BEGIN
  -- Get the plan ID we just inserted (or insert if not exists, but we just inserted)
  SELECT id INTO plan_id FROM diet_plans WHERE name = 'Plano Básico de Perda de Peso' LIMIT 1;

  -- Insert Meals
  INSERT INTO meals (diet_plan_id, name, order_index) VALUES (plan_id, 'Café da Manhã', 1) RETURNING id INTO breakfast_id;
  INSERT INTO meals (diet_plan_id, name, order_index) VALUES (plan_id, 'Almoço', 2) RETURNING id INTO lunch_id;
  INSERT INTO meals (diet_plan_id, name, order_index) VALUES (plan_id, 'Lanche', 3) RETURNING id INTO snack_id;
  INSERT INTO meals (diet_plan_id, name, order_index) VALUES (plan_id, 'Jantar', 4) RETURNING id INTO dinner_id;

  -- Insert Items for Breakfast
  INSERT INTO meal_items (meal_id, name, quantity, category) VALUES 
  (breakfast_id, 'Ovos mexidos', '2 unidades', 'Proteínas'),
  (breakfast_id, 'Pão integral', '1 fatia', 'Mercearia'),
  (breakfast_id, 'Café sem açúcar', '1 xícara', 'Bebidas');

  -- Insert Items for Lunch
  INSERT INTO meal_items (meal_id, name, quantity, category) VALUES 
  (lunch_id, 'Frango grelhado', '100g', 'Proteínas'),
  (lunch_id, 'Arroz integral', '3 colheres de sopa', 'Mercearia'),
  (lunch_id, 'Salada verde', 'À vontade', 'Hortifruti');

  -- Insert Items for Snack
  INSERT INTO meal_items (meal_id, name, quantity, category) VALUES 
  (snack_id, 'Fruta (Maçã ou Pera)', '1 unidade', 'Hortifruti'),
  (snack_id, 'Castanhas', '5 unidades', 'Mercearia');

  -- Insert Items for Dinner
  INSERT INTO meal_items (meal_id, name, quantity, category) VALUES 
  (dinner_id, 'Omelete de espinafre', '2 ovos', 'Proteínas'),
  (dinner_id, 'Salada de tomate', '1 unidade', 'Hortifruti');

END $$;
