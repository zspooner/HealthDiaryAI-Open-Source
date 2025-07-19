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
  constructor() {
    // AI analysis now handled securely via Supabase Edge Function
  }

  async generateHypothesis(logs: HealthLog[]): Promise<HypothesisAnalysis> {
    try {
      console.log('Starting AI analysis with logs:', logs.length);
      
      // Call the secure Edge Function instead of OpenAI directly
      const response = await fetch('https://opiuyyiqkmmiffaagqnk.supabase.co/functions/v1/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error:', response.status, errorText);
        throw new Error(`Edge function error: ${response.status} ${errorText}`);
      }

      const analysis = await response.json();
      console.log('Successfully received AI analysis from Edge Function');
      return analysis as HypothesisAnalysis;

    } catch (error) {
      console.error('AI Analysis Error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // If the Edge Function fails, use local fallback analysis
      console.log('Edge function failed, using local fallback analysis');
      return this.generateFallbackAnalysis(logs);
    }
  }

  // This method is no longer needed as formatting is done in the Edge Function
  // Keeping it for potential future use or local fallback

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