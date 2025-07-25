import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Calendar, Clock, Heart, Pill, Search, TrendingUp, Brain } from 'lucide-react';
import type { HealthLog } from '@/types/health';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHealthData } from '@/hooks/useHealthData';
import { LogForm } from './LogForm';

interface LogDashboardProps {
  logs: HealthLog[];
  onAnalyze?: () => void;
}

export function LogDashboard({ logs, onAnalyze }: LogDashboardProps) {
  const [filteredLogs, setFilteredLogs] = useState<HealthLog[]>(logs);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [moodFilter, setMoodFilter] = useState('all');
  const { updateHealthLog } = useHealthData();
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null);

  useEffect(() => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log.medications.some(m => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      const range = severityFilter.split('-').map(Number);
      filtered = filtered.filter(log => 
        log.severity >= range[0] && log.severity <= range[1]
      );
    }

    // Mood filter
    if (moodFilter !== 'all') {
      filtered = filtered.filter(log => log.mood === moodFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, severityFilter, moodFilter]);

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600 bg-green-50';
    if (severity <= 6) return 'text-yellow-600 bg-yellow-50';
    if (severity <= 8) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'excellent': return '😊';
      case 'good': return '🙂';
      case 'neutral': return '😐';
      case 'poor': return '😔';
      case 'terrible': return '😣';
      default: return '❓';
    }
  };

  const getStats = () => {
    if (logs.length === 0) return null;
    
    const avgSeverity = logs.reduce((sum, log) => sum + log.severity, 0) / logs.length;
    const avgSleep = logs.reduce((sum, log) => sum + log.sleep, 0) / logs.length;
    const totalSymptoms = new Set(logs.flatMap(log => log.symptoms)).size;
    const totalMedications = new Set(logs.flatMap(log => log.medications)).size;

    return { avgSeverity, avgSleep, totalSymptoms, totalMedications };
  };

  const stats = getStats();

  if (logs.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle>No Health Logs Yet</CardTitle>
          <CardDescription>
            Start logging your symptoms and health data to begin tracking patterns
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Avg Severity</p>
                  <p className="text-2xl font-bold">{stats.avgSeverity.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Avg Sleep</p>
                  <p className="text-2xl font-bold">{stats.avgSleep.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Symptoms</p>
                  <p className="text-2xl font-bold">{stats.totalSymptoms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Medications</p>
                  <p className="text-2xl font-bold">{stats.totalMedications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter & Search Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search symptoms, medications, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="1-3">Mild (1-3)</SelectItem>
                <SelectItem value="4-6">Moderate (4-6)</SelectItem>
                <SelectItem value="7-8">Severe (7-8)</SelectItem>
                <SelectItem value="9-10">Extreme (9-10)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={moodFilter} onValueChange={setMoodFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                <SelectItem value="excellent">😊 Excellent</SelectItem>
                <SelectItem value="good">🙂 Good</SelectItem>
                <SelectItem value="neutral">😐 Neutral</SelectItem>
                <SelectItem value="poor">😔 Poor</SelectItem>
                <SelectItem value="terrible">😣 Terrible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">
                    {new Date(log.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getSeverityColor(log.severity)} border-0`}>
                    Severity: {log.severity}
                  </Badge>
                  {log.mood && (
                    <Badge variant="outline">
                      {getMoodEmoji(log.mood)} {log.mood}
                    </Badge>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setEditingLog(log)}>
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Symptoms */}
              {log.symptoms.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Symptoms
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {log.symptoms.map((symptom) => (
                      <Badge key={symptom} variant="outline">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {log.medications.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <Pill className="h-3 w-3" />
                    Medications
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {log.medications.map((medication) => (
                      <Badge key={medication} variant="secondary">
                        {medication}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sleep & Additional Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Sleep: {log.sleep}h
                </div>
                {log.mood && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    Mood: {log.mood}
                  </div>
                )}
              </div>

              {/* Notes */}
              {log.notes && (
                <div className="pt-2 border-t">
                  <p className="text-sm">{log.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Edit Log Modal */}
      <Dialog open={!!editingLog} onOpenChange={open => !open && setEditingLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Health Log</DialogTitle>
          </DialogHeader>
          {editingLog && (
            <LogForm
              initialLog={editingLog}
              onLogSaved={async (updatedLog) => {
                await updateHealthLog(editingLog.id, updatedLog);
                setEditingLog(null);
              }}
              editMode
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}