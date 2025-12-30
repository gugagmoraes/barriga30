-- 1. Criar tabela public.users se não existir
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Habilitar RLS em users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Criar policies básicas para users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Função para criar perfil automaticamente ao se cadastrar
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
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para disparar a função acima
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- AGORA AS COLUNAS E TIPOS ESPECÍFICOS DO PROJETO
-- ============================================================

-- 6. Criar o tipo ENUM para os planos (se ainda não existir)
DO $$ BEGIN
    CREATE TYPE plan_type AS ENUM ('basic', 'plus', 'vip');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Atualizar a tabela de usuários com campos do Quiz e Plano
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS plan_type plan_type DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS age int,
ADD COLUMN IF NOT EXISTS height numeric,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS activity_level text,
ADD COLUMN IF NOT EXISTS objective text,
ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS current_diet_plan_id uuid;

-- 8. Criar tabela para controlar limites de geração de dieta
CREATE TABLE IF NOT EXISTS public.diet_regenerations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 9. Segurança (RLS) para diet_regenerations
ALTER TABLE public.diet_regenerations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own regeneration logs" ON public.diet_regenerations;
CREATE POLICY "Users can view own regeneration logs" ON public.diet_regenerations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log own regeneration" ON public.diet_regenerations;
CREATE POLICY "Users can log own regeneration" ON public.diet_regenerations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Tabela de Planos de Dieta (Estrutura Básica Necessária)
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
CREATE POLICY "Users can view own diet plans" ON public.diet_plans
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own diet plans" ON public.diet_plans;
CREATE POLICY "Users can create own diet plans" ON public.diet_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. Tabela de Submissões do Quiz
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
CREATE POLICY "Users can view own quiz submissions" ON public.quiz_submissions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own quiz submissions" ON public.quiz_submissions;
CREATE POLICY "Users can create own quiz submissions" ON public.quiz_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

