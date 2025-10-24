export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_interactions: {
        Row: {
          agent_name: string
          cost: number | null
          created_at: string
          duration_ms: number | null
          id: string
          metadata: Json | null
          prompt: string
          response: string
          session_id: string
          status: string | null
          task_description: string
          updated_at: string
        }
        Insert: {
          agent_name: string
          cost?: number | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          metadata?: Json | null
          prompt: string
          response: string
          session_id: string
          status?: string | null
          task_description: string
          updated_at?: string
        }
        Update: {
          agent_name?: string
          cost?: number | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          metadata?: Json | null
          prompt?: string
          response?: string
          session_id?: string
          status?: string | null
          task_description?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_interaction_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: number
          intent: string | null
          latency_ms: number | null
          metadata: Json | null
          model_name: string | null
          prompt: string | null
          response: string | null
          session_id: string | null
          status: string | null
          tags: string[] | null
          temperature: number | null
          timestamp: string | null
          token_input_count: number | null
          token_output_count: number | null
          tool_used: string | null
          top_p: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: number
          intent?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          model_name?: string | null
          prompt?: string | null
          response?: string | null
          session_id?: string | null
          status?: string | null
          tags?: string[] | null
          temperature?: number | null
          timestamp?: string | null
          token_input_count?: number | null
          token_output_count?: number | null
          tool_used?: string | null
          top_p?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: number
          intent?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          model_name?: string | null
          prompt?: string | null
          response?: string | null
          session_id?: string | null
          status?: string | null
          tags?: string[] | null
          temperature?: number | null
          timestamp?: string | null
          token_input_count?: number | null
          token_output_count?: number | null
          tool_used?: string | null
          top_p?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      bill_addresses: {
        Row: {
          city: string | null
          confidence: number | null
          created_at: string
          current_kwh: number | null
          extraction_method: string | null
          id: string
          normalized_address: string
          original_file_path: string
          raw_text: string
          state: string | null
          street: string | null
          updated_at: string
          user_id: string | null
          y_max: number | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          confidence?: number | null
          created_at?: string
          current_kwh?: number | null
          extraction_method?: string | null
          id?: string
          normalized_address: string
          original_file_path: string
          raw_text: string
          state?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string | null
          y_max?: number | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          confidence?: number | null
          created_at?: string
          current_kwh?: number | null
          extraction_method?: string | null
          id?: string
          normalized_address?: string
          original_file_path?: string
          raw_text?: string
          state?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string | null
          y_max?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      eleven_labs_call_interactions: {
        Row: {
          api_endpoint: string | null
          audio_duration_seconds: number | null
          audio_file_size_bytes: number | null
          audio_format: string | null
          audio_quality: string | null
          call_duration_seconds: number | null
          call_ended_at: string | null
          call_started_at: string
          characters_used: number | null
          cost_per_character: number | null
          created_at: string
          currency: string | null
          error_message: string | null
          id: string
          input_tokens: number | null
          input_transcript: string | null
          ip_address: unknown | null
          metadata: Json | null
          model_id: string | null
          output_tokens: number | null
          output_transcript: string | null
          request_id: string | null
          response_latency_ms: number | null
          session_id: string | null
          status: string | null
          total_cost: number | null
          total_tokens: number | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
          voice_id: string | null
          voice_name: string | null
          voice_settings: Json | null
        }
        Insert: {
          api_endpoint?: string | null
          audio_duration_seconds?: number | null
          audio_file_size_bytes?: number | null
          audio_format?: string | null
          audio_quality?: string | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_started_at?: string
          characters_used?: number | null
          cost_per_character?: number | null
          created_at?: string
          currency?: string | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          input_transcript?: string | null
          ip_address?: unknown | null
          metadata?: Json | null
          model_id?: string | null
          output_tokens?: number | null
          output_transcript?: string | null
          request_id?: string | null
          response_latency_ms?: number | null
          session_id?: string | null
          status?: string | null
          total_cost?: number | null
          total_tokens?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          voice_id?: string | null
          voice_name?: string | null
          voice_settings?: Json | null
        }
        Update: {
          api_endpoint?: string | null
          audio_duration_seconds?: number | null
          audio_file_size_bytes?: number | null
          audio_format?: string | null
          audio_quality?: string | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_started_at?: string
          characters_used?: number | null
          cost_per_character?: number | null
          created_at?: string
          currency?: string | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          input_transcript?: string | null
          ip_address?: unknown | null
          metadata?: Json | null
          model_id?: string | null
          output_tokens?: number | null
          output_transcript?: string | null
          request_id?: string | null
          response_latency_ms?: number | null
          session_id?: string | null
          status?: string | null
          total_cost?: number | null
          total_tokens?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          voice_id?: string | null
          voice_name?: string | null
          voice_settings?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      waitlist_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source_page: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source_page?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source_page?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
