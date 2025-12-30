-- Tabela de Snapshots (A dieta congelada do usuário)
CREATE TABLE IF NOT EXISTS public.diet_snapshots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    origin text DEFAULT 'ai_generated', -- 'template', 'ai', 'manual'
    name text DEFAULT 'Minha Dieta',
    daily_calories numeric NOT NULL,
    macros jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Tabela de Refeições do Snapshot
CREATE TABLE IF NOT EXISTS public.snapshot_meals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    diet_snapshot_id uuid REFERENCES public.diet_snapshots(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL, -- "Café da Manhã", "Almoço"
    order_index int NOT NULL,
    time_of_day text,
    created_at timestamptz DEFAULT now()
);

-- Tabela de Itens (Alimentos) do Snapshot
CREATE TABLE IF NOT EXISTS public.snapshot_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_meal_id uuid REFERENCES public.snapshot_meals(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    quantity text, -- "2 ovos", "100g"
    calories numeric,
    category text, -- "protein", "carb", "fat", "veg"
    created_at timestamptz DEFAULT now()
);

-- Segurança RLS
ALTER TABLE public.diet_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snapshot_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snapshot_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own snapshots" ON public.diet_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snapshots" ON public.diet_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snapshots" ON public.diet_snapshots FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own meals" ON public.snapshot_meals 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.diet_snapshots s WHERE s.id = snapshot_meals.diet_snapshot_id AND s.user_id = auth.uid()));

CREATE POLICY "Users can view own items" ON public.snapshot_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.snapshot_meals m JOIN public.diet_snapshots s ON m.diet_snapshot_id = s.id WHERE m.id = snapshot_items.snapshot_meal_id AND s.user_id = auth.uid()));

-- Permitir inserção em cascata (simplificado para o service role ou user owner)
CREATE POLICY "Users can insert own meals" ON public.snapshot_meals 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.diet_snapshots s WHERE s.id = diet_snapshot_id AND s.user_id = auth.uid()));

CREATE POLICY "Users can insert own items" ON public.snapshot_items 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.snapshot_meals m JOIN public.diet_snapshots s ON m.diet_snapshot_id = s.id WHERE m.id = snapshot_meal_id AND s.user_id = auth.uid()));
