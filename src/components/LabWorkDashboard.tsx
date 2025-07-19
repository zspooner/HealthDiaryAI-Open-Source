import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestTube, Calendar, Search, TrendingUp, Brain, Stethoscope, FileText, ExternalLink } from 'lucide-react';
import type { LabWork, MedicalTest, LabTest } from '@/types/health';

interface LabWorkDashboardProps {
  labWork: LabWork[];
  medicalTests: MedicalTest[];
  onAnalyze?: () => void;
}

export function LabWorkDashboard({ labWork, medicalTests, onAnalyze }: LabWorkDashboardProps) {
  const [filteredLabWork, setFilteredLabWork] = useState<LabWork[]>(labWork);
  const [filteredMedicalTests, setFilteredMedicalTests] = useState<MedicalTest[]>(medicalTests);
  const [searchTerm, setSearchTerm] = useState('');
  const [labTypeFilter, setLabTypeFilter] = useState('all');
  const [testTypeFilter, setTestTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Filter lab work
    let filteredLab = labWork;

    if (searchTerm) {
      filteredLab = filteredLab.filter(lab => 
        lab.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.tests.some(test => 
          test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.value.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        (lab.overallNotes && lab.overallNotes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lab.orderingPhysician && lab.orderingPhysician.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (labTypeFilter !== 'all') {
      filteredLab = filteredLab.filter(lab => lab.testType === labTypeFilter);
    }

    if (statusFilter !== 'all') {
      filteredLab = filteredLab.filter(lab => 
        lab.tests.some(test => test.status === statusFilter)
      );
    }

    setFilteredLabWork(filteredLab);

    // Filter medical tests
    let filteredMedical = medicalTests;

    if (searchTerm) {
      filteredMedical = filteredMedical.filter(test => 
        test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.results.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (test.impression && test.impression.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (test.facility && test.facility.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (testTypeFilter !== 'all') {
      filteredMedical = filteredMedical.filter(test => test.testType === testTypeFilter);
    }

    setFilteredMedicalTests(filteredMedical);
  }, [labWork, medicalTests, searchTerm, labTypeFilter, testTypeFilter, statusFilter]);

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

  const getTestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      blood: 'Blood Work',
      urine: 'Urine Analysis',
      stool: 'Stool Sample',
      imaging: 'Imaging/Radiology',
      other: 'Other',
      xray: 'X-Ray',
      ct: 'CT Scan',
      mri: 'MRI',
      ultrasound: 'Ultrasound',
      ecg: 'ECG/EKG',
      echo: 'Echocardiogram',
      endoscopy: 'Endoscopy',
      biopsy: 'Biopsy'
    };
    return labels[type] || type;
  };

  const getStats = () => {
    const totalTests = labWork.length + medicalTests.length;
    const totalLabTests = labWork.reduce((sum, lab) => sum + lab.tests.length, 0);
    const abnormalTests = labWork.reduce((sum, lab) => 
      sum + lab.tests.filter(test => test.status !== 'normal').length, 0
    );
    const criticalTests = labWork.reduce((sum, lab) => 
      sum + lab.tests.filter(test => test.status === 'critical').length, 0
    );

    return { totalTests, totalLabTests, abnormalTests, criticalTests };
  };

  const stats = getStats();

  if (labWork.length === 0 && medicalTests.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader className="text-center">
          <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle>No Lab Work or Tests Yet</CardTitle>
          <CardDescription>
            Start recording your lab results and medical tests to track your health data
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Reports</p>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Lab Tests</p>
                <p className="text-2xl font-bold">{stats.totalLabTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Abnormal</p>
                <p className="text-2xl font-bold">{stats.abnormalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Critical</p>
                <p className="text-2xl font-bold">{stats.criticalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Button */}
      {(labWork.length > 0 || medicalTests.length > 0) && (
        <Card className="shadow-insight bg-gradient-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-accent-foreground" />
                <div>
                  <h3 className="font-semibold text-accent-foreground">AI Lab Analysis</h3>
                  <p className="text-sm text-accent-foreground/80">
                    Generate AI insights from your lab work and test results
                  </p>
                </div>
              </div>
              <Button 
                onClick={onAnalyze}
                variant="secondary"
                className="bg-white/20 text-accent-foreground border-white/30"
              >
                Analyze Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter & Search Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tests, results, facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={labTypeFilter} onValueChange={setLabTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Lab Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lab Types</SelectItem>
                <SelectItem value="blood">Blood Work</SelectItem>
                <SelectItem value="urine">Urine Analysis</SelectItem>
                <SelectItem value="stool">Stool Sample</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Test Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                <SelectItem value="xray">X-Ray</SelectItem>
                <SelectItem value="ct">CT Scan</SelectItem>
                <SelectItem value="mri">MRI</SelectItem>
                <SelectItem value="ultrasound">Ultrasound</SelectItem>
                <SelectItem value="ecg">ECG/EKG</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="endoscopy">Endoscopy</SelectItem>
                <SelectItem value="biopsy">Biopsy</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="abnormal">Abnormal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Showing {filteredLabWork.length} lab reports and {filteredMedicalTests.length} medical tests
          </p>
        </CardContent>
      </Card>

      {/* Lab Work Results */}
      {filteredLabWork.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Lab Work Results ({filteredLabWork.length})
          </h3>
          
          {filteredLabWork.map((lab) => (
            <Card key={lab.id} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">
                      {new Date(lab.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getTestTypeLabel(lab.testType)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>📍 {lab.labName}</span>
                  {lab.orderingPhysician && <span>👨‍⚕️ {lab.orderingPhysician}</span>}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Individual Tests */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Test Results ({lab.tests.length})</h4>
                  <div className="grid gap-3">
                    {lab.tests.map((test) => (
                      <div key={test.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{test.name}</span>
                          <Badge className={getStatusBadgeColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Value:</span> {test.value} {test.unit && `${test.unit}`}
                          </div>
                          {test.referenceRange && (
                            <div>
                              <span className="font-medium">Range:</span> {test.referenceRange}
                            </div>
                          )}
                        </div>
                        {test.notes && (
                          <div className="text-sm text-muted-foreground italic mt-2">
                            {test.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Notes */}
                {lab.overallNotes && (
                  <div className="pt-2 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Notes</h4>
                    <p className="text-sm">{lab.overallNotes}</p>
                  </div>
                )}

                {/* Report Link */}
                {lab.reportUrl && (
                  <div className="pt-2 border-t">
                    <a 
                      href={lab.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Full Report
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Medical Tests */}
      {filteredMedicalTests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Medical Tests ({filteredMedicalTests.length})
          </h3>
          
          {filteredMedicalTests.map((test) => (
            <Card key={test.id} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">{test.testName}</CardTitle>
                  </div>
                  <Badge variant="outline">
                    {getTestTypeLabel(test.testType)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(test.date).toLocaleDateString()}</span>
                  {test.facility && <span>📍 {test.facility}</span>}
                  {test.orderingPhysician && <span>👨‍⚕️ {test.orderingPhysician}</span>}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Results */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Results & Findings</h4>
                  <p className="text-sm">{test.results}</p>
                </div>

                {/* Impression */}
                {test.impression && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Impression</h4>
                    <p className="text-sm">{test.impression}</p>
                  </div>
                )}

                {/* Recommendations */}
                {test.recommendations && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Recommendations</h4>
                    <p className="text-sm">{test.recommendations}</p>
                  </div>
                )}

                {/* Follow-up */}
                {test.followUp && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Follow-up</h4>
                    <p className="text-sm">{test.followUp}</p>
                  </div>
                )}

                {/* Report Link */}
                {test.reportUrl && (
                  <div className="pt-2 border-t">
                    <a 
                      href={test.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Full Report
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}