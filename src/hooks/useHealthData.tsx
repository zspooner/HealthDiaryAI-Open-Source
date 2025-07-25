import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface HealthLog {
  id: string;
  date: string;
  symptoms: string[];
  medications: string[];
  severity: number;
  mood: string;
  sleep: number;
  notes: string;
}

export interface Hypothesis {
  id: string;
  hypothesis: string;
  confidence: number;
  data_points_count: number;
  created_at: string;
  type: string;
  evidence: string;
}

export const useHealthData = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);

  // Migrate localStorage data to Supabase when user first logs in
  const migrateLocalStorageData = async () => {
    if (!user || !session) return;

    try {
      // Check if user already has data in Supabase to avoid duplicate migration
      const { data: existingLogs } = await supabase
        .from('health_logs')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingLogs && existingLogs.length > 0) {
        // User already has data in Supabase, skip migration
        return;
      }

      // Get localStorage data
      const localHealthLogs = localStorage.getItem('healthLogs');
      const localHypotheses = localStorage.getItem('hypotheses');

      let dataMigrated = false;

      if (localHealthLogs) {
        const logs: HealthLog[] = JSON.parse(localHealthLogs);
        
        // Convert localStorage format to Supabase format
        const supabaseLogs = logs.map(log => ({
          id: log.id,
          user_id: user.id,
          notes: log.notes,
          symptoms: log.symptoms?.join(', ') || '',
          meds: log.medications?.join(', ') || '',
          habits: `Severity: ${log.severity}, Mood: ${log.mood}, Sleep: ${log.sleep}h`,
          created_at: log.date,
          updated_at: log.date
        }));

        // Insert logs into Supabase
        const { error: logsError } = await supabase
          .from('health_logs')
          .insert(supabaseLogs);

        if (logsError) {
          console.error('Error migrating health logs:', logsError);
        } else {
          console.log('Successfully migrated health logs to Supabase');
          dataMigrated = true;
        }
      }

      if (localHypotheses) {
        const hyps: Hypothesis[] = JSON.parse(localHypotheses);
        
        // Convert localStorage format to Supabase format
        const supabaseHypotheses = hyps.map(hyp => ({
          id: hyp.id,
          user_id: user.id,
          hypothesis: hyp.hypothesis,
          confidence: hyp.confidence,
          data_points_count: hyp.data_points_count,
          type: hyp.type,
          evidence: hyp.evidence,
          created_at: hyp.created_at
        }));

        // Insert hypotheses into Supabase
        const { error: hypsError } = await supabase
          .from('hypotheses')
          .insert(supabaseHypotheses);

        if (hypsError) {
          console.error('Error migrating hypotheses:', hypsError);
        } else {
          console.log('Successfully migrated hypotheses to Supabase');
          dataMigrated = true;
        }
      }

      // Only show toast if data was actually migrated
      if (dataMigrated) {
        // Clear localStorage after successful migration
        localStorage.removeItem('healthLogs');
        localStorage.removeItem('hypotheses');
        
        toast({
          title: "Data Migrated",
          description: "Your local data has been successfully migrated to your secure account.",
        });
      }

    } catch (error) {
      console.error('Error during data migration:', error);
      toast({
        title: "Migration Warning",
        description: "There was an issue migrating your local data. Your data is still safe locally.",
        variant: "destructive",
      });
    }
  };

  // Load health data from Supabase for authenticated users only
  const loadHealthData = async () => {
    setLoading(true);
    
    try {
      // Only load data for authenticated users
      if (!user?.id) {
        setHealthLogs([]);
        setHypotheses([]);
        setLoading(false);
        return;
      }

      // Load health logs for authenticated users
      const { data: logsData, error: logsError } = await supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Convert Supabase format back to frontend format
      const formattedLogs: HealthLog[] = (logsData || []).map(log => {
        // Parse habits field to extract severity, mood, sleep
        const habitsMatch = log.habits?.match(/Severity: (\d{1,2}), Mood: ([^,]*), Sleep: ([\d.]+)h/);
        
        return {
          id: log.id,
          date: log.created_at,
          symptoms: log.symptoms ? log.symptoms.split(', ').filter(s => s.trim()) : [],
          medications: log.meds ? log.meds.split(', ').filter(m => m.trim()) : [],
          severity: habitsMatch ? parseInt(habitsMatch[1]) : 0,
          mood: habitsMatch ? habitsMatch[2] : '',
          sleep: habitsMatch ? parseFloat(habitsMatch[3]) : 0,
          notes: log.notes || ''
        };
      });

      setHealthLogs(formattedLogs);

      // Load hypotheses for authenticated users
      const { data: hypsData, error: hypsError } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (hypsError) throw hypsError;

      setHypotheses(hypsData || []);

    } catch (error) {
      console.error('Error loading health data:', error);
      toast({
        title: "Error Loading Data",
        description: "There was an issue loading your health data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save health log to database for authenticated users only
  const saveHealthLog = async (log: Omit<HealthLog, 'id'>) => {
    try {
      // Only authenticated users can save data
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your health data.",
          variant: "destructive",
        });
        return null;
      }

      const supabaseLog = {
        user_id: user.id,
        notes: log.notes,
        symptoms: log.symptoms.join(', '),
        meds: log.medications.join(', '),
        habits: `Severity: ${Number.isFinite(log.severity) ? log.severity : 0}, Mood: ${log.mood}, Sleep: ${log.sleep}h`,
        created_at: log.date,
        updated_at: new Date().toISOString()
      };
      console.log('Saving health log with habits:', supabaseLog.habits);

      const { data, error } = await supabase
        .from('health_logs')
        .insert([supabaseLog])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newLog: HealthLog = {
        id: data.id,
        ...log
      };

      setHealthLogs(prev => [newLog, ...prev]);

      toast({
        title: "Health Log Saved",
        description: "Your health log has been saved successfully.",
      });

      return newLog;
    } catch (error) {
      console.error('Error saving health log:', error);
      toast({
        title: "Error Saving Log",
        description: "There was an issue saving your health log.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update health log for authenticated users only
  const updateHealthLog = async (id: string, log: Omit<HealthLog, 'id'>) => {
    try {
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to update your health data.",
          variant: "destructive",
        });
        return null;
      }
      const supabaseLog = {
        notes: log.notes,
        symptoms: log.symptoms.join(', '),
        meds: log.medications.join(', '),
        habits: `Severity: ${Number.isFinite(log.severity) ? log.severity : 0}, Mood: ${log.mood}, Sleep: ${log.sleep}h`,
        updated_at: new Date().toISOString(),
        user_id: user.id,
      };
      const { data, error } = await supabase
        .from('health_logs')
        .update(supabaseLog)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      // Update local state
      setHealthLogs(prev => prev.map(l => l.id === id ? { id, ...log } : l));
      toast({
        title: "Health Log Updated",
        description: "Your health log has been updated successfully.",
      });
      return { id, ...log };
    } catch (error) {
      console.error('Error updating health log:', error);
      toast({
        title: "Error Updating Log",
        description: "There was an issue updating your health log.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Save hypothesis to database for authenticated users only
  const saveHypothesis = async (hypothesis: Omit<Hypothesis, 'id' | 'created_at'>) => {
    try {
      // Only authenticated users can save data
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your health data.",
          variant: "destructive",
        });
        return null;
      }

      const supabaseHypothesis = {
        user_id: user.id,
        ...hypothesis
      };

      const { data, error } = await supabase
        .from('hypotheses')
        .insert([supabaseHypothesis])
        .select()
        .single();

      if (error) throw error;

      setHypotheses(prev => [data, ...prev]);

      toast({
        title: "Hypothesis Saved",
        description: "Your hypothesis has been saved successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error saving hypothesis:', error);
      toast({
        title: "Error Saving Hypothesis",
        description: "There was an issue saving your hypothesis.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete health log for authenticated users only
  const deleteHealthLog = async (id: string) => {
    try {
      // Only authenticated users can delete data
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage your health data.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('health_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHealthLogs(prev => prev.filter(log => log.id !== id));

      toast({
        title: "Log Deleted",
        description: "Health log has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting health log:', error);
      toast({
        title: "Error Deleting Log",
        description: "There was an issue deleting your health log.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user && session) {
      // First migrate any existing localStorage data, then load from database
      migrateLocalStorageData().then(() => {
        loadHealthData();
      });
    } else {
      // Not authenticated - clear data
      setHealthLogs([]);
      setHypotheses([]);
      setLoading(false);
    }
  }, [user, session]);

  return {
    healthLogs,
    hypotheses,
    loading,
    migrateLocalStorageData,
    loadHealthData,
    saveHealthLog,
    updateHealthLog,
    saveHypothesis,
    deleteHealthLog,
  };
};