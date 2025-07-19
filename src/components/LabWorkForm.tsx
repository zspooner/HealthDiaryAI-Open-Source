import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, X, FileText, TestTube, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LabWork, MedicalTest, LabTest } from '@/types/health';

interface LabWorkFormProps {
  onLabWorkAdded: (labWork: LabWork) => void;
  onMedicalTestAdded: (medicalTest: MedicalTest) => void;
}

export function LabWorkForm({ onLabWorkAdded, onMedicalTestAdded }: LabWorkFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('labwork');
  
  // Lab Work State
  const [labTestType, setLabTestType] = useState<LabWork['testType']>('blood');
  const [labName, setLabName] = useState('');
  const [orderingPhysician, setOrderingPhysician] = useState('');
  const [tests, setTests] = useState<LabTest[]>([]);
  const [overallNotes, setOverallNotes] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  
  // Individual test being added
  const [testName, setTestName] = useState('');
  const [testValue, setTestValue] = useState('');
  const [testUnit, setTestUnit] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [testStatus, setTestStatus] = useState<LabTest['status']>('normal');
  const [testNotes, setTestNotes] = useState('');
  
  // Medical Test State
  const [medicalTestType, setMedicalTestType] = useState<MedicalTest['testType']>('xray');
  const [medicalTestName, setMedicalTestName] = useState('');
  const [facility, setFacility] = useState('');
  const [medicalOrderingPhysician, setMedicalOrderingPhysician] = useState('');
  const [results, setResults] = useState('');
  const [impression, setImpression] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [medicalReportUrl, setMedicalReportUrl] = useState('');

  const addTest = () => {
    if (!testName.trim() || !testValue.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide at least test name and value.",
        variant: "destructive",
      });
      return;
    }

    const newTest: LabTest = {
      id: Date.now().toString() + Math.random(),
      name: testName.trim(),
      value: testValue.trim(),
      unit: testUnit.trim() || undefined,
      referenceRange: referenceRange.trim() || undefined,
      status: testStatus,
      notes: testNotes.trim() || undefined,
    };

    setTests([...tests, newTest]);
    
    // Reset test form
    setTestName('');
    setTestValue('');
    setTestUnit('');
    setReferenceRange('');
    setTestStatus('normal');
    setTestNotes('');
  };

  const removeTest = (testId: string) => {
    setTests(tests.filter(t => t.id !== testId));
  };

  const handleLabWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Lab work submit attempted:', { 
      labName: labName.trim(), 
      testsLength: tests.length,
      canSubmit: labName.trim() && tests.length > 0 
    });
    
    if (!labName.trim() || tests.length === 0) {
      console.log('Form validation failed:', { 
        hasLabName: !!labName.trim(), 
        hasTests: tests.length > 0 
      });
      toast({
        title: "Incomplete form",
        description: "Please provide lab name and at least one test result.",
        variant: "destructive",
      });
      return;
    }

    const labWork: LabWork = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      testType: labTestType,
      labName: labName.trim(),
      orderingPhysician: orderingPhysician.trim() || undefined,
      tests,
      overallNotes: overallNotes.trim() || undefined,
      reportUrl: reportUrl.trim() || undefined,
    };

    // Save to localStorage
    const existingLabWork = JSON.parse(localStorage.getItem('labWork') || '[]');
    const updatedLabWork = [labWork, ...existingLabWork];
    localStorage.setItem('labWork', JSON.stringify(updatedLabWork));

    onLabWorkAdded(labWork);
    
    // Reset form
    setLabName('');
    setOrderingPhysician('');
    setTests([]);
    setOverallNotes('');
    setReportUrl('');

    toast({
      title: "Lab work recorded",
      description: "Your lab results have been saved successfully.",
    });
  };

  const handleMedicalTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Medical test submit attempted:', { 
      testName: medicalTestName.trim(), 
      results: results.trim(),
      canSubmit: medicalTestName.trim() && results.trim() 
    });
    
    if (!medicalTestName.trim() || !results.trim()) {
      console.log('Medical test validation failed:', { 
        hasTestName: !!medicalTestName.trim(), 
        hasResults: !!results.trim() 
      });
      toast({
        title: "Incomplete form",
        description: "Please provide test name and results.",
        variant: "destructive",
      });
      return;
    }

    const medicalTest: MedicalTest = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      testType: medicalTestType,
      testName: medicalTestName.trim(),
      facility: facility.trim() || undefined,
      orderingPhysician: medicalOrderingPhysician.trim() || undefined,
      results: results.trim(),
      impression: impression.trim() || undefined,
      recommendations: recommendations.trim() || undefined,
      followUp: followUp.trim() || undefined,
      reportUrl: medicalReportUrl.trim() || undefined,
    };

    // Save to localStorage
    const existingTests = JSON.parse(localStorage.getItem('medicalTests') || '[]');
    const updatedTests = [medicalTest, ...existingTests];
    localStorage.setItem('medicalTests', JSON.stringify(updatedTests));

    onMedicalTestAdded(medicalTest);
    
    // Reset form
    setMedicalTestName('');
    setFacility('');
    setMedicalOrderingPhysician('');
    setResults('');
    setImpression('');
    setRecommendations('');
    setFollowUp('');
    setMedicalReportUrl('');

    toast({
      title: "Medical test recorded",
      description: "Your test results have been saved successfully.",
    });
  };

  const getStatusBadgeColor = (status: LabTest['status']) => {
    switch (status) {
      case 'normal': return 'bg-green-50 text-green-600 border-green-200';
      case 'abnormal': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'high': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'low': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'critical': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className="shadow-medical">
      <CardHeader className="bg-gradient-subtle">
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Medical Tests & Lab Work</CardTitle>
        </div>
        <CardDescription>
          Record lab results, medical tests, and diagnostic reports
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="labwork" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Lab Work
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Medical Tests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="labwork" className="space-y-6">
            <form onSubmit={handleLabWorkSubmit} className="space-y-6">
              {/* Date Display */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>

              {/* Lab Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Test Type</Label>
                  <Select value={labTestType} onValueChange={(value: LabWork['testType']) => setLabTestType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood">Blood Work</SelectItem>
                      <SelectItem value="urine">Urine Analysis</SelectItem>
                      <SelectItem value="stool">Stool Sample</SelectItem>
                      <SelectItem value="imaging">Imaging/Radiology</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Lab/Facility Name</Label>
                  <Input
                    placeholder="e.g., Quest Diagnostics, LabCorp"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Ordering Physician</Label>
                <Input
                  placeholder="Dr. Smith (optional)"
                  value={orderingPhysician}
                  onChange={(e) => setOrderingPhysician(e.target.value)}
                />
              </div>

              {/* Individual Test Entry */}
              <Card className="border-dashed border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Test Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Test Name *</Label>
                      <Input
                        placeholder="e.g., Hemoglobin, Glucose"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Value *</Label>
                      <Input
                        placeholder="e.g., 14.2, Normal"
                        value={testValue}
                        onChange={(e) => setTestValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        placeholder="e.g., mg/dL, g/dL"
                        value={testUnit}
                        onChange={(e) => setTestUnit(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Reference Range</Label>
                      <Input
                        placeholder="e.g., 12.0-16.0, <100"
                        value={referenceRange}
                        onChange={(e) => setReferenceRange(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={testStatus} onValueChange={(value: LabTest['status']) => setTestStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="abnormal">Abnormal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Test Notes</Label>
                    <Textarea
                      placeholder="Any specific notes about this test..."
                      value={testNotes}
                      onChange={(e) => setTestNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addTest}
                    disabled={!testName.trim() || !testValue.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Test
                  </Button>
                </CardContent>
              </Card>

              {/* Tests List */}
              {tests.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Test Results ({tests.length})</Label>
                  <div className="space-y-2">
                    {tests.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{test.name}</span>
                            <Badge className={getStatusBadgeColor(test.status)}>
                              {test.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Value: {test.value} {test.unit && `(${test.unit})`}
                            {test.referenceRange && ` | Range: ${test.referenceRange}`}
                          </div>
                          {test.notes && (
                            <div className="text-sm text-muted-foreground italic">
                              {test.notes}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTest(test.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Notes and Report */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Overall Notes</Label>
                  <Textarea
                    placeholder="Any additional notes about these results..."
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Report URL/Link</Label>
                  <Input
                    placeholder="Link to digital report (optional)"
                    value={reportUrl}
                    onChange={(e) => setReportUrl(e.target.value)}
                    type="url"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary shadow-medical"
                disabled={!labName.trim() || tests.length === 0}
              >
                Save Lab Work
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="medical" className="space-y-6">
            <form onSubmit={handleMedicalTestSubmit} className="space-y-6">
              {/* Date Display */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>

              {/* Test Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Test Type</Label>
                  <Select value={medicalTestType} onValueChange={(value: MedicalTest['testType']) => setMedicalTestType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xray">X-Ray</SelectItem>
                      <SelectItem value="ct">CT Scan</SelectItem>
                      <SelectItem value="mri">MRI</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="ecg">ECG/EKG</SelectItem>
                      <SelectItem value="echo">Echocardiogram</SelectItem>
                      <SelectItem value="endoscopy">Endoscopy</SelectItem>
                      <SelectItem value="biopsy">Biopsy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Test Name *</Label>
                  <Input
                    placeholder="e.g., Chest X-Ray, Brain MRI"
                    value={medicalTestName}
                    onChange={(e) => setMedicalTestName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Facility</Label>
                  <Input
                    placeholder="e.g., City Hospital, Imaging Center"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Ordering Physician</Label>
                  <Input
                    placeholder="Dr. Smith (optional)"
                    value={medicalOrderingPhysician}
                    onChange={(e) => setMedicalOrderingPhysician(e.target.value)}
                  />
                </div>
              </div>

              {/* Results and Findings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Results/Findings *</Label>
                  <Textarea
                    placeholder="Describe the test results and findings..."
                    value={results}
                    onChange={(e) => setResults(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Impression/Diagnosis</Label>
                  <Textarea
                    placeholder="Doctor's interpretation or diagnosis based on results..."
                    value={impression}
                    onChange={(e) => setImpression(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Recommendations</Label>
                  <Textarea
                    placeholder="Any recommendations or next steps suggested..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Follow-up Instructions</Label>
                  <Textarea
                    placeholder="Follow-up appointments, additional tests, etc..."
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Report URL/Link</Label>
                  <Input
                    placeholder="Link to digital report (optional)"
                    value={medicalReportUrl}
                    onChange={(e) => setMedicalReportUrl(e.target.value)}
                    type="url"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary shadow-medical"
                disabled={!medicalTestName.trim() || !results.trim()}
              >
                Save Medical Test
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}