-- Remove all guest data (records with null user_id) from database
DELETE FROM public.health_logs WHERE user_id IS NULL;
DELETE FROM public.hypotheses WHERE user_id IS NULL;

-- Update RLS policies to completely block guest access to database
-- Only authenticated users can access the database

-- Drop existing policies
DROP POLICY IF EXISTS "Users and guests can view health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users and guests can create health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users and guests can update health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users and guests can delete health logs" ON public.health_logs;

DROP POLICY IF EXISTS "Users and guests can view hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users and guests can create hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users and guests can update hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users and guests can delete hypotheses" ON public.hypotheses;

-- Create new policies that only allow authenticated users
CREATE POLICY "Authenticated users can view their own health logs" 
ON public.health_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own health logs" 
ON public.health_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own health logs" 
ON public.health_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own health logs" 
ON public.health_logs 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own hypotheses" 
ON public.hypotheses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own hypotheses" 
ON public.hypotheses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own hypotheses" 
ON public.hypotheses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own hypotheses" 
ON public.hypotheses 
FOR DELETE 
USING (auth.uid() = user_id);