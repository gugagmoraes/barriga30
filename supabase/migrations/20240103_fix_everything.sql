-- 1. FIX USERS & AUTH TRIGGER (CRITICAL BLOCKER)
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  avatar_url text,
  plan_type text default 'basic',
  stripe_customer_id text,
  age int,
  gender text,
  weight float,
  height float,
  activity_level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

-- Policies for users
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- Trigger to handle new user signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, plan_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'plan_type', 'basic')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    plan_type = excluded.plan_type;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. FIX DIET TABLES & RLS
create table if not exists public.diet_preferences (
    user_id uuid references public.users(id) on delete cascade not null primary key,
    age int,
    gender text,
    weight float,
    height float,
    workout_frequency text,
    workout_duration text,
    food_preferences jsonb, -- Stores the checklist of proteins, carbs, veg
    water_bottle_size_ml int,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.diet_preferences enable row level security;

drop policy if exists "Users can manage own diet preferences" on public.diet_preferences;
create policy "Users can manage own diet preferences" on public.diet_preferences
    for all using (auth.uid() = user_id);


create table if not exists public.diet_snapshots (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    name text,
    daily_calories int,
    macros jsonb,
    is_active boolean default true,
    origin text,
    created_at timestamptz default now()
);

alter table public.diet_snapshots enable row level security;

drop policy if exists "Users can manage own diet snapshots" on public.diet_snapshots;
create policy "Users can manage own diet snapshots" on public.diet_snapshots
    for all using (auth.uid() = user_id);


create table if not exists public.snapshot_meals (
    id uuid default gen_random_uuid() primary key,
    diet_snapshot_id uuid references public.diet_snapshots(id) on delete cascade not null,
    name text,
    time_of_day text,
    order_index int
);

alter table public.snapshot_meals enable row level security;

-- Policies for meals (cascade from snapshot usually, but RLS needs explicit access)
-- We can link via diet_snapshot_id -> user_id, or just allow if the user owns the snapshot.
-- Simpler: Allow read/write if the user owns the parent snapshot.
-- Performance-wise, a join is fine.
drop policy if exists "Users can manage own meals" on public.snapshot_meals;
create policy "Users can manage own meals" on public.snapshot_meals
    for all using (
        exists (
            select 1 from public.diet_snapshots
            where diet_snapshots.id = snapshot_meals.diet_snapshot_id
            and diet_snapshots.user_id = auth.uid()
        )
    );

create table if not exists public.snapshot_items (
    id uuid default gen_random_uuid() primary key,
    snapshot_meal_id uuid references public.snapshot_meals(id) on delete cascade not null,
    name text,
    quantity text,
    calories int,
    category text
);

alter table public.snapshot_items enable row level security;

drop policy if exists "Users can manage own items" on public.snapshot_items;
create policy "Users can manage own items" on public.snapshot_items
    for all using (
        exists (
            select 1 from public.snapshot_meals
            join public.diet_snapshots on diet_snapshots.id = snapshot_meals.diet_snapshot_id
            where snapshot_meals.id = snapshot_items.snapshot_meal_id
            and diet_snapshots.user_id = auth.uid()
        )
    );


-- 3. FIX PROGRESS TABLES & RLS
create table if not exists public.weight_records (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    weight float not null,
    recorded_at timestamptz default now()
);

alter table public.weight_records enable row level security;

drop policy if exists "Users can manage own weight records" on public.weight_records;
create policy "Users can manage own weight records" on public.weight_records
    for all using (auth.uid() = user_id);


create table if not exists public.measurements (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    waist float,
    hips float,
    bust float,
    thigh float,
    arm float,
    recorded_at timestamptz default now()
);

alter table public.measurements enable row level security;

drop policy if exists "Users can manage own measurements" on public.measurements;
create policy "Users can manage own measurements" on public.measurements
    for all using (auth.uid() = user_id);


create table if not exists public.progress_photos (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    photo_data text, -- base64
    notes text,
    taken_at timestamptz default now()
);

alter table public.progress_photos enable row level security;

drop policy if exists "Users can manage own photos" on public.progress_photos;
create policy "Users can manage own photos" on public.progress_photos
    for all using (auth.uid() = user_id);


-- 4. FIX WORKOUT LOGS
create table if not exists public.workout_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    workout_id uuid references public.workouts(id),
    completed_at timestamptz default now(),
    duration_seconds int,
    xp_earned int
);

alter table public.workout_logs enable row level security;

drop policy if exists "Users can manage own workout logs" on public.workout_logs;
create policy "Users can manage own workout logs" on public.workout_logs
    for all using (auth.uid() = user_id);

create table if not exists public.daily_tracking (
    user_id uuid references public.users(id) on delete cascade not null,
    date date not null,
    water_ml int default 0,
    meals_completed int default 0,
    workout_completed boolean default false,
    primary key (user_id, date)
);

alter table public.daily_tracking enable row level security;

drop policy if exists "Users can manage daily tracking" on public.daily_tracking;
create policy "Users can manage daily tracking" on public.daily_tracking
    for all using (auth.uid() = user_id);

-- Ensure diet_regenerations table exists
create table if not exists public.diet_regenerations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    created_at timestamptz default now()
);
alter table public.diet_regenerations enable row level security;
drop policy if exists "Users can view own regenerations" on public.diet_regenerations;
create policy "Users can view own regenerations" on public.diet_regenerations for all using (auth.uid() = user_id);

