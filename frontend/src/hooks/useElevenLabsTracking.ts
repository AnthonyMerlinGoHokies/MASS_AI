
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ElevenLabsCallData {
  session_id?: string;
  call_started_at?: string;
  call_ended_at?: string;
  call_duration_seconds?: number;
  input_transcript?: string;
  output_transcript?: string;
  voice_id?: string;
  voice_name?: string;
  model_id?: string;
  voice_settings?: any;
  characters_used?: number;
  cost_per_character?: number;
  total_cost?: number;
  currency?: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  audio_duration_seconds?: number;
  audio_file_size_bytes?: number;
  audio_format?: string;
  audio_quality?: string;
  request_id?: string;
  response_latency_ms?: number;
  status?: string;
  error_message?: string;
  api_endpoint?: string;
  user_agent?: string;
  ip_address?: string;
  metadata?: any;
}

export const useElevenLabsTracking = () => {
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  const logCallInteraction = async (data: ElevenLabsCallData) => {
    setIsLogging(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('eleven_labs_call_interactions')
        .insert({
          user_id: user.user?.id,
          ...data
        });

      if (error) throw error;

      console.log('Eleven Labs call interaction logged successfully');
      return true;
    } catch (error) {
      console.error('Failed to log Eleven Labs call interaction:', error);
      toast({
        title: "Logging Error",
        description: "Failed to log call interaction",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLogging(false);
    }
  };

  const updateCallInteraction = async (id: string, data: Partial<ElevenLabsCallData>) => {
    try {
      const { error } = await supabase
        .from('eleven_labs_call_interactions')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      console.log('Eleven Labs call interaction updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update Eleven Labs call interaction:', error);
      return false;
    }
  };

  const getCallInteractions = async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('eleven_labs_call_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch call interactions:', error);
      return [];
    }
  };

  const getCostSummary = async (startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('eleven_labs_call_interactions')
        .select('total_cost, characters_used, call_duration_seconds, created_at');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const summary = data?.reduce((acc, interaction) => {
        return {
          totalCost: acc.totalCost + (interaction.total_cost || 0),
          totalCharacters: acc.totalCharacters + (interaction.characters_used || 0),
          totalDuration: acc.totalDuration + (interaction.call_duration_seconds || 0),
          totalCalls: acc.totalCalls + 1
        };
      }, {
        totalCost: 0,
        totalCharacters: 0,
        totalDuration: 0,
        totalCalls: 0
      });

      return summary;
    } catch (error) {
      console.error('Failed to get cost summary:', error);
      return null;
    }
  };

  return {
    logCallInteraction,
    updateCallInteraction,
    getCallInteractions,
    getCostSummary,
    isLogging
  };
};
