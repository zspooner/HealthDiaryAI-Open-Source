-- Create lab_work table for storing lab work entries
CREATE TABLE public.lab_work (
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

-- Create lab_tests table for individual test results within lab work
CREATE TABLE public.lab_tests (
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

-- Create medical_tests table for imaging and other medical tests
CREATE TABLE public.medical_tests (
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

-- Enable Row Level Security
ALTER TABLE public.lab_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lab_work
CREATE POLICY "Users can view their own lab work" 
ON public.lab_work 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lab work" 
ON public.lab_work 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab work" 
ON public.lab_work 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab work" 
ON public.lab_work 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for lab_tests
CREATE POLICY "Users can view their own lab tests" 
ON public.lab_tests 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.lab_work WHERE id = lab_work_id));

CREATE POLICY "Users can create their own lab tests" 
ON public.lab_tests 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.lab_work WHERE id = lab_work_id));

CREATE POLICY "Users can update their own lab tests" 
ON public.lab_tests 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.lab_work WHERE id = lab_work_id));

CREATE POLICY "Users can delete their own lab tests" 
ON public.lab_tests 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.lab_work WHERE id = lab_work_id));

-- Create RLS policies for medical_tests
CREATE POLICY "Users can view their own medical tests" 
ON public.medical_tests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medical tests" 
ON public.medical_tests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical tests" 
ON public.medical_tests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical tests" 
ON public.medical_tests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_lab_work_updated_at
BEFORE UPDATE ON public.lab_work
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_tests_updated_at
BEFORE UPDATE ON public.medical_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();