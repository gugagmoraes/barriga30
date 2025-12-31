create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  diet_snapshot_id uuid not null references public.diet_snapshots(id) on delete cascade,
  period text not null check (period in ('weekly','monthly')),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.shopping_list_items (
  id bigserial primary key,
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  name text not null,
  unit text not null,
  quantity numeric not null,
  created_at timestamptz not null default now()
);

