import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiService } from '@/services/ai';

const TestAI = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAI = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Create test logs
      const testLogs = [
        {
          id: '1',
          date: '2024-01-01',
          symptoms: ['headache', 'fatigue'],
          medications: ['ibuprofen'],
          severity: 6,
          mood: 'poor',
          sleep: 6,
          notes: 'Feeling tired and headache'
        },
        {
          id: '2',
          date: '2024-01-02',
          symptoms: ['fatigue', 'nausea'],
          medications: ['none'],
          severity: 7,
          mood: 'terrible',
          sleep: 5,
          notes: 'Very tired and sick to stomach'
        },
        {
          id: '3',
          date: '2024-01-03',
          symptoms: ['headache'],
          medications: ['aspirin'],
          severity: 4,
          mood: 'neutral',
          sleep: 8,
          notes: 'Better today'
        }
      ];

      console.log('Testing AI service with logs:', testLogs);
      console.log('Environment variables:');
      console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 'Present' : 'Missing');
      console.log('API Key length:', import.meta.env.VITE_OPENAI_API_KEY?.length || 0);

      const analysis = await aiService.generateHypothesis(testLogs);
      
      setResult(JSON.stringify(analysis, null, 2));
      console.log('AI Analysis result:', analysis);
      
    } catch (error) {
      console.error('Test failed:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Service Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testAI} disabled={loading}>
            {loading ? 'Testing...' : 'Test AI Service'}
          </Button>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAI; 