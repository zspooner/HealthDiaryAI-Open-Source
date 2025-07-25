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
  labInsights?: string[];
  testCorrelations?: string[];
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
    const requestData = await req.json();
    
    // Check if this is a Reddit search request
    if (requestData.redditSearch) {
      console.log('Reddit search request received:', requestData.redditSearch);
      const redditPosts = await searchReddit(requestData.redditSearch.query, requestData.redditSearch.subreddit);
      return new Response(JSON.stringify({ redditPosts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Regular AI analysis request
    const { logs, labWork = [], medicalTests = [], analysisType, focusOnCauses } = requestData;
    
    if (!logs || !Array.isArray(logs)) {
      throw new Error('Invalid logs data provided');
    }

    console.log('Processing', logs.length, 'health logs,', labWork.length, 'lab work,', medicalTests.length, 'medical tests');
    console.log('Analysis type:', analysisType || 'standard');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.log('OpenAI API key not found, using fallback analysis');
      const fallbackAnalysis = (analysisType === 'medical_hypotheses' || focusOnCauses) 
        ? generateMedicalHypothesesFallback(logs, labWork, medicalTests)
        : generateFallbackAnalysis(logs, labWork, medicalTests);
      return new Response(JSON.stringify(fallbackAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key format (supports both sk- and sk-proj- formats)
    if (!openAIApiKey.startsWith('sk-')) {
      console.log('Invalid API key format, using fallback analysis');
      const fallbackAnalysis = (analysisType === 'medical_hypotheses' || focusOnCauses) 
        ? generateMedicalHypothesesFallback(logs, labWork, medicalTests)
        : generateFallbackAnalysis(logs, labWork, medicalTests);
      return new Response(JSON.stringify(fallbackAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dataSummary = formatAllDataForAnalysis(logs, labWork, medicalTests);
    
    // Different prompts based on analysis type
    let prompt: string;
    
    if (analysisType === 'single_log_analysis') {
      prompt = `You are a medical AI assistant analyzing a SINGLE health log entry to provide immediate insights and preliminary observations.

CRITICAL: You are analyzing just ONE log entry, so your insights will be limited. This is for immediate feedback, not comprehensive analysis.

IMPORTANT: You are NOT providing medical diagnosis or treatment. You are providing preliminary observations that should be discussed with healthcare professionals.

The user is asking: "Analyze this single health log and give me immediate insights."

Analyze the following SINGLE health log and provide preliminary insights in this exact JSON format:

{
  "patterns": ["immediate observation 1", "single log pattern 2", "preliminary insight 3"],
  "potentialCauses": ["possible factor 1", "potential trigger 2", "preliminary cause 3"],
  "recommendations": ["immediate action 1", "preliminary recommendation 2", "next step 3"],
  "riskFactors": ["preliminary risk 1", "concern to monitor 2"],
  "nextSteps": ["immediate next step 1", "monitoring action 2", "preparation step 3"],
  "disclaimer": "SINGLE LOG ANALYSIS: This analysis is based on just one health log entry. For more accurate insights, consider logging 7+ entries over time. This analysis is for informational purposes only and should not replace professional medical advice."
}

Single Health Log Data:
${dataSummary}

Provide preliminary insights focusing on:
- Immediate observations from this single log entry
- Potential factors that could be contributing to the symptoms
- Preliminary recommendations based on the available data
- Any concerning patterns that warrant attention
- Immediate next steps for the user
- What additional data would be helpful to collect

Think like a medical assistant doing a quick review - provide immediate, preliminary insights while emphasizing the limitations of single-log analysis. Be encouraging about continuing to log data for better insights. If you see concerning patterns, emphasize the need for professional evaluation.`;
    } else if (analysisType === 'medical_hypotheses' || focusOnCauses) {
      prompt = `You are a medical AI assistant analyzing health data to identify the ROOT CAUSE of symptoms. 

CRITICAL: You are NOT diagnosing or providing medical treatment. You are generating educated hypotheses about the UNDERLYING CAUSES that require professional medical evaluation.

The user is asking: "Use my data and come up with your best guess for the root cause of my issues."

Analyze the following health logs and provide root cause hypotheses in this exact JSON format:

{
  "patterns": ["key symptom pattern 1", "key symptom pattern 2", "key symptom pattern 3"],
  "potentialCauses": ["Specific medical condition that could be the root cause (requires doctor evaluation)", "Another potential root cause (needs medical testing)", "Additional root cause possibility (discuss with physician)"],
  "recommendations": ["CRITICAL: These hypotheses require immediate medical evaluation", "Request comprehensive diagnostic workup from your doctor", "Consider specific medical tests to confirm or rule out these causes"],
  "riskFactors": ["Medical risk factor that supports this hypothesis", "Additional risk factor that increases likelihood"],
  "nextSteps": ["URGENT: Schedule appointment with healthcare provider", "Prepare detailed symptom timeline for doctor", "Request specific diagnostic tests based on these hypotheses", "Bring all lab work and test results to appointment"],
  "disclaimer": "MEDICAL DISCLAIMER: These are educated hypotheses about potential ROOT CAUSES only and require immediate professional medical evaluation. This analysis is NOT a diagnosis and should not replace consultation with qualified healthcare providers. These hypotheses are meant to guide your discussion with your doctor, who can order appropriate tests and provide proper medical assessment."
}

Comprehensive Health Data:
${dataSummary}

Your task is to identify the ROOT CAUSE. Focus specifically on:
- What underlying medical condition could be causing ALL these symptoms?
- What systematic disease or disorder might explain the symptom patterns?
- What inflammatory, autoimmune, or metabolic condition could be the source?
- What hormonal imbalance or nutritional deficiency might be the root cause?
- What medication side effect or interaction could be causing this?
- What infectious disease or chronic condition might be underlying?
- When is immediate medical attention warranted?

Think like a medical detective - what is the most likely root cause that explains all the symptoms together? Generate specific, actionable hypotheses that a doctor should investigate. Always emphasize the need for professional medical consultation.`;
    } else if (analysisType === 'general_analysis') {
      prompt = `You are a comprehensive health AI assistant analyzing health data to provide general health insights and patterns.

The user is asking: "Use this data to give me general analysis of my health symptoms."

IMPORTANT: You are NOT providing medical diagnosis or treatment. You are analyzing patterns and providing general health insights that should be discussed with healthcare professionals.

Analyze the following health logs and provide comprehensive general health analysis in this exact JSON format:

{
  "patterns": ["key health pattern 1", "key health pattern 2", "key health pattern 3"],
  "potentialCauses": ["lifestyle factor 1", "environmental factor 2", "behavioral factor 3"],
  "recommendations": ["lifestyle recommendation 1", "wellness recommendation 2", "monitoring recommendation 3"],
  "riskFactors": ["general health risk 1", "lifestyle risk 2"],
  "nextSteps": ["immediate action 1", "ongoing monitoring 2", "lifestyle adjustment 3"],
  "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider about any concerns."
}

Comprehensive Health Data:
${dataSummary}

Provide a comprehensive general health analysis focusing on:
- Overall health patterns and trends over time
- Lifestyle correlations (sleep quality, mood patterns, stress levels, dietary habits)
- Temporal patterns (time of day, day of week, seasonal variations)
- Symptom correlations with daily activities and routines
- Potential lifestyle triggers or aggravating factors
- General wellness insights and observations
- Quality of life impact and daily functioning
- Patterns that suggest when lifestyle changes might help
- Overall health trajectory and trends

Think like a wellness coach - provide insights that help the user understand their general health patterns and make informed lifestyle decisions. Be encouraging but realistic. If you see concerning patterns, emphasize the need for professional evaluation.`;
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

Comprehensive Health Data:
${dataSummary}

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
        const fallbackAnalysis = (analysisType === 'medical_hypotheses' || focusOnCauses) 
          ? generateMedicalHypothesesFallback(logs, labWork, medicalTests)
          : generateFallbackAnalysis(logs, labWork, medicalTests);
        return new Response(JSON.stringify(fallbackAnalysis), {
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
      const analysis = parseTextResponse(content, analysisType);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('AI Analysis Error:', error);
    
    // Return fallback analysis on any error
    try {
      const { logs, labWork = [], medicalTests = [], analysisType, focusOnCauses } = await req.json();
      const fallbackAnalysis = (analysisType === 'medical_hypotheses' || focusOnCauses) 
        ? generateMedicalHypothesesFallback(logs || [], labWork, medicalTests)
        : generateFallbackAnalysis(logs || [], labWork, medicalTests);
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

function formatAllDataForAnalysis(logs: HealthLog[], labWork: any[], medicalTests: any[]): string {
  let formattedData = formatLogsForAnalysis(logs);
  
  if (labWork.length > 0) {
    formattedData += '\n\nLAB WORK DATA:\n';
    labWork.forEach((lab, index) => {
      formattedData += `\nLab Entry ${index + 1}:\n`;
      formattedData += `Date: ${lab.date}\n`;
      formattedData += `Lab/Facility: ${lab.labName}\n`;
      formattedData += `Test Type: ${lab.testType}\n`;
      if (lab.orderingPhysician) formattedData += `Ordering Physician: ${lab.orderingPhysician}\n`;
      
      if (lab.tests && lab.tests.length > 0) {
        formattedData += 'Test Results:\n';
        lab.tests.forEach((test: any) => {
          formattedData += `  - ${test.name}: ${test.value}`;
          if (test.unit) formattedData += ` ${test.unit}`;
          if (test.referenceRange) formattedData += ` (Reference: ${test.referenceRange})`;
          if (test.status) formattedData += ` [Status: ${test.status}]`;
          if (test.notes) formattedData += ` - Notes: ${test.notes}`;
          formattedData += '\n';
        });
      }
      
      if (lab.overallNotes) formattedData += `Overall Notes: ${lab.overallNotes}\n`;
    });
  }
  
  if (medicalTests.length > 0) {
    formattedData += '\n\nMEDICAL TESTS/IMAGING DATA:\n';
    medicalTests.forEach((test, index) => {
      formattedData += `\nMedical Test ${index + 1}:\n`;
      formattedData += `Date: ${test.date}\n`;
      formattedData += `Test Type: ${test.testType}\n`;
      formattedData += `Test Name: ${test.testName}\n`;
      if (test.facility) formattedData += `Facility: ${test.facility}\n`;
      if (test.orderingPhysician) formattedData += `Ordering Physician: ${test.orderingPhysician}\n`;
      formattedData += `Results: ${test.results}\n`;
      if (test.impression) formattedData += `Impression: ${test.impression}\n`;
      if (test.recommendations) formattedData += `Recommendations: ${test.recommendations}\n`;
      if (test.followUp) formattedData += `Follow-up: ${test.followUp}\n`;
    });
  }
  
  return formattedData;
}

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

function generateFallbackAnalysis(logs: HealthLog[], labWork: any[] = [], medicalTests: any[] = []): HypothesisAnalysis {
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
  
  const patterns = [
    `Average symptom severity is ${avgSeverity.toFixed(1)}/10`,
    `Average sleep duration is ${avgSleep.toFixed(1)} hours`,
    `Most common symptoms: ${commonSymptoms.join(', ') || 'None recorded'}`,
    severityTrend
  ];

  // Add lab work insights if available
  if (labWork.length > 0) {
    patterns.push(`${labWork.length} lab work entries available for analysis`);
    const abnormalResults = labWork.flatMap(lab => 
      lab.tests?.filter((test: any) => test.status && ['abnormal', 'high', 'low', 'critical'].includes(test.status)) || []
    );
    if (abnormalResults.length > 0) {
      patterns.push(`${abnormalResults.length} abnormal lab results require attention`);
    }
  }

  // Add medical test insights if available
  if (medicalTests.length > 0) {
    patterns.push(`${medicalTests.length} medical test entries available for correlation`);
  }
  
  return {
    patterns,
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
    disclaimer: "This is a local analysis based on your logged data. For comprehensive medical evaluation, please consult with your healthcare provider. This analysis is for informational purposes only and should not replace professional medical advice.",
    labInsights: labWork.length > 0 ? [`${labWork.length} lab work entries included in analysis`] : [],
    testCorrelations: medicalTests.length > 0 ? [`${medicalTests.length} medical tests included for correlation analysis`] : []
  };
}

function generateMedicalHypothesesFallback(logs: HealthLog[], labWork: any[] = [], medicalTests: any[] = []): HypothesisAnalysis {
  console.log('Generating medical hypotheses fallback for', logs.length, 'logs');
  
  if (logs.length === 0) {
    return {
      patterns: ['No health logs available for medical analysis'],
      potentialCauses: ['Insufficient data to generate medical hypotheses'],
      recommendations: ['Start logging symptoms and consult with healthcare provider'],
      riskFactors: [],
      nextSteps: ['Schedule medical consultation for proper evaluation'],
      disclaimer: "MEDICAL DISCLAIMER: No symptoms to analyze. Please consult with your healthcare provider for proper medical evaluation."
    };
  }
  
  const commonSymptoms = getCommonSymptoms(logs);
  const avgSeverity = logs.reduce((sum, log) => sum + (log.severity || 0), 0) / logs.length;
  const avgSleep = logs.reduce((sum, log) => sum + (log.sleep || 0), 0) / logs.length;
  
  const patterns = [
    `Primary symptoms: ${commonSymptoms.join(', ') || 'Various symptoms recorded'}`,
    `Severity pattern: ${avgSeverity.toFixed(1)}/10 average`,
    `Sleep correlation: ${avgSleep.toFixed(1)} hours average`,
    getSeverityTrend(logs)
  ];

  // Include lab work patterns for medical analysis
  if (labWork.length > 0) {
    patterns.push(`Lab work data: ${labWork.length} entries analyzed`);
    
    const abnormalResults = labWork.flatMap(lab => 
      lab.tests?.filter((test: any) => test.status && ['abnormal', 'high', 'low', 'critical'].includes(test.status)) || []
    );
    
    if (abnormalResults.length > 0) {
      patterns.push(`Key findings: ${abnormalResults.length} abnormal lab values detected`);
      const criticalResults = abnormalResults.filter((test: any) => test.status === 'critical');
      if (criticalResults.length > 0) {
        patterns.push(`${criticalResults.length} critical lab values require immediate medical attention`);
      }
    }
  }

  // Include medical test patterns
  if (medicalTests.length > 0) {
    patterns.push(`Medical imaging/tests: ${medicalTests.length} entries for correlation analysis`);
  }
  
  return {
    patterns,
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
      'IMPORTANT: Discuss these hypotheses with your doctor immediately',
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
      'Schedule urgent appointment with healthcare provider',
      'Prepare comprehensive list of symptoms for doctor visit',
      'Request appropriate diagnostic tests as recommended',
      'Continue detailed symptom tracking until medical consultation',
      'Review all medications with doctor for potential interactions'
    ],
    disclaimer: "MEDICAL DISCLAIMER: These are potential medical hypotheses only and require immediate professional medical evaluation. This analysis is NOT a diagnosis and should not replace urgent consultation with qualified healthcare providers. Please discuss all symptoms and potential causes with your doctor, who can order appropriate tests and provide proper medical assessment.",
    labInsights: labWork.length > 0 ? [`${labWork.length} lab work entries analyzed for medical correlations`] : [],
    testCorrelations: medicalTests.length > 0 ? [`${medicalTests.length} medical tests analyzed for symptom correlations`] : []
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

function parseTextResponse(content: string, analysisType?: string): HypothesisAnalysis {
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

  // If no patterns were found, return differentiated fallback based on analysis type
  if (patterns.length === 0) {
    if (analysisType === 'medical_hypotheses') {
      return {
              patterns: ['Root Cause Analysis: No clear patterns identified yet'],
      potentialCauses: ['Continue tracking to identify potential root causes'],
      recommendations: ['CRITICAL: Continue logging for better medical pattern recognition'],
      riskFactors: ['Monitor for any concerning medical changes'],
      nextSteps: ['Continue tracking symptoms and consult healthcare provider if concerned'],
      disclaimer: "MEDICAL DISCLAIMER: This analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider about any concerns."
      };
    } else {
      return {
        patterns: ['General Health Analysis: No clear patterns identified yet'],
        potentialCauses: ['Continue tracking to identify potential lifestyle causes'],
        recommendations: ['Continue logging for better general health pattern recognition'],
        riskFactors: ['Monitor for any concerning health changes'],
        nextSteps: ['Continue tracking symptoms and consult healthcare provider if concerned'],
        disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider about any concerns."
      };
    }
  }

  return {
    patterns: patterns.length > 0 ? patterns : ['No clear patterns identified yet'],
    potentialCauses: potentialCauses.length > 0 ? potentialCauses : ['Continue tracking to identify potential causes'],
    recommendations: recommendations.length > 0 ? recommendations : ['Continue logging for better pattern recognition'],
    riskFactors: riskFactors.length > 0 ? riskFactors : ['Monitor for any concerning changes'],
    nextSteps: nextSteps.length > 0 ? nextSteps : ['Continue tracking symptoms and consult healthcare provider if concerned'],
    disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider about any concerns."
  };
}

async function searchReddit(query: string, subreddit?: string): Promise<any[]> {
  try {
    console.log('Searching Reddit for:', query, 'in subreddit:', subreddit);
    
    const subredditParam = subreddit ? `/r/${subreddit}` : '';
    const url = `https://www.reddit.com${subredditParam}/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=10`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Medical-Tracker-App/1.0 (Health Detective AI)'
      }
    });

    if (!response.ok) {
      console.error('Reddit API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return data.data.children.map((child: any) => ({
      title: child.data.title,
      selftext: child.data.selftext,
      url: `https://reddit.com${child.data.permalink}`,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      subreddit: child.data.subreddit,
      author: child.data.author
    }));
  } catch (error) {
    console.error('Error searching Reddit:', error);
    return [];
  }
}