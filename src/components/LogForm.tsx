import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, X, Activity, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHealthData } from '@/hooks/useHealthData';
import { useAuth } from '@/contexts/AuthContext';

interface LogFormProps {
  onLogAdded?: () => void;
}

export function LogForm({ onLogAdded }: LogFormProps) {
  const { toast } = useToast();
  const { saveHealthLog } = useHealthData();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [severity, setSeverity] = useState('3');
  const [mood, setMood] = useState('');
  const [sleep, setSleep] = useState('7');
  const [notes, setNotes] = useState('');
  


  const addSymptom = () => {
    if (newSymptom.trim() && !symptoms.includes(newSymptom.trim())) {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const addMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    setMedications(medications.filter(m => m !== medication));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (symptoms.length === 0) {
      toast({
        title: "Symptoms Required",
        description: "Please add at least one symptom before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const logData = {
      date: new Date().toISOString(),
      symptoms,
      medications,
      severity: parseInt(severity),
      mood,
      sleep: parseFloat(sleep),
      notes
    };

    try {
      const savedLog = await saveHealthLog(logData);
      
      if (savedLog) {
        // Reset form
        setSymptoms([]);
        setMedications([]);
        setNewSymptom('');
        setNewMedication('');
        setSeverity('3');
        setMood('');
        setSleep('7');
        setNotes('');

        if (onLogAdded) {
          onLogAdded();
        }

        toast({
          title: "Health log recorded",
          description: "Your daily health data has been saved successfully. (you may need to refresh to see it)",
        });
      }
    } catch (error) {
      console.error('Error saving health log:', error);
      toast({
        title: "Error saving log",
        description: "There was an issue saving your health log. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-medical">

      <CardHeader className="bg-gradient-subtle">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Daily Health Log</CardTitle>
        </div>
        <CardDescription>
          Record your symptoms, medications, and overall wellness data
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">

        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Display */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Symptoms</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a symptom (e.g., headache, fatigue)"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
              />
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={addSymptom}
                disabled={!newSymptom.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <Badge key={symptom} variant="outline" className="gap-1">
                    {symptom}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeSymptom(symptom)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Overall Severity (1-10)</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} - {num <= 3 ? 'Mild' : num <= 6 ? 'Moderate' : num <= 8 ? 'Severe' : 'Extreme'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Medications */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Medications & Supplements</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add medication or supplement"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
              />
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={addMedication}
                disabled={!newMedication.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {medications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {medications.map((medication) => (
                  <Badge key={medication} variant="secondary" className="gap-1">
                    {medication}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeMedication(medication)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mood */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">😊 Excellent</SelectItem>
                  <SelectItem value="good">🙂 Good</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="poor">😔 Poor</SelectItem>
                  <SelectItem value="terrible">😣 Terrible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sleep */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Sleep Hours</Label>
              <Input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Additional Notes</Label>
            <Textarea
              placeholder="Any additional observations, triggers, or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>


          <Button 
            type="submit" 
            className="w-full bg-gradient-primary shadow-medical"
            disabled={symptoms.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Health Log'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}