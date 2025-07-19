import React, { useState, useEffect } from 'react';
import { LogForm } from '@/components/LogForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Brain, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const Index = () => {
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const savedLogs = localStorage.getItem('healthLogs');
    if (savedLogs) {
      setTotalLogs(JSON.parse(savedLogs).length);
    }
  }, []);

  const handleLogAdded = (log: HealthLog) => {
    setTotalLogs(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Activity className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Data Diary</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Your Personal Health Detective
            </p>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Track symptoms, analyze patterns with AI, and discover insights to help solve your health mysteries
            </p>
            
            {totalLogs > 0 && (
              <div className="flex items-center justify-center gap-4">
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <span className="text-2xl font-bold">{totalLogs}</span>
                  <p className="text-sm">Health Logs</p>
                </div>
                <Link to="/dashboard">
                  <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                    View Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Daily Logging</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Record symptoms, medications, mood, and sleep patterns with our comprehensive logging system
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="text-center">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Discover hidden patterns and correlations in your health data using advanced AI pattern recognition
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Insights & Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Visualize your health journey and get actionable insights to share with healthcare providers
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Logging Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <LogForm onLogAdded={handleLogAdded} />
        </div>

        {/* Quick Access */}
        {totalLogs > 0 && (
          <div className="text-center">
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="shadow-medical">
                <TrendingUp className="h-5 w-5 mr-2" />
                View Your {totalLogs} Health {totalLogs === 1 ? 'Log' : 'Logs'}
              </Button>
            </Link>
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="shadow-card opacity-75">
              <CardHeader>
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Reddit Case Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find similar health experiences and stories from Reddit communities to gain additional insights
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card opacity-75">
              <CardHeader>
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Visual Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interactive charts and graphs to visualize your symptom trends and health patterns over time
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
