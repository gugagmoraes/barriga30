-- Create a trigger to automatically create a public user profile when a new user signs up via Supabase Auth

-- 1. Create the function that the trigger will call
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
-- Note: You usually need superuser or specific permissions to create triggers on auth.users in some environments.
-- In Supabase dashboard SQL editor this works. Via migration tool, it depends on the connection role.
-- Assuming we have sufficient privileges.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
