# Database Setup Guide

## Quick Setup for Supabase

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Link your project**
   ```bash
   npx supabase link --project-ref opiuyyiqkmmiffaagqnk
   ```

3. **Push migrations**
   ```bash
   npx supabase db push
   ```

### Option 2: Manual Setup via Supabase Dashboard

1. **Go to your Supabase project dashboard**
   - Navigate to: https://supabase.com/dashboard/project/opiuyyiqkmmiffaagqnk
   - Go to **SQL Editor**

2. **Run the migrations in order:**

   **Step 1: Run initial schema**
   ```sql
   -- Copy and paste the contents of: supabase/migrations/20250719120000-initial-schema.sql
   ```

   **Step 2: Run user management**
   ```sql
   -- Copy and paste the contents of: supabase/migrations/20250719130712-de816ac4-e395-4aa8-a83d-7b329eadb7cd.sql
   ```

   **Step 3: Run lab work tables**
   ```sql
   -- Copy and paste the contents of: supabase/migrations/20250719135243-2529f93e-d886-4be1-9659-af5989c7169c.sql
   ```

### Option 3: One-Click Setup

Run this complete SQL script in your Supabase SQL Editor:

```sql
-- Complete database setup for Health Detective AI
-- Run this entire script in your Supabase SQL Editor

-- Create health_logs table
CREATE TABLE IF NOT EXISTS public.health_logs (
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
CREATE TABLE IF NOT EXISTS public.hypotheses (
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
DROP TRIGGER IF EXISTS update_health_logs_updated_at ON public.health_logs;
CREATE TRIGGER update_health_logs_updated_at
  BEFORE UPDATE ON public.health_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add user_id columns to existing tables
ALTER TABLE public.health_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.hypotheses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for health_logs
DROP POLICY IF EXISTS "Users can view their own health logs" ON public.health_logs;
CREATE POLICY "Users can view their own health logs" 
ON public.health_logs 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own health logs" ON public.health_logs;
CREATE POLICY "Users can create their own health logs" 
ON public.health_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own health logs" ON public.health_logs;
CREATE POLICY "Users can update their own health logs" 
ON public.health_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own health logs" ON public.health_logs;
CREATE POLICY "Users can delete their own health logs" 
ON public.health_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for hypotheses
DROP POLICY IF EXISTS "Users can view their own hypotheses" ON public.hypotheses;
CREATE POLICY "Users can view their own hypotheses" 
ON public.hypotheses 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own hypotheses" ON public.hypotheses;
CREATE POLICY "Users can create their own hypotheses" 
ON public.hypotheses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own hypotheses" ON public.hypotheses;
CREATE POLICY "Users can update their own hypotheses" 
ON public.hypotheses 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own hypotheses" ON public.hypotheses;
CREATE POLICY "Users can delete their own hypotheses" 
ON public.hypotheses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

-- Trigger to create profile automatically on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for profiles updated_at timestamp
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create lab_work table
CREATE TABLE IF NOT EXISTS public.lab_work (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('blood', 'urine', 'stool', 'imaging', 'other')),
  lab_name TEXT NOT NULL,
  ordering_physician TEXT,
  overall_notes TEXT,
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_tests table
CREATE TABLE IF NOT EXISTS public.lab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_work_id UUID NOT NULL REFERENCES public.lab_work(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  reference_range TEXT,
  status TEXT CHECK (status IN ('normal', 'abnormal', 'high', 'low', 'critical')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_tests table
CREATE TABLE IF NOT EXISTS public.medical_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('ecg', 'echo', 'xray', 'ct', 'mri', 'ultrasound', 'endoscopy', 'biopsy', 'other')),
  test_name TEXT NOT NULL,
  facility TEXT,
  ordering_physician TEXT,
  results TEXT NOT NULL,
  impression TEXT,
  recommendations TEXT,
  follow_up TEXT,
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for new tables
ALTER TABLE public.lab_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lab_work
DROP POLICY IF EXISTS "Users can view their own lab work" ON public.lab_work;
CREATE POLICY "Users can view their own lab work" 
ON public.lab_work 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own lab work" ON public.lab_work;
CREATE POLICY "Users can create their own lab work" 
ON public.lab_work 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lab work" ON public.lab_work;
CREATE POLICY "Users can update their own lab work" 
ON public.lab_work 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own lab work" ON public.lab_work;
CREATE POLICY "Users can delete their own lab work" 
ON public.lab_work 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for lab_tests
DROP POLICY IF EXISTS "Users can view their own lab tests" ON public.lab_tests;
CREATE POLICY "Users can view their own lab tests" 
ON public.lab_tests 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.lab_work WHERE id = lab_work_id));

DROP POLICY IF EXISTS "Users can create their own lab tests" ON public.lab_tests;
CREATE POLICY "Users can create their own lab tests" 
ON public.lab_tests 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.lab_work WHERE id = lab_work_id));

DROP POLICY IF EXISTS "Users can update their own lab tests" ON public.lab_tests;
CREATE POLICY "Users can update their own lab tests" 
ON public.lab_tests 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.lab_work WHERE id = lab_work_id));

DROP POLICY IF EXISTS "Users can delete their own lab tests" ON public.lab_tests;
CREATE POLICY "Users can delete their own lab tests" 
ON public.lab_tests 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.lab_work WHERE id = lab_work_id));

-- Create RLS policies for medical_tests
DROP POLICY IF EXISTS "Users can view their own medical tests" ON public.medical_tests;
CREATE POLICY "Users can view their own medical tests" 
ON public.medical_tests 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own medical tests" ON public.medical_tests;
CREATE POLICY "Users can create their own medical tests" 
ON public.medical_tests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own medical tests" ON public.medical_tests;
CREATE POLICY "Users can update their own medical tests" 
ON public.medical_tests 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own medical tests" ON public.medical_tests;
CREATE POLICY "Users can delete their own medical tests" 
ON public.medical_tests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_lab_work_updated_at ON public.lab_work;
CREATE TRIGGER update_lab_work_updated_at
BEFORE UPDATE ON public.lab_work
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_tests_updated_at ON public.medical_tests;
CREATE TRIGGER update_medical_tests_updated_at
BEFORE UPDATE ON public.medical_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

## Verification

After running the setup, you should see these tables in your Supabase dashboard:
- `health_logs`
- `hypotheses`
- `profiles`
- `lab_work`
- `lab_tests`
- `medical_tests`

## Troubleshooting

If you get errors:
1. Make sure you're running the SQL in the correct Supabase project
2. Check that authentication is enabled in your Supabase project
3. Verify that Row Level Security (RLS) is enabled
4. Check the browser console for any JavaScript errors 