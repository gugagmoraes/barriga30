-- SCRIPT FINAL E SEGURO (IDEMPOTENTE)
-- RODE ESTE SCRIPT PARA GARANTIR QUE TUDO ESTEJA CORRETO

-- 1. Tipo de Plano
DO $$ BEGIN
    CREATE TYPE plan_type AS ENUM ('basic', 'plus', 'vip');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabela de Usuários (Garante a criação básica)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Adicionar Colunas na Tabela de Usuários (Garante que existam mesmo se a tabela já existia)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_type plan_type DEFAULT 'basic';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age int;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS height numeric;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS weight numeric;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS activity_level text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS objective text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_diet_plan_id uuid;

-- 4. Habilitar Segurança na Tabela de Usuários
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 5. Trigger de Cadastro Automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, plan_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    COALESCE((new.raw_user_meta_data->>'plan_type')::plan_type, 'basic')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    plan_type = EXCLUDED.plan_type;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Tabela de Regeneração de Dieta (Limites)
CREATE TABLE IF NOT EXISTS public.diet_regenerations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.diet_regenerations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own regeneration logs" ON public.diet_regenerations;
CREATE POLICY "Users can view own regeneration logs" ON public.diet_regenerations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log own regeneration" ON public.diet_regenerations;
CREATE POLICY "Users can log own regeneration" ON public.diet_regenerations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Tabela de Planos de Dieta
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    daily_calories numeric NOT NULL,
    macros jsonb,
    created_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true
);
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own diet plans" ON public.diet_plans;
CREATE POLICY "Users can view own diet plans" ON public.diet_plans FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own diet plans" ON public.diet_plans;
CREATE POLICY "Users can create own diet plans" ON public.diet_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Tabela de Submissões do Quiz
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id),
    session_id text,
    status text,
    responses jsonb,
    version text,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quiz submissions" ON public.quiz_submissions;
CREATE POLICY "Users can view own quiz submissions" ON public.quiz_submissions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own quiz submissions" ON public.quiz_submissions;
CREATE POLICY "Users can create own quiz submissions" ON public.quiz_submissions FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
