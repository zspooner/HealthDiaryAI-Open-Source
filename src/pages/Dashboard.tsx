import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/hooks/useHealthData';
import { LogDashboard } from '@/components/LogDashboard';
import { LogForm } from '@/components/LogForm';
import { LabWorkForm } from '@/components/LabWorkForm';
import { LabWorkDashboard } from '@/components/LabWorkDashboard';
import { AIAnalysisCard } from '@/components/AIAnalysisCard';
import { RedditResultsCard } from '@/components/RedditResultsCard';
import { aiService } from '@/services/ai';
import { redditSearchService } from '@/services/redditSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Loader2, LogOut, User, TrendingUp, TestTube, Activity, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { HypothesisAnalysis } from '@/services/ai';
import type { RedditSearchResult } from '@/services/redditSearch';
import type { LabWork, MedicalTest } from '@/types/health';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { healthLogs, loading } = useHealthData();
  const { toast } = useToast();
  
  const [labWork, setLabWork] = useState<LabWork[]>([]);
  const [medicalTests, setMedicalTests] = useState<MedicalTest[]>([]);
  
  const [analysis, setAnalysis] = useState<HypothesisAnalysis | null>(null);
  const [medicalHypotheses, setMedicalHypotheses] = useState<HypothesisAnalysis | null>(null);
  const [redditResults, setRedditResults] = useState<RedditSearchResult | null>(null);
  const [hypothesesRedditResults, setHypothesesRedditResults] = useState<RedditSearchResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingHypotheses, setIsGeneratingHypotheses] = useState(false);

  // Load lab work and medical tests from localStorage
  React.useEffect(() => {
    const savedLabWork = localStorage.getItem('labWork');
    const savedMedicalTests = localStorage.getItem('medicalTests');
    
    if (savedLabWork) {
      try {
        setLabWork(JSON.parse(savedLabWork));
      } catch (error) {
        console.error('Error parsing saved lab work:', error);
      }
    }
    if (savedMedicalTests) {
      try {
        setMedicalTests(JSON.parse(savedMedicalTests));
      } catch (error) {
        console.error('Error parsing saved medical tests:', error);
      }
    }
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateAnalysis = async () => {
    if (healthLogs.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please add some health logs before generating analysis.",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a single log analysis
    const isSingleLog = healthLogs.length === 1;
    if (isSingleLog) {
      toast({
        title: "Single Log Analysis",
        description: "Generating insights from your single log entry. For more accurate analysis, consider logging 7+ entries over time.",
      });
    }

    console.log('🚀 Starting General AI Analysis - setting loading to true');
    setIsAnalyzing(true);
    
    try {
      // Run appropriate AI analysis based on data amount
      console.log('🧠 Starting AI analysis...');
      let aiAnalysis;
      if (isSingleLog) {
        aiAnalysis = await aiService.generateSingleLogAnalysis(healthLogs, labWork, medicalTests);
        console.log('✅ Single log AI analysis completed:', aiAnalysis);
      } else {
        aiAnalysis = await aiService.generateGeneralAnalysis(healthLogs, labWork, medicalTests);
        console.log('✅ General AI analysis completed:', aiAnalysis);
      }
      setAnalysis(aiAnalysis);
      
      // Try Reddit search separately, don't let it fail the main analysis
      try {
        console.log('🔍 Starting Reddit search for general analysis...');
        const redditSearchResults = await redditSearchService.searchSimilarCases(healthLogs, 'general');
        console.log('✅ Reddit search for general analysis completed:', redditSearchResults);
        setRedditResults(redditSearchResults);
        const totalDataPoints = healthLogs.length + labWork.length + medicalTests.length;
        toast({
          title: "General Analysis Complete",
          description: `General AI analysis complete using ${totalDataPoints} data points with ${redditSearchResults.posts.length} similar Reddit cases found.`,
        });
      } catch (redditError) {
        console.warn('Reddit search failed, but AI analysis succeeded:', redditError);
        setRedditResults(null);
        const totalDataPoints = healthLogs.length + labWork.length + medicalTests.length;
        toast({
          title: "General Analysis Complete",
          description: `General AI analysis complete using ${totalDataPoints} data points. Reddit search temporarily unavailable.`,
        });
      }
    } catch (error) {
      console.error('❌ General AI Analysis failed:', error);
      toast({
        title: "General Analysis Failed",
        description: "Failed to generate general AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 AI Analysis finished - setting loading to false');
      setIsAnalyzing(false);
    }
  };

  const generateMedicalHypotheses = async () => {
    if (healthLogs.length === 0) {
      toast({
        title: "No Data Available", 
        description: "Please add some health logs before generating medical hypotheses.",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a single log analysis
    const isSingleLog = healthLogs.length === 1;
    if (isSingleLog) {
      toast({
        title: "Single Log Medical Analysis",
        description: "Generating medical hypotheses from your single log entry. For more accurate analysis, consider logging 7+ entries over time.",
      });
    }

    console.log('🚀 Starting Medical Hypotheses - setting loading to true');
    setIsGeneratingHypotheses(true);
    
    try {
      // Run medical hypotheses with appropriate analysis type
      console.log('🧬 Starting medical hypotheses generation...');
      let medicalAnalysis;
      if (isSingleLog) {
        medicalAnalysis = await aiService.generateSingleLogAnalysis(healthLogs, labWork, medicalTests);
        console.log('✅ Single log medical analysis completed:', medicalAnalysis);
      } else {
        medicalAnalysis = await aiService.generateMedicalHypotheses(healthLogs, labWork, medicalTests);
        console.log('✅ Medical hypotheses completed:', medicalAnalysis);
      }
      setMedicalHypotheses(medicalAnalysis);
      
      // Try Reddit search separately, don't let it fail the main analysis
      try {
        console.log('🔍 Starting Reddit search for medical hypotheses...');
        const redditSearchResults = await redditSearchService.searchSimilarCases(healthLogs, 'medical');
        console.log('✅ Reddit search for medical hypotheses completed:', redditSearchResults);
        setHypothesesRedditResults(redditSearchResults);
        const totalDataPoints = healthLogs.length + labWork.length + medicalTests.length;
        toast({
          title: "Medical Hypotheses Generated",
          description: `Medical hypotheses complete using ${totalDataPoints} data points with ${redditSearchResults.posts.length} similar Reddit cases found. Remember to discuss these with your doctor.`,
        });
      } catch (redditError) {
        console.warn('Reddit search failed, but medical hypotheses succeeded:', redditError);
        setHypothesesRedditResults(null);
        const totalDataPoints = healthLogs.length + labWork.length + medicalTests.length;
        toast({
          title: "Medical Hypotheses Generated",
          description: `Medical hypotheses complete using ${totalDataPoints} data points. Reddit search temporarily unavailable. Remember to discuss these with your doctor.`,
        });
      }
    } catch (error) {
      console.error('❌ Medical Hypotheses failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate medical hypotheses. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 Medical Hypotheses finished - setting loading to false');
      setIsGeneratingHypotheses(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
        <div className="bg-gradient-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-8 w-8" />
                  Health Dashboard
                </h1>
                <p className="text-primary-foreground/80">
                  Welcome back, {user?.email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Logs</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-3xl font-bold text-primary">{healthLogs.length + labWork.length + medicalTests.length}</div>
                <CardDescription>Total health records</CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {healthLogs.length > 0 ? Math.round(healthLogs.reduce((sum, log) => sum + log.severity, 0) / healthLogs.length) : 0}
                </div>
                <CardDescription>Out of 10</CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Sleep</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {healthLogs.length > 0 ? (healthLogs.reduce((sum, log) => sum + log.sleep, 0) / healthLogs.length).toFixed(1) : 0}h
                </div>
                <CardDescription>Hours per night</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
                <CardDescription>
                  Get AI-powered insights from your health data. Works with just one log entry, but 7+ logs provide better accuracy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateAnalysis} 
                  disabled={isAnalyzing || isGeneratingHypotheses || healthLogs.length === 0}
                  className="w-full shadow-medical"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      {healthLogs.length === 1 ? 'Quick Analysis (1 log)' : `Generate AI Analysis (${healthLogs.length + labWork.length + medicalTests.length} records)`}
                    </>
                  )}
                </Button>
                {healthLogs.length === 1 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    ⚠️ Single log analysis - consider logging more entries for better insights
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Generate Hypotheses
                </CardTitle>
                <CardDescription>
                  Create medical hypotheses based on your symptom patterns, lab results, and test data. Works with single logs but 7+ logs provide better accuracy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateMedicalHypotheses} 
                  disabled={isAnalyzing || isGeneratingHypotheses || healthLogs.length === 0}
                  className="w-full shadow-medical bg-purple-600 hover:bg-purple-700"
                >
                  {isGeneratingHypotheses ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      {healthLogs.length === 1 ? 'Quick Medical Analysis (1 log)' : `Generate Medical Hypotheses (${healthLogs.length + labWork.length + medicalTests.length} records)`}
                    </>
                  )}
                </Button>
                {healthLogs.length === 1 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    ⚠️ Single log analysis - consider logging more entries for better insights
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* General AI Analysis Results */}
          {analysis && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">General AI Analysis</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAnalysis(null)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <AIAnalysisCard analysis={analysis} isSingleLog={healthLogs.length === 1} />
            </div>
          )}

          {/* Medical Hypotheses Results */}
          {medicalHypotheses && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Medical Hypotheses</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMedicalHypotheses(null)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <AIAnalysisCard analysis={medicalHypotheses} isSingleLog={healthLogs.length === 1} />
            </div>
          )}

          {/* Combined Reddit Search Results */}
          {(redditResults || hypothesesRedditResults) && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Community Cases</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRedditResults(null);
                    setHypothesesRedditResults(null);
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <RedditResultsCard results={redditResults || hypothesesRedditResults} />
            </div>
          )}

          {/* Data Input Tabs */}
          <div className="mb-8">
            <Tabs defaultValue="health-logs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="health-logs" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Daily Health Log
                </TabsTrigger>
                <TabsTrigger value="lab-work" className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Lab Work
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="health-logs" className="space-y-6">
                <LogForm onLogAdded={() => {}} />
                <LogDashboard logs={healthLogs} />
              </TabsContent>
              
              <TabsContent value="lab-work" className="space-y-6">
                <LabWorkForm onLabWorkAdded={() => {}} onMedicalTestAdded={() => {}} />
                <LabWorkDashboard labWork={labWork} medicalTests={medicalTests} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Loading General Analysis */}
          {isAnalyzing && (
            <Card className="mt-8 shadow-medical">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold mb-2">Generating General AI Analysis & Searching Reddit</h3>
                <p className="text-muted-foreground">
                  AI is analyzing your {healthLogs.length} health logs, {labWork.length} lab work entries, and {medicalTests.length} medical tests for general health patterns and searching for similar cases on Reddit...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading Medical Hypotheses */}
          {isGeneratingHypotheses && (
            <Card className="mt-8 shadow-medical bg-purple-50 border-purple-200">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold mb-2 text-purple-800">Generating Medical Hypotheses & Searching Reddit</h3>
                <p className="text-purple-600">
                  AI is generating medical hypotheses about potential causes from your {healthLogs.length} health logs, {labWork.length} lab work entries, and {medicalTests.length} medical tests and searching for similar medical cases on Reddit...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;