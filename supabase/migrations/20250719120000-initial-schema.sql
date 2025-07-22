-- Initial schema migration
-- Creates the base tables for health logs and hypotheses

-- Create health_logs table
CREATE TABLE public.health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  notes TEXT,
  symptoms TEXT,
  meds TEXT,
  habits TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hypotheses table
CREATE TABLE public.hypotheses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  hypothesis TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 0,
  data_points_count INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'general',
  evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for health_logs updated_at
CREATE TRIGGER update_health_logs_updated_at
  BEFORE UPDATE ON public.health_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column(); 