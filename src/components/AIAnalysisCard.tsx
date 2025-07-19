import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Search, ArrowRight, AlertTriangle } from 'lucide-react';
import { type HypothesisAnalysis } from '@/services/ai';

interface AIAnalysisCardProps {
  analysis: HypothesisAnalysis;
}

export function AIAnalysisCard({ analysis }: AIAnalysisCardProps) {
  return (
    <Card className="mb-8 shadow-insight">
      <CardHeader className="bg-gradient-accent">
        <CardTitle className="flex items-center gap-2 text-accent-foreground">
          <Brain className="h-5 w-5" />
          AI Hypothesis Analysis
        </CardTitle>
        <CardDescription className="text-accent-foreground/80">
          AI-generated insights and hypotheses from your health logs
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Patterns */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Identified Patterns
          </h4>
          <ul className="space-y-2">
            {analysis.patterns.map((pattern, index) => (
              <li key={index} className="text-foreground ml-4 flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{pattern}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Potential Causes */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Potential Causes & Triggers
          </h4>
          <ul className="space-y-2">
            {analysis.potentialCauses.map((cause, index) => (
              <li key={index} className="text-foreground ml-4 flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-foreground ml-4 flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Factors */}
        {analysis.riskFactors.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Risk Factors to Monitor
            </h4>
            <ul className="space-y-2">
              {analysis.riskFactors.map((risk, index) => (
                <li key={index} className="text-foreground ml-4 flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Recommended Next Steps
          </h4>
          <ul className="space-y-2">
            {analysis.nextSteps.map((step, index) => (
              <li key={index} className="text-foreground ml-4 flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border-l-4 border-orange-500">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {analysis.disclaimer}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 