import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, BarChart3, Brain, Shield, Loader2, Activity, TestTube, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  console.log('Index page loading:', { user, loading });

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Activity className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              HealthDiaryAI
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Your comprehensive health tracking companion with AI-powered insights. 
            Monitor symptoms, track medications, and discover patterns in your health data.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg"
              className="text-lg px-8 py-3"
            >
              Get Started
            </Button>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader>
              <Heart className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Health Logging</CardTitle>
              <CardDescription>
                Track symptoms, medications, mood, sleep, and daily health metrics with ease.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader>
              <TestTube className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Lab Work & Tests</CardTitle>
              <CardDescription>
                Record and monitor lab results, medical tests, and diagnostic reports.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Data Visualization</CardTitle>
              <CardDescription>
                View your health trends and patterns through intuitive charts and graphs.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader>
              <Brain className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Get intelligent analysis of your health patterns and receive personalized recommendations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader>
              <Shield className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your health data is encrypted and secure with user authentication and privacy protection.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Monitor your health journey over time and share insights with healthcare providers.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ready to take control of your health?
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            size="lg"
            variant="outline"
            className="text-lg px-8 py-3"
          >
            Create Your Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;