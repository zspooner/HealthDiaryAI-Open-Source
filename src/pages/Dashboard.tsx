import React, { useState, useEffect } from 'react';
import { LogDashboard } from '@/components/LogDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Search, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const [analysis, setAnalysis] = useState<string | null>(null);
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
    
    // Simulate AI analysis (in real app, this would call OpenAI API)
    setTimeout(() => {
      const mockAnalysis = `Based on your ${logs.length} health logs, I've identified several patterns:

**Symptom Patterns:**
• Your symptoms appear to be most severe on ${getMostSevereDay()}
• Common symptom clusters include: ${getCommonSymptoms()}
• Sleep quality correlates with next-day symptom severity

**Recommendations:**
• Consider tracking triggers around high-severity days
• Your sleep-symptom correlation suggests prioritizing sleep hygiene
• Pattern suggests potential correlation with ${logs.length > 5 ? 'weekly stress cycles' : 'recent lifestyle changes'}

**Next Steps:**
• Continue logging for more comprehensive pattern detection
• Consider sharing this data with your healthcare provider
• Look into stress management techniques

*Note: This analysis is for informational purposes only and should not replace professional medical advice.*`;

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis complete",
        description: "AI has analyzed your health patterns.",
      });
    }, 3000);
  };

  const getMostSevereDay = () => {
    if (logs.length === 0) return 'weekdays';
    const dayGroups = logs.reduce((acc, log) => {
      const day = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!acc[day]) acc[day] = [];
      acc[day].push(log.severity);
      return acc;
    }, {} as Record<string, number[]>);
    
    const avgSeverityByDay = Object.entries(dayGroups).map(([day, severities]) => ({
      day,
      avg: severities.reduce((sum, s) => sum + s, 0) / severities.length
    }));
    
    return avgSeverityByDay.sort((a, b) => b.avg - a.avg)[0]?.day || 'weekdays';
  };

  const getCommonSymptoms = () => {
    const symptomCounts = logs.reduce((acc, log) => {
      log.symptoms.forEach(symptom => {
        acc[symptom] = (acc[symptom] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom]) => symptom)
      .join(', ') || 'various symptoms';
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
        {analysis && (
          <Card className="mb-8 shadow-insight">
            <CardHeader className="bg-gradient-accent">
              <CardTitle className="flex items-center gap-2 text-accent-foreground">
                <Brain className="h-5 w-5" />
                AI Pattern Analysis
              </CardTitle>
              <CardDescription className="text-accent-foreground/80">
                Generated insights from your health logs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                {analysis.split('\n').map((line, index) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h4 key={index} className="font-semibold text-foreground mt-4 mb-2">
                        {line.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  if (line.startsWith('•')) {
                    return (
                      <li key={index} className="text-foreground ml-4">
                        {line.substring(1).trim()}
                      </li>
                    );
                  }
                  if (line.startsWith('*Note:')) {
                    return (
                      <p key={index} className="text-sm text-muted-foreground italic mt-4">
                        {line.substring(1)}
                      </p>
                    );
                  }
                  if (line.trim()) {
                    return (
                      <p key={index} className="text-foreground">
                        {line}
                      </p>
                    );
                  }
                  return <br key={index} />;
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
              <h3 className="text-lg font-semibold mb-2">Analyzing Your Health Patterns</h3>
              <p className="text-muted-foreground">
                AI is processing your {logs.length} health logs to identify patterns and insights...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;