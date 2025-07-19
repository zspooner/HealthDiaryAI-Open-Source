import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Analysis Edge Function called');
    const { logs, analysisType, focusOnCauses } = await req.json();
    
    if (!logs || !Array.isArray(logs)) {
      throw new Error('Invalid logs data provided');
    }

    console.log('Processing', logs.length, 'health logs');
    console.log('Analysis type:', analysisType || 'standard');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.log('OpenAI API key not found, using fallback analysis');
      return new Response(JSON.stringify(generateFallbackAnalysis(logs)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key format
    if (!openAIApiKey.startsWith('sk-')) {
      console.log('Invalid API key format, using fallback analysis');
      return new Response(JSON.stringify(generateFallbackAnalysis(logs)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const logsSummary = formatLogsForAnalysis(logs);
    
    // Different prompts based on analysis type
    let prompt: string;
    
    if (analysisType === 'medical_hypotheses' || focusOnCauses) {
      prompt = `You are a medical AI assistant generating potential medical hypotheses about symptom causes. 

CRITICAL: You are NOT diagnosing or providing medical treatment. You are generating hypotheses about potential CAUSES that require professional medical evaluation.

Analyze the following health logs and provide potential medical hypotheses in this exact JSON format:

{
  "patterns": ["symptom pattern 1", "symptom pattern 2", "symptom pattern 3"],
  "potentialCauses": ["Medical condition 1 (requires doctor evaluation)", "Medical condition 2 (needs medical testing)", "Medical condition 3 (discuss with physician)"],
  "recommendations": ["🚨 IMPORTANT: Discuss these hypotheses with your doctor", "Request comprehensive medical evaluation", "Consider specific medical tests as recommended by physician"],
  "riskFactors": ["Medical risk factor 1", "Medical risk factor 2"],
  "nextSteps": ["🏥 Schedule appointment with healthcare provider", "📋 Prepare symptom summary for doctor", "🔬 Request appropriate diagnostic tests"],
  "disclaimer": "🚨 MEDICAL DISCLAIMER: These are potential medical hypotheses only and require professional medical evaluation. This analysis is NOT a diagnosis and should not replace consultation with qualified healthcare providers. Please discuss all symptoms and potential causes with your doctor immediately."
}

Health Logs Data:
${logsSummary}

Focus specifically on:
- Potential medical conditions that could cause these symptoms
- Systematic diseases that might explain symptom patterns
- Inflammatory, autoimmune, or metabolic conditions
- Hormonal or nutritional causes
- Infectious disease possibilities
- Medication side effects or interactions
- When immediate medical attention may be warranted

Generate specific medical hypotheses that a doctor should evaluate. Always emphasize the need for professional medical consultation.`;
    } else {
      prompt = `You are a medical AI assistant analyzing health logs to identify patterns and generate hypotheses. 

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
    }

    console.log('Calling OpenAI API');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 401 || response.status === 403) {
        console.log('API authentication error, using fallback analysis');
        return new Response(JSON.stringify(generateFallbackAnalysis(logs)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('OpenAI response received, parsing...');

    // Try to parse JSON response
    try {
      const analysis = JSON.parse(content);
      console.log('Successfully parsed AI analysis');
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.log('JSON parsing failed, using text parsing fallback');
      const analysis = parseTextResponse(content);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('AI Analysis Error:', error);
    
    // Return fallback analysis on any error
    try {
      const { logs, analysisType, focusOnCauses } = await req.json();
      const fallbackAnalysis = (analysisType === 'medical_hypotheses' || focusOnCauses) 
        ? generateMedicalHypothesesFallback(logs || [])
        : generateFallbackAnalysis(logs || []);
      return new Response(JSON.stringify(fallbackAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      // If we can't even parse the request, return a basic error response
      return new Response(JSON.stringify({
        patterns: ['Unable to analyze data due to technical error'],
        potentialCauses: ['System error occurred'],
        recommendations: ['Please try again later'],
        riskFactors: [],
        nextSteps: ['Contact support if issue persists'],
        disclaimer: 'This analysis could not be completed due to a technical error.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
});

function formatLogsForAnalysis(logs: HealthLog[]): string {
  return logs.map(log => {
    const date = new Date(log.date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay = date.getHours() < 12 ? 'morning' : date.getHours() < 17 ? 'afternoon' : 'evening';
    
    return `Date: ${log.date} (${dayOfWeek}, ${timeOfDay})
Symptoms: ${log.symptoms?.join(', ') || 'None'}
Medications: ${log.medications?.join(', ') || 'None'}
Severity: ${log.severity}/10
Mood: ${log.mood}
Sleep: ${log.sleep} hours
Notes: ${log.notes}
---`;
  }).join('\n');
}

function generateFallbackAnalysis(logs: HealthLog[]): HypothesisAnalysis {
  console.log('Generating fallback analysis for', logs.length, 'logs');
  
  if (logs.length === 0) {
    return {
      patterns: ['No health logs available for analysis'],
      potentialCauses: ['Insufficient data to identify causes'],
      recommendations: ['Start logging your symptoms daily for better insights'],
      riskFactors: [],
      nextSteps: ['Begin tracking your health data consistently'],
      disclaimer: "This analysis is based on limited data. For comprehensive medical evaluation, please consult with your healthcare provider."
    };
  }
  
  const avgSeverity = logs.reduce((sum, log) => sum + (log.severity || 0), 0) / logs.length;
  const avgSleep = logs.reduce((sum, log) => sum + (log.sleep || 0), 0) / logs.length;
  const commonSymptoms = getCommonSymptoms(logs);
  const severityTrend = getSeverityTrend(logs);
  
  return {
    patterns: [
      `Average symptom severity is ${avgSeverity.toFixed(1)}/10`,
      `Average sleep duration is ${avgSleep.toFixed(1)} hours`,
      `Most common symptoms: ${commonSymptoms.join(', ') || 'None recorded'}`,
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

function generateMedicalHypothesesFallback(logs: HealthLog[]): HypothesisAnalysis {
  console.log('Generating medical hypotheses fallback for', logs.length, 'logs');
  
  if (logs.length === 0) {
    return {
      patterns: ['No health logs available for medical analysis'],
      potentialCauses: ['Insufficient data to generate medical hypotheses'],
      recommendations: ['🚨 Start logging symptoms and consult with healthcare provider'],
      riskFactors: [],
      nextSteps: ['🏥 Schedule medical consultation for proper evaluation'],
      disclaimer: "🚨 MEDICAL DISCLAIMER: No symptoms to analyze. Please consult with your healthcare provider for proper medical evaluation."
    };
  }
  
  const commonSymptoms = getCommonSymptoms(logs);
  const avgSeverity = logs.reduce((sum, log) => sum + (log.severity || 0), 0) / logs.length;
  const avgSleep = logs.reduce((sum, log) => sum + (log.sleep || 0), 0) / logs.length;
  
  return {
    patterns: [
      `Primary symptoms: ${commonSymptoms.join(', ') || 'Various symptoms recorded'}`,
      `Severity pattern: ${avgSeverity.toFixed(1)}/10 average`,
      `Sleep correlation: ${avgSleep.toFixed(1)} hours average`,
      getSeverityTrend(logs)
    ],
    potentialCauses: [
      'Inflammatory conditions (requires medical evaluation)',
      'Autoimmune disorders (blood work and specialist consultation needed)',
      'Hormonal imbalances (endocrine evaluation recommended)',
      'Chronic stress syndrome (multidisciplinary assessment)',
      'Nutritional deficiencies (laboratory testing suggested)',
      'Sleep disorders (sleep study consideration)',
      'Medication side effects (pharmacological review)',
      'Environmental or infectious triggers (specialist evaluation)'
    ],
    recommendations: [
      '🚨 IMPORTANT: Discuss these hypotheses with your doctor immediately',
      'Request comprehensive blood work and physical examination',
      'Consider specialist referrals as recommended by physician',
      'Prepare detailed symptom timeline for medical consultation',
      'Bring this analysis to your next medical appointment'
    ],
    riskFactors: [
      'Persistent symptoms requiring professional medical evaluation',
      'Multiple symptom patterns suggesting systematic causes',
      'Impact on daily functioning and quality of life',
      'Need for proper diagnostic workup and testing'
    ],
    nextSteps: [
      '🏥 Schedule urgent appointment with healthcare provider',
      '📋 Prepare comprehensive list of symptoms for doctor visit',
      '🔬 Request appropriate diagnostic tests as recommended',
      '📝 Continue detailed symptom tracking until medical consultation',
      '💊 Review all medications with doctor for potential interactions'
    ],
    disclaimer: "🚨 MEDICAL DISCLAIMER: These are potential medical hypotheses only and require immediate professional medical evaluation. This analysis is NOT a diagnosis and should not replace urgent consultation with qualified healthcare providers. Please discuss all symptoms and potential causes with your doctor, who can order appropriate tests and provide proper medical assessment."
  };
}

function getCommonSymptoms(logs: HealthLog[]): string[] {
  const symptomCounts: Record<string, number> = {};
  
  logs.forEach(log => {
    if (log.symptoms && Array.isArray(log.symptoms)) {
      log.symptoms.forEach(symptom => {
        if (symptom && typeof symptom === 'string') {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        }
      });
    }
  });
  
  return Object.entries(symptomCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([symptom]) => symptom);
}

function getSeverityTrend(logs: HealthLog[]): string {
  if (logs.length < 2) return 'Insufficient data to determine trend';
  
  const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstHalf = sortedLogs.slice(0, Math.ceil(logs.length / 2));
  const secondHalf = sortedLogs.slice(Math.ceil(logs.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, log) => sum + (log.severity || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, log) => sum + (log.severity || 0), 0) / secondHalf.length;
  
  if (secondAvg > firstAvg + 1) return 'Symptoms appear to be worsening over time';
  if (secondAvg < firstAvg - 1) return 'Symptoms appear to be improving over time';
  return 'Symptoms appear to be stable over time';
}

function parseTextResponse(content: string): HypothesisAnalysis {
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
    else if (line.trim() && (line.startsWith('-') || line.startsWith('•'))) {
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