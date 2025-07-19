export interface HealthLog {
  id: string;
  date: string;
  symptoms: string[];
  medications: string[];
  severity: number;
  mood: string;
  sleep: number;
  notes: string;
}

export interface LabTest {
  id: string;
  name: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status?: 'normal' | 'abnormal' | 'high' | 'low' | 'critical';
  notes?: string;
}

export interface LabWork {
  id: string;
  date: string;
  testType: 'blood' | 'urine' | 'stool' | 'imaging' | 'other';
  labName: string;
  orderingPhysician?: string;
  tests: LabTest[];
  overallNotes?: string;
  reportUrl?: string;
}

export interface MedicalTest {
  id: string;
  date: string;
  testType: 'ecg' | 'echo' | 'xray' | 'ct' | 'mri' | 'ultrasound' | 'endoscopy' | 'biopsy' | 'other';
  testName: string;
  facility?: string;
  orderingPhysician?: string;
  results: string;
  impression?: string;
  recommendations?: string;
  followUp?: string;
  reportUrl?: string;
}

export interface HypothesisAnalysis {
  patterns: string[];
  potentialCauses: string[];
  recommendations: string[];
  riskFactors: string[];
  nextSteps: string[];
  disclaimer: string;
  labInsights?: string[];
  testCorrelations?: string[];
}