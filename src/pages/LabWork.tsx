import React, { useState, useEffect } from 'react';
import { LabWorkForm } from '@/components/LabWorkForm';
import { LabWorkDashboard } from '@/components/LabWorkDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TestTube, TrendingUp, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/ai';
import { AIAnalysisCard } from '@/components/AIAnalysisCard';
import type { LabWork, MedicalTest, HealthLog, HypothesisAnalysis } from '@/types/health';

const LabWorkPage = () => {
  const [labWork, setLabWork] = useState<LabWork[]>([]);
  const [medicalTests, setMedicalTests] = useState<MedicalTest[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<HypothesisAnalysis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load data from localStorage
    const savedLabWork = localStorage.getItem('labWork');
    const savedMedicalTests = localStorage.getItem('medicalTests');
    
    if (savedLabWork) {
      setLabWork(JSON.parse(savedLabWork));
    }
    if (savedMedicalTests) {
      setMedicalTests(JSON.parse(savedMedicalTests));
    }
  }, []);

  const handleLabWorkAdded = (newLabWork: LabWork) => {
    setLabWork(prev => [newLabWork, ...prev]);
    if (labWork.length === 0 && medicalTests.length === 0) {
      toast({
        title: "First lab work recorded!",
        description: "You can now view your data in the dashboard below.",
      });
    }
  };

  const handleMedicalTestAdded = (newMedicalTest: MedicalTest) => {
    setMedicalTests(prev => [newMedicalTest, ...prev]);
    if (labWork.length === 0 && medicalTests.length === 0) {
      toast({
        title: "First medical test recorded!",
        description: "You can now view your data in the dashboard below.",
      });
    }
  };

  const handleAnalyze = async () => {
    if (labWork.length === 0 && medicalTests.length === 0) {
      toast({
        title: "Need data to analyze",
        description: "Please add some lab work or medical tests before requesting AI analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Get existing health logs to include in analysis
      const savedHealthLogs = localStorage.getItem('healthLogs');
      const healthLogs: HealthLog[] = savedHealthLogs ? JSON.parse(savedHealthLogs) : [];
      
      const aiAnalysis = await aiService.generateHypothesis(healthLogs);
      setAnalysis(aiAnalysis);
      
      toast({
        title: "Analysis complete",
        description: "AI has analyzed your lab work and medical tests.",
      });
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to generate AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleView = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Health Logs
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <TestTube className="h-8 w-8 text-primary" />
                Lab Work & Medical Tests
              </h1>
              <p className="text-muted-foreground">
                Record and track your lab results and medical test findings
              </p>
            </div>
          </div>
          
          <Button 
            onClick={toggleView}
            variant="outline"
            className="flex items-center gap-2"
          >
            {showForm ? (
              <>
                <TrendingUp className="h-4 w-4" />
                View Dashboard
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4" />
                Add Lab Work
              </>
            )}
          </Button>
        </div>

        {/* AI Analysis Results */}
        {analysis && <AIAnalysisCard analysis={analysis} />}

        {/* Form or Dashboard */}
        {showForm ? (
          <LabWorkForm
            onLabWorkAdded={handleLabWorkAdded}
            onMedicalTestAdded={handleMedicalTestAdded}
          />
        ) : (
          <LabWorkDashboard
            labWork={labWork}
            medicalTests={medicalTests}
            onAnalyze={handleAnalyze}
          />
        )}

        {/* Loading Analysis */}
        {isAnalyzing && (
          <Card className="mt-8 shadow-medical">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Generating AI Analysis</h3>
              <p className="text-muted-foreground">
                AI is analyzing your lab work and medical tests to generate insights...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Show Dashboard Preview if Form is Active */}
        {showForm && (labWork.length > 0 || medicalTests.length > 0) && (
          <div className="mt-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Data Overview</span>
                  <Button onClick={toggleView} size="sm" variant="outline">
                    View Full Dashboard
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-primary">{labWork.length}</div>
                    <div className="text-sm text-muted-foreground">Lab Reports</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-primary">{medicalTests.length}</div>
                    <div className="text-sm text-muted-foreground">Medical Tests</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-primary">
                      {labWork.reduce((sum, lab) => sum + lab.tests.length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Lab Values</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-yellow-600">
                      {labWork.reduce((sum, lab) => 
                        sum + lab.tests.filter(test => test.status !== 'normal').length, 0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Abnormal Values</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabWorkPage;