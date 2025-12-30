-- 1. Criar o tipo ENUM para os planos (se ainda não existir)
DO $$ BEGIN
    CREATE TYPE plan_type AS ENUM ('basic', 'plus', 'vip');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Atualizar a tabela de usuários com campos do Quiz e Plano
-- Adiciona colunas apenas se elas não existirem
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

-- 3. Criar tabela para controlar limites de geração de dieta (Plus/Basic)
CREATE TABLE IF NOT EXISTS public.diet_regenerations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Segurança (RLS)
ALTER TABLE public.diet_regenerations ENABLE ROW LEVEL SECURITY;

-- Remove a policy se já existir para recriar (evita erro de duplicidade)
DROP POLICY IF EXISTS "Users can view own regeneration logs" ON public.diet_regenerations;

CREATE POLICY "Users can view own regeneration logs" ON public.diet_regenerations
  FOR SELECT USING (auth.uid() = user_id);

-- Opcional: Permitir insert pelo próprio usuário (se for via client-side, mas estamos usando server actions com service role em alguns casos, 
-- porém é bom garantir que o usuário autenticado possa inserir se a lógica mudar para client)
DROP POLICY IF EXISTS "Users can log own regeneration" ON public.diet_regenerations;

CREATE POLICY "Users can log own regeneration" ON public.diet_regenerations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
