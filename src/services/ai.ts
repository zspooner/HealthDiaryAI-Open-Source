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
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Note: In production, this should be handled server-side
    });
  }

  async generateHypothesis(logs: HealthLog[]): Promise<HypothesisAnalysis> {
    try {
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
      throw new Error('Failed to generate hypothesis analysis');
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