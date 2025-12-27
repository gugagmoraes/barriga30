-- Create diet snapshots table (Instances of diets assigned to users)
CREATE TABLE diet_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  origin VARCHAR(50) CHECK (origin IN ('template_fallback', 'ai_generated', 'manual_assignment')),
  name VARCHAR(255) NOT NULL, -- e.g., "Minha Dieta Inicial" or "Plano Básico"
  daily_calories INTEGER NOT NULL,
  macros JSONB, -- Optional: { protein: 150, carbs: 200, fat: 60 }
  is_active BOOLEAN DEFAULT true, -- Only one active per user ideally
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create snapshot meals (Specific to a snapshot)
CREATE TABLE snapshot_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_snapshot_id UUID REFERENCES diet_snapshots(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., "Café da Manhã"
  order_index INTEGER NOT NULL,
  time_of_day TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create snapshot items (Specific foods in a meal)
CREATE TABLE snapshot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_meal_id UUID REFERENCES snapshot_meals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity VARCHAR(100),
  calories INTEGER,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE diet_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diet snapshots" ON diet_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own snapshot meals" ON snapshot_meals FOR SELECT USING (
  EXISTS (SELECT 1 FROM diet_snapshots s WHERE s.id = snapshot_meals.diet_snapshot_id AND s.user_id = auth.uid())
);
CREATE POLICY "Users can view own snapshot items" ON snapshot_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM snapshot_meals m 
    JOIN diet_snapshots s ON s.id = m.diet_snapshot_id 
    WHERE m.id = snapshot_items.snapshot_meal_id AND s.user_id = auth.uid()
  )
);

-- Function to Clone a Template into a Snapshot for a User
CREATE OR REPLACE FUNCTION generate_initial_diet_snapshot(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  template_id UUID;
  new_snapshot_id UUID;
  meal_record RECORD;
  new_meal_id UUID;
  item_record RECORD;
BEGIN
  -- 1. Find the Basic Template (Hardcoded fallback for MVP)
  SELECT id INTO template_id FROM diet_plans WHERE name = 'Plano Básico de Perda de Peso' LIMIT 1;
  
  IF template_id IS NULL THEN
    RAISE EXCEPTION 'Template Basic Plan not found';
  END IF;

  -- 2. Deactivate any existing active snapshots for this user
  UPDATE diet_snapshots SET is_active = false WHERE user_id = target_user_id;

  -- 3. Create the Snapshot
  INSERT INTO diet_snapshots (user_id, origin, name, daily_calories, is_active)
  SELECT target_user_id, 'template_fallback', name, daily_calories, true
  FROM diet_plans WHERE id = template_id
  RETURNING id INTO new_snapshot_id;

  -- 4. Loop through Meals and Clone
  FOR meal_record IN SELECT * FROM meals WHERE diet_plan_id = template_id ORDER BY order_index LOOP
    INSERT INTO snapshot_meals (diet_snapshot_id, name, order_index, time_of_day)
    VALUES (new_snapshot_id, meal_record.name, meal_record.order_index, meal_record.time_of_day)
    RETURNING id INTO new_meal_id;

    -- 5. Loop through Items and Clone
    FOR item_record IN SELECT * FROM meal_items WHERE meal_id = meal_record.id LOOP
      INSERT INTO snapshot_items (snapshot_meal_id, name, quantity, calories, category)
      VALUES (new_meal_id, item_record.name, item_record.quantity, item_record.calories, item_record.category);
    END LOOP;
  END LOOP;

  RETURN new_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
