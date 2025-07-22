# AI Hypothesis Generation Features

## Overview
The Health Detective AI app now includes real AI-powered hypothesis generation using OpenAI's GPT-4o-mini model. This feature analyzes your health logs to identify patterns, potential causes, and generate actionable insights.

## Features

### 🤖 AI-Powered Analysis
- **Quick Analysis**: Get immediate insights from just one health log entry
- **Pattern Recognition**: Identifies temporal patterns, symptom correlations, and lifestyle factors
- **Hypothesis Generation**: Suggests potential causes and triggers for your symptoms
- **Risk Assessment**: Highlights factors that may require medical attention
- **Personalized Recommendations**: Provides actionable steps based on your data
- **Data Quality Warnings**: Alerts users when analysis is based on limited data

### 📊 Analysis Categories

#### 1. Identified Patterns
- Temporal patterns (time of day, day of week, seasonal trends)
- Symptom correlations with sleep, mood, and medications
- Frequency and severity patterns
- Lifestyle factor correlations

#### 2. Potential Causes & Triggers
- Environmental factors
- Dietary triggers
- Stress-related patterns
- Medication interactions
- Sleep quality impacts

#### 3. Recommendations
- Lifestyle modifications
- Tracking suggestions
- When to seek medical attention
- Preventive measures

#### 4. Risk Factors
- Concerning patterns that warrant medical evaluation
- Red flags to monitor
- Emergency warning signs

#### 5. Next Steps
- Immediate actions to take
- Long-term monitoring strategies
- Healthcare provider consultation guidance

## How to Use

### Quick Analysis (Single Log)
1. **Log Your Health Data**: Enter at least 1 health log with symptoms, medications, severity, mood, and sleep data
2. **Navigate to Dashboard**: Go to the Dashboard page to view your logs
3. **Generate Quick Analysis**: Click "Quick Analysis (1 log)" to get immediate insights
4. **Review Results**: Examine the AI-generated preliminary insights and recommendations
5. **Continue Logging**: Add more logs over time for more accurate analysis

### Comprehensive Analysis (Recommended)
1. **Log Your Health Data**: Enter at least 7 health logs with symptoms, medications, severity, mood, and sleep data
2. **Navigate to Dashboard**: Go to the Dashboard page to view your logs
3. **Generate Hypotheses**: Click "Generate AI Analysis" or "Generate Medical Hypotheses" to start comprehensive AI analysis
4. **Review Results**: Examine the AI-generated insights and recommendations
5. **Take Action**: Follow the recommended next steps and consult healthcare providers as needed

### Data Quality Recommendations
- **Single Log**: Provides immediate preliminary insights but limited accuracy
- **3-6 Logs**: Better pattern recognition and more reliable insights
- **7+ Logs**: Optimal for comprehensive analysis and accurate pattern identification
- **Lab Work & Tests**: Adding lab results and medical tests significantly improves analysis quality

## Privacy & Security

- **Local Processing**: Health data is processed locally before being sent to OpenAI
- **No Data Storage**: OpenAI does not store your health data for training purposes
- **Secure API**: All communications with OpenAI are encrypted
- **Medical Disclaimer**: AI analysis is for informational purposes only and should not replace professional medical advice

## Technical Implementation

### AI Service (`src/services/ai.ts`)
- Uses OpenAI GPT-4o-mini model
- Structured JSON response parsing
- Fallback text parsing for robustness
- Comprehensive error handling

### Components
- `AIAnalysisCard`: Displays AI analysis results
- `Dashboard`: Integrates AI analysis with existing functionality
- `LogDashboard`: Updated to show AI hypothesis generation

### Environment Variables
```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Safety & Medical Disclaimer

⚠️ **Important**: This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers about any health concerns.

The AI system:
- Does not provide medical diagnosis
- Does not recommend specific treatments
- Emphasizes the need for professional medical evaluation
- Includes appropriate disclaimers and warnings

## Future Enhancements

- Integration with Reddit case search for similar experiences
- Visual charts and trend analysis
- Medication interaction checking
- Symptom severity prediction
- Personalized health recommendations based on medical literature 