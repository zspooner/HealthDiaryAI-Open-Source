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

  // Load health data from Supabase
  const loadHealthData = async () => {
    // Allow guest users to load data (no user check)

    setLoading(true);
    
    try {
      // Load health logs
      let query = supabase
        .from('health_logs')
        .select('*');
      
      if (user?.id) {
        // User is logged in - get their data and guest data
        query = query.or(`user_id.eq.${user.id},user_id.is.null`);
      } else {
        // Guest mode - only get guest data (null user_id)
        query = query.is('user_id', null);
      }
      
      const { data: logsData, error: logsError } = await query.order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Convert Supabase format back to frontend format
      const formattedLogs: HealthLog[] = (logsData || []).map(log => {
        // Parse habits field to extract severity, mood, sleep
        const habitsMatch = log.habits?.match(/Severity: (\d+), Mood: ([^,]+), Sleep: ([\d.]+)h/);
        
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

      // Load hypotheses
      let hypsQuery = supabase
        .from('hypotheses')
        .select('*');
      
      if (user?.id) {
        // User is logged in - get their data and guest data
        hypsQuery = hypsQuery.or(`user_id.eq.${user.id},user_id.is.null`);
      } else {
        // Guest mode - only get guest data (null user_id)
        hypsQuery = hypsQuery.is('user_id', null);
      }
      
      const { data: hypsData, error: hypsError } = await hypsQuery.order('created_at', { ascending: false });

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

  // Save health log to Supabase
  const saveHealthLog = async (log: Omit<HealthLog, 'id'>) => {
    // Allow guest users (no user check)

    try {
      const supabaseLog = {
        user_id: user?.id || null, // Allow null for guest users
        notes: log.notes,
        symptoms: log.symptoms.join(', '),
        meds: log.medications.join(', '),
        habits: `Severity: ${log.severity}, Mood: ${log.mood}, Sleep: ${log.sleep}h`,
        created_at: log.date,
        updated_at: new Date().toISOString()
      };

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

  // Save hypothesis to Supabase
  const saveHypothesis = async (hypothesis: Omit<Hypothesis, 'id' | 'created_at'>) => {
    // Allow guest users (no user check)

    try {
      const supabaseHypothesis = {
        user_id: user?.id || null, // Allow null for guest users
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

  // Delete health log
  const deleteHealthLog = async (id: string) => {
    // Allow guest users to delete their logs

    try {
      let query = supabase
        .from('health_logs')
        .delete()
        .eq('id', id);
      
      if (user?.id) {
        // User is logged in - ensure they can only delete their own logs
        query = query.eq('user_id', user.id);
      } else {
        // Guest mode - can only delete guest logs (null user_id)
        query = query.is('user_id', null);
      }
      
      const { error } = await query;

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
      // First migrate any existing localStorage data
      migrateLocalStorageData().then(() => {
        // Then load data from Supabase
        loadHealthData();
      });
    } else {
      // Guest mode or not logged in - load guest data
      loadHealthData();
    }
  }, [user, session]);

  return {
    healthLogs,
    hypotheses,
    loading,
    saveHealthLog,
    saveHypothesis,
    deleteHealthLog,
    refreshData: loadHealthData
  };
};