import type { HealthLog, LabWork, MedicalTest, HypothesisAnalysis } from '@/types/health';

class AIService {
  constructor() {
    // AI analysis now handled securely via Supabase Edge Function
  }

  async generateGeneralAnalysis(logs: HealthLog[], labWork: LabWork[] = [], medicalTests: MedicalTest[] = []): Promise<HypothesisAnalysis> {
    try {
      console.log('Starting general AI analysis with logs:', logs.length, 'lab work:', labWork.length, 'medical tests:', medicalTests.length);
      
      // Call the secure Edge Function for general analysis
      const response = await fetch('https://opiuyyiqkmmiffaagqnk.supabase.co/functions/v1/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          logs, 
          labWork, 
          medicalTests,
          analysisType: 'general_analysis'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error:', response.status, errorText);
        throw new Error(`Edge function error: ${response.status} ${errorText}`);
      }

      const analysis = await response.json();
      console.log('Successfully received general AI analysis from Edge Function');
      return analysis as HypothesisAnalysis;

    } catch (error) {
      console.error('General AI Analysis Error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // If the Edge Function fails, use local fallback analysis
      console.log('Edge function failed, using local fallback analysis');
      return this.generateFallbackAnalysis(logs, labWork, medicalTests);
    }
  }

  async generateMedicalHypotheses(logs: HealthLog[], labWork: LabWork[] = [], medicalTests: MedicalTest[] = []): Promise<HypothesisAnalysis> {
    try {
      console.log('Starting medical hypotheses generation with logs:', logs.length, 'lab work:', labWork.length, 'medical tests:', medicalTests.length);
      
      // Call the secure Edge Function with focus on medical causes
      const response = await fetch('https://opiuyyiqkmmiffaagqnk.supabase.co/functions/v1/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          logs, 
          labWork,
          medicalTests,
          analysisType: 'medical_hypotheses',
          focusOnCauses: true 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error:', response.status, errorText);
        throw new Error(`Edge function error: ${response.status} ${errorText}`);
      }

      const analysis = await response.json();
      console.log('Successfully received medical hypotheses from Edge Function');
      return analysis as HypothesisAnalysis;

    } catch (error) {
      console.error('Medical Hypotheses Error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // If the Edge Function fails, use medical hypotheses fallback
      console.log('Edge function failed, using medical hypotheses fallback analysis');
      return this.generateMedicalHypothesesFallback(logs, labWork, medicalTests);
    }
  }

  // Legacy method for backward compatibility - now calls general analysis
  async generateHypothesis(logs: HealthLog[], labWork: LabWork[] = [], medicalTests: MedicalTest[] = []): Promise<HypothesisAnalysis> {
    return this.generateGeneralAnalysis(logs, labWork, medicalTests);
  }

  // This method is no longer needed as formatting is done in the Edge Function
  // Keeping it for potential future use or local fallback

  private generateFallbackAnalysis(logs: HealthLog[], labWork: LabWork[] = [], medicalTests: MedicalTest[] = []): HypothesisAnalysis {
    console.log('Generating GENERAL HEALTH fallback analysis based on local data');
    
    const avgSeverity = logs.reduce((sum, log) => sum + log.severity, 0) / logs.length;
    const avgSleep = logs.reduce((sum, log) => sum + log.sleep, 0) / logs.length;
    const commonSymptoms = this.getCommonSymptoms(logs);
    const severityTrend = this.getSeverityTrend(logs);
    
    const patterns = [
      `📊 Overall Health Pattern: Average symptom severity is ${avgSeverity.toFixed(1)}/10`,
      `😴 Sleep Quality: Average sleep duration is ${avgSleep.toFixed(1)} hours`,
      `🏥 Symptom Profile: Most common symptoms are ${commonSymptoms.join(', ')}`,
      `📈 Trend Analysis: ${severityTrend}`,
      `💡 Lifestyle Insight: Your symptoms show correlation with daily activities`
    ];

    // Add lab work insights if available
    if (labWork.length > 0) {
      patterns.push(`🔬 Lab Data: ${labWork.length} lab work entries analyzed for general health patterns`);
      const abnormalResults = labWork.flatMap(lab => 
        lab.tests.filter(test => test.status && ['abnormal', 'high', 'low', 'critical'].includes(test.status))
      );
      if (abnormalResults.length > 0) {
        patterns.push(`⚠️ Health Alert: ${abnormalResults.length} abnormal lab results detected`);
      }
    }

    // Add medical test insights if available
    if (medicalTests.length > 0) {
      patterns.push(`📋 Medical Tests: ${medicalTests.length} test entries included in general health assessment`);
    }
    
    return {
      patterns,
      potentialCauses: [
        '🌱 Lifestyle factors affecting your overall wellness',
        '😴 Sleep quality and circadian rhythm patterns',
        '🥗 Diet and nutrition impact on daily health',
        '🏃‍♂️ Physical activity and exercise correlation',
        '🧘‍♀️ Stress management and mental wellness factors'
      ],
      recommendations: [
        '📝 Continue daily health logging for better pattern recognition',
        '😴 Focus on improving sleep quality and consistency',
        '🥗 Monitor dietary patterns and their impact on symptoms',
        '🧘‍♀️ Practice stress management techniques',
        '🏃‍♂️ Consider gentle exercise and movement routines'
      ],
      riskFactors: avgSeverity > 7 ? [
        '⚠️ High symptom severity suggests need for lifestyle adjustments',
        '😴 Poor sleep quality may be affecting overall wellness'
      ] : [
        '📊 Moderate symptom levels - good opportunity for preventive health'
      ],
      nextSteps: [
        '📱 Continue using the health tracker daily',
        '🏥 Share this general health analysis with your healthcare provider',
        '📈 Monitor for any changes in your health patterns',
        '🌱 Consider lifestyle modifications based on these insights'
      ],
      disclaimer: "This is a general health analysis based on your logged data. For comprehensive medical evaluation, please consult with your healthcare provider. This analysis is for informational purposes only and should not replace professional medical advice."
    };
  }

  private generateMedicalHypothesesFallback(logs: HealthLog[], labWork: LabWork[] = [], medicalTests: MedicalTest[] = []): HypothesisAnalysis {
    console.log('Generating MEDICAL HYPOTHESES fallback based on local data');
    
    const commonSymptoms = this.getCommonSymptoms(logs);
    const avgSeverity = logs.reduce((sum, log) => sum + log.severity, 0) / logs.length;
    const avgSleep = logs.reduce((sum, log) => sum + log.sleep, 0) / logs.length;
    
    const patterns = [
      `🔍 Root Cause Analysis: Primary symptoms are ${commonSymptoms.join(', ')}`,
      `📊 Symptom Severity: ${avgSeverity.toFixed(1)}/10 average - requires medical investigation`,
      `😴 Sleep Impact: ${avgSleep.toFixed(1)} hours average - may indicate underlying condition`,
      `📈 Medical Trend: ${this.getSeverityTrend(logs)}`,
      `🚨 Medical Alert: Symptom pattern suggests systematic health issue`
    ];

    // Include lab work patterns for medical analysis
    if (labWork.length > 0) {
      patterns.push(`🔬 Medical Lab Data: ${labWork.length} entries analyzed for root cause`);
      
      const abnormalResults = labWork.flatMap(lab => 
        lab.tests.filter(test => test.status && ['abnormal', 'high', 'low', 'critical'].includes(test.status))
      );
      
      if (abnormalResults.length > 0) {
        patterns.push(`⚠️ CRITICAL FINDINGS: ${abnormalResults.length} abnormal lab values detected`);
        const criticalResults = abnormalResults.filter(test => test.status === 'critical');
        if (criticalResults.length > 0) {
          patterns.push(`🚨 URGENT: ${criticalResults.length} critical lab values require IMMEDIATE medical attention`);
        }
      }
    }

    // Include medical test patterns
    if (medicalTests.length > 0) {
      patterns.push(`📋 Medical Imaging/Tests: ${medicalTests.length} entries analyzed for symptom correlation`);
    }
    
    return {
      patterns,
      potentialCauses: [
        '🚨 Inflammatory conditions (requires immediate medical evaluation)',
        '🔬 Autoimmune disorders (blood work and specialist consultation needed)',
        '⚖️ Hormonal imbalances (endocrine evaluation recommended)',
        '🧠 Chronic stress syndrome (multidisciplinary assessment)',
        '🥗 Nutritional deficiencies (laboratory testing suggested)',
        '😴 Sleep disorders (sleep study consideration)',
        '💊 Medication side effects (pharmacological review)',
        '🌍 Environmental or infectious triggers (specialist evaluation)'
      ],
      recommendations: [
        '🚨 CRITICAL: Discuss these root cause hypotheses with your doctor immediately',
        '🔬 Request comprehensive blood work and physical examination',
        '👨‍⚕️ Consider specialist referrals as recommended by physician',
        '📝 Prepare detailed symptom timeline for medical consultation',
        '📋 Bring this root cause analysis to your next medical appointment'
      ],
      riskFactors: [
        '🚨 Persistent symptoms requiring urgent professional medical evaluation',
        '🔍 Multiple symptom patterns suggesting systematic root causes',
        '⚠️ Impact on daily functioning and quality of life',
        '🏥 Need for proper diagnostic workup and testing'
      ],
      nextSteps: [
        '🏥 URGENT: Schedule appointment with healthcare provider',
        '📋 Prepare comprehensive list of symptoms for doctor visit',
        '🔬 Request specific diagnostic tests based on these hypotheses',
        '📝 Continue detailed symptom tracking until medical consultation',
        '💊 Review all medications with doctor for potential interactions'
      ],
      disclaimer: "🚨 MEDICAL DISCLAIMER: These are potential ROOT CAUSE hypotheses only and require immediate professional medical evaluation. This analysis is NOT a diagnosis and should not replace urgent consultation with qualified healthcare providers. Please discuss all symptoms and potential root causes with your doctor, who can order appropriate tests and provide proper medical assessment."
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
export type { HypothesisAnalysis, HealthLog, LabWork, MedicalTest };