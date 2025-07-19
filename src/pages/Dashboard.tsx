import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/hooks/useHealthData';
import { LogDashboard } from '@/components/LogDashboard';
import { LogForm } from '@/components/LogForm';
import { AIAnalysisCard } from '@/components/AIAnalysisCard';
import { RedditResultsCard } from '@/components/RedditResultsCard';
import { aiService } from '@/services/ai';
import { redditSearchService } from '@/services/redditSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2, LogOut, User, ArrowLeft, TrendingUp, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { HypothesisAnalysis } from '@/services/ai';
import type { RedditSearchResult } from '@/services/redditSearch';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { healthLogs, loading } = useHealthData();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<HypothesisAnalysis | null>(null);
  const [redditResults, setRedditResults] = useState<RedditSearchResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    setIsAnalyzing(true);
    
    try {
      // Run AI analysis and Reddit search in parallel
      const [aiAnalysis, redditSearchResults] = await Promise.all([
        aiService.generateHypothesis(healthLogs),
        redditSearchService.searchSimilarCases(healthLogs)
      ]);
      
      setAnalysis(aiAnalysis);
      setRedditResults(redditSearchResults);
      
      toast({
        title: "Analysis Complete",
        description: `AI analysis complete with ${redditSearchResults.posts.length} similar Reddit cases found.`,
      });
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
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
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-8 w-8" />
                    Health Dashboard
                  </h1>
                  <p className="text-primary-foreground/80">
                    Welcome back, {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/lab-work">
                  <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <TestTube className="h-4 w-4 mr-2" />
                    Lab Work
                  </Button>
                </Link>
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
                <div className="text-3xl font-bold text-primary">{healthLogs.length}</div>
                <CardDescription>Health entries recorded</CardDescription>
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
                  Get comprehensive AI-powered insights from your health data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateAnalysis} 
                  disabled={isAnalyzing || healthLogs.length === 0}
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
                      Generate AI Analysis ({healthLogs.length} logs)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Generate Hypotheses
                </CardTitle>
                <CardDescription>
                  Create medical hypotheses based on your symptom patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateAnalysis} 
                  disabled={isAnalyzing || healthLogs.length === 0}
                  className="w-full shadow-medical"
                  variant="outline"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Hypotheses ({healthLogs.length} logs)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Results */}
          {analysis && <AIAnalysisCard analysis={analysis} />}

          {/* Reddit Search Results */}
          {redditResults && <RedditResultsCard results={redditResults} />}

          {/* Health Log Input Form */}
          <div className="mb-8">
            <LogForm onLogAdded={() => {}} />
          </div>

          {/* Health Logs */}
          <LogDashboard logs={healthLogs} />

          {/* Loading Analysis */}
          {isAnalyzing && (
            <Card className="mt-8 shadow-medical">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold mb-2">Generating AI Analysis & Searching Reddit</h3>
                <p className="text-muted-foreground">
                  AI is analyzing your {healthLogs.length} health logs and searching for similar cases on Reddit...
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