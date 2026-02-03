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

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

insert into public.users (id, email, name, plan_type)
select au.id,
       au.email,
       coalesce(au.raw_user_meta_data->>'name', ''),
       coalesce(au.raw_user_meta_data->>'plan_type', 'basic')
from auth.users au
where not exists (
  select 1 from public.users pu where pu.id = au.id
);
