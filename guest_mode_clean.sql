-- Clean guest mode setup - removes existing policies first
DROP POLICY IF EXISTS "Users can create their own health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users can view their own health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users can update their own health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users can delete their own health logs" ON public.health_logs;
DROP POLICY IF EXISTS "Users can create their own hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users can view their own hypotheses" ON public.hypotheses;
ALTER TABLE public.health_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypotheses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.hypotheses ALTER COLUMN user_id DROP NOT NULL;
