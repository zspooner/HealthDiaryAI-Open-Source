import React, { useState, useEffect } from 'react';
import { LogDashboard } from '@/components/LogDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Search, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { aiService, type HypothesisAnalysis } from '@/services/ai';
import { AIAnalysisCard } from '@/components/AIAnalysisCard';

interface HealthLog {
  id: string;
  date: string;
  symptoms: string[];
  medications: string[];
  severity: number;
  mood: string;
  sleep: number;
  notes: string;
}

const Dashboard = () => {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<HypothesisAnalysis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load logs from localStorage
    const savedLogs = localStorage.getItem('healthLogs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const handleAnalyze = async () => {
    if (logs.length < 3) {
      toast({
        title: "Need more data",
        description: "Please log at least 3 entries before requesting AI analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const aiAnalysis = await aiService.generateHypothesis(logs);
      setAnalysis(aiAnalysis);
      
      toast({
        title: "Analysis complete",
        description: "AI has analyzed your health patterns and generated hypotheses.",
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



  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Logging
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                Health Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track patterns and insights from your health data
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis Results */}
        {analysis && <AIAnalysisCard analysis={analysis} />}

        {/* Coming Soon Features */}
        {logs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="shadow-card opacity-75">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Search className="h-4 w-4" />
                  Reddit Case Search
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Coming Soon</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Find similar health cases and experiences from Reddit communities
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card opacity-75">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Visual Charts
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Coming Soon</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Interactive charts showing symptom trends over time
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Dashboard */}
        <LogDashboard 
          logs={logs} 
          onAnalyze={handleAnalyze}
        />

        {/* Loading Analysis */}
        {isAnalyzing && (
          <Card className="mt-8 shadow-medical">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Generating AI Hypotheses</h3>
              <p className="text-muted-foreground">
                AI is analyzing your {logs.length} health logs to generate hypotheses and identify patterns...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;