alter table public.snapshot_items 
add column if not exists protein float default 0,
add column if not exists carbs float default 0,
add column if not exists fat float default 0;
