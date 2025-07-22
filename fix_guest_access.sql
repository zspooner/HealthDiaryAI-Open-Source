-- Fix guest user access by updating RLS policies
-- This allows guest users (null user_id) to access health logs and hypotheses
-- Run this script directly in the Supabase SQL Editor

-- Drop existing policies for health_logs
DROP POLICY IF EXISTS "Users can view their own health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users can create their own health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users can update their own health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users can delete their own health logs" ON public.health_logs;

-- Drop existing policies for hypotheses
DROP POLICY IF EXISTS "Users can view their own hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users can create their own hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users can update their own hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users can delete their own hypotheses" ON public.hypotheses;

-- Create new policies that allow both authenticated users and guest users (null user_id)
-- Health logs policies
CREATE POLICY "Users and guests can view health logs" 
ON public.health_logs 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Users and guests can create health logs" 
ON public.health_logs 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Users and guests can update health logs" 
ON public.health_logs 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Users and guests can delete health logs" 
ON public.health_logs 
FOR DELETE 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

-- Hypotheses policies
CREATE POLICY "Users and guests can view hypotheses" 
ON public.hypotheses 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Users and guests can create hypotheses" 
ON public.hypotheses 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Users and guests can update hypotheses" 
ON public.hypotheses 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Users and guests can delete hypotheses" 
ON public.hypotheses 
FOR DELETE 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

-- Ensure user_id columns allow NULL values for guest users
ALTER TABLE public.health_logs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.hypotheses ALTER COLUMN user_id DROP NOT NULL; 