import OpenAI from 'openai';

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

interface HypothesisAnalysis {
  patterns: string[];
  potentialCauses: string[];
  recommendations: string[];
  riskFactors: string[];
  nextSteps: string[];
  disclaimer: string;
}

class AIService {
  private openai: OpenAI;

  constructor() {
    let apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    // Handle case where API key is wrapped across multiple lines
    if (apiKey && apiKey.includes('\n')) {
      apiKey = apiKey.replace(/\n/g, '');
    }
    
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined');
    console.log('API Key ends with:', apiKey ? '...' + apiKey.substring(apiKey.length - 10) : 'undefined');
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      console.warn('API key format appears invalid, will use fallback analysis');
      this.openai = null;
      return;
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, this should be handled server-side
    });
  }

  async generateHypothesis(logs: HealthLog[]): Promise<HypothesisAnalysis> {
    try {
      console.log('Starting AI analysis with logs:', logs.length);
      console.log('API Key available:', !!import.meta.env.VITE_OPENAI_API_KEY);
      console.log('API Key length:', import.meta.env.VITE_OPENAI_API_KEY?.length || 0);
      
      // Check if OpenAI client is available
      if (!this.openai) {
        console.log('OpenAI client not available, using fallback analysis');
        return this.generateFallbackAnalysis(logs);
      }
      
      const logsSummary = this.formatLogsForAnalysis(logs);
      
      const prompt = `You are a medical AI assistant analyzing health logs to identify patterns and generate hypotheses. 

IMPORTANT: You are NOT providing medical diagnosis or treatment. You are analyzing patterns and suggesting possible correlations that should be discussed with healthcare professionals.

Analyze the following health logs and provide insights in this exact JSON format:

{
  "patterns": ["pattern1", "pattern2", "pattern3"],
  "potentialCauses": ["possible cause 1", "possible cause 2", "possible cause 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "riskFactors": ["risk factor 1", "risk factor 2"],
  "nextSteps": ["next step 1", "next step 2", "next step 3"],
  "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider about any concerns."
}

Health Logs Data:
${logsSummary}

Focus on:
- Temporal patterns (time of day, day of week, seasonal)
- Symptom correlations with sleep, mood, medications
- Potential triggers or aggravating factors
- Lifestyle factors that might be relevant
- Patterns that suggest when to seek medical attention

Be specific but cautious. If you see concerning patterns, emphasize the need for professional evaluation.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful medical AI assistant that analyzes health patterns and generates hypotheses. Always emphasize that you are not providing medical diagnosis and that users should consult healthcare professionals."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Try to parse JSON response
      try {
        const analysis = JSON.parse(content);
        return analysis as HypothesisAnalysis;
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        return this.parseTextResponse(content);
      }

    } catch (error) {
      console.error('AI Analysis Error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // If it's an API error (401, 403, etc.), use fallback analysis
      if (error.message.includes('401') || error.message.includes('403') || 
          error.message.includes('Incorrect API key') || error.message.includes('Invalid API key')) {
        console.log('API key error detected, using fallback analysis');
        return this.generateFallbackAnalysis(logs);
      }
      
      throw new Error(`Failed to generate hypothesis analysis: ${error.message}`);
    }
  }

  private formatLogsForAnalysis(logs: HealthLog[]): string {
    return logs.map(log => {
      const date = new Date(log.date);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const timeOfDay = date.getHours() < 12 ? 'morning' : date.getHours() < 17 ? 'afternoon' : 'evening';
      
      return `Date: ${log.date} (${dayOfWeek}, ${timeOfDay})
Symptoms: ${log.symptoms.join(', ')}
Medications: ${log.medications.join(', ')}
Severity: ${log.severity}/10
Mood: ${log.mood}
Sleep: ${log.sleep} hours
Notes: ${log.notes}
---`;
    }).join('\n');
  }

  private generateFallbackAnalysis(logs: HealthLog[]): HypothesisAnalysis {
    console.log('Generating fallback analysis based on local data');
    
    const avgSeverity = logs.reduce((sum, log) => sum + log.severity, 0) / logs.length;
    const avgSleep = logs.reduce((sum, log) => sum + log.sleep, 0) / logs.length;
    const commonSymptoms = this.getCommonSymptoms(logs);
    const severityTrend = this.getSeverityTrend(logs);
    
    return {
      patterns: [
        `Average symptom severity is ${avgSeverity.toFixed(1)}/10`,
        `Average sleep duration is ${avgSleep.toFixed(1)} hours`,
        `Most common symptoms: ${commonSymptoms.join(', ')}`,
        severityTrend
      ],
      potentialCauses: [
        'Stress and lifestyle factors',
        'Sleep quality and duration',
        'Diet and nutrition',
        'Environmental factors',
        'Medication interactions'
      ],
      recommendations: [
        'Continue tracking symptoms for better pattern recognition',
        'Monitor sleep quality and its impact on symptoms',
        'Note any dietary changes or triggers',
        'Track stress levels and their correlation with symptoms',
        'Consult healthcare provider if symptoms worsen'
      ],
      riskFactors: avgSeverity > 7 ? [
        'High symptom severity - consider medical evaluation',
        'Poor sleep quality may be contributing to symptoms'
      ] : [],
      nextSteps: [
        'Continue daily symptom logging',
        'Share this data with your healthcare provider',
        'Monitor for any new or worsening symptoms',
        'Consider lifestyle modifications based on patterns'
      ],
      disclaimer: "This is a local analysis based on your logged data. For comprehensive medical evaluation, please consult with your healthcare provider. This analysis is for informational purposes only and should not replace professional medical advice."
    };
  }

  private getCommonSymptoms(logs: HealthLog[]): string[] {
    const symptomCounts = logs.reduce((acc, log) => {
      log.symptoms.forEach(symptom => {
        acc[symptom] = (acc[symptom] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom]) => symptom);
  }

  private getSeverityTrend(logs: HealthLog[]): string {
    if (logs.length < 2) return 'Insufficient data to determine trend';
    
    const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstHalf = sortedLogs.slice(0, Math.ceil(logs.length / 2));
    const secondHalf = sortedLogs.slice(Math.ceil(logs.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, log) => sum + log.severity, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, log) => sum + log.severity, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 1) return 'Symptoms appear to be worsening over time';
    if (secondAvg < firstAvg - 1) return 'Symptoms appear to be improving over time';
    return 'Symptoms appear to be stable over time';
  }

  private parseTextResponse(content: string): HypothesisAnalysis {
    // Fallback parsing if JSON parsing fails
    const lines = content.split('\n').filter(line => line.trim());
    
    const patterns: string[] = [];
    const potentialCauses: string[] = [];
    const recommendations: string[] = [];
    const riskFactors: string[] = [];
    const nextSteps: string[] = [];
    
    let currentSection = '';
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('pattern')) currentSection = 'patterns';
      else if (lowerLine.includes('cause') || lowerLine.includes('trigger')) currentSection = 'causes';
      else if (lowerLine.includes('recommend')) currentSection = 'recommendations';
      else if (lowerLine.includes('risk')) currentSection = 'risk';
      else if (lowerLine.includes('next step') || lowerLine.includes('action')) currentSection = 'next';
      else if (line.trim() && line.startsWith('-') || line.startsWith('•')) {
        const item = line.replace(/^[-•]\s*/, '').trim();
        if (item) {
          switch (currentSection) {
            case 'patterns': patterns.push(item); break;
            case 'causes': potentialCauses.push(item); break;
            case 'recommendations': recommendations.push(item); break;
            case 'risk': riskFactors.push(item); break;
            case 'next': nextSteps.push(item); break;
          }
        }
      }
    });

    return {
      patterns: patterns.length > 0 ? patterns : ['No clear patterns identified yet'],
      potentialCauses: potentialCauses.length > 0 ? potentialCauses : ['Continue tracking to identify potential causes'],
      recommendations: recommendations.length > 0 ? recommendations : ['Continue logging for better pattern recognition'],
      riskFactors: riskFactors.length > 0 ? riskFactors : ['Monitor for any concerning changes'],
      nextSteps: nextSteps.length > 0 ? nextSteps : ['Continue tracking symptoms and consult healthcare provider if concerned'],
      disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider about any concerns."
    };
  }
}

export const aiService = new AIService();
export type { HypothesisAnalysis, HealthLog }; 