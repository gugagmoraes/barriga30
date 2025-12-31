-- Photos table for storing base64 (MVP solution to avoid storage config issues)
CREATE TABLE IF NOT EXISTS public.progress_photos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    photo_data text NOT NULL, -- Base64 string
    taken_at timestamptz DEFAULT now(),
    notes text
);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'Users can view own photos') THEN
        CREATE POLICY "Users can view own photos" ON public.progress_photos FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'Users can insert own photos') THEN
        CREATE POLICY "Users can insert own photos" ON public.progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'Users can delete own photos') THEN
        CREATE POLICY "Users can delete own photos" ON public.progress_photos FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
