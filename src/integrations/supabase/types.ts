export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crises: {
        Row: {
          created_at: string
          created_by: string | null
          default_monitoring_window: Database["public"]["Enums"]["monitoring_window"]
          description: string
          detected_at: string
          id: string
          resolved_at: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          sentiment_score: number | null
          signal_count: number | null
          status: Database["public"]["Enums"]["crisis_status"]
          title: string
          type: Database["public"]["Enums"]["crisis_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_monitoring_window?: Database["public"]["Enums"]["monitoring_window"]
          description?: string
          detected_at?: string
          id?: string
          resolved_at?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          sentiment_score?: number | null
          signal_count?: number | null
          status?: Database["public"]["Enums"]["crisis_status"]
          title: string
          type?: Database["public"]["Enums"]["crisis_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_monitoring_window?: Database["public"]["Enums"]["monitoring_window"]
          description?: string
          detected_at?: string
          id?: string
          resolved_at?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          sentiment_score?: number | null
          signal_count?: number | null
          status?: Database["public"]["Enums"]["crisis_status"]
          title?: string
          type?: Database["public"]["Enums"]["crisis_type"]
          updated_at?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
        }
        Relationships: []
      }
      narratives: {
        Row: {
          ai_generated: boolean | null
          created_at: string
          crisis_id: string | null
          id: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          sentiment: Database["public"]["Enums"]["sentiment_type"]
          signal_count: number | null
          summary: string
          title: string
          top_keywords: string[] | null
          trending: boolean | null
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string
          crisis_id?: string | null
          id?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          sentiment?: Database["public"]["Enums"]["sentiment_type"]
          signal_count?: number | null
          summary?: string
          title: string
          top_keywords?: string[] | null
          trending?: boolean | null
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string
          crisis_id?: string | null
          id?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          sentiment?: Database["public"]["Enums"]["sentiment_type"]
          signal_count?: number | null
          summary?: string
          title?: string
          top_keywords?: string[] | null
          trending?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "narratives_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
        ]
      }
      naya_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          id: string
          read: boolean
          severity: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          read?: boolean
          severity?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          read?: boolean
          severity?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reputation_snapshots: {
        Row: {
          created_at: string
          crisis_id: string | null
          id: string
          media_reach: number | null
          negative_pct: number | null
          neutral_pct: number | null
          positive_pct: number | null
          reputation_score: number | null
          sentiment_score: number
          share_of_voice: number | null
          signal_volume: number | null
          snapshot_at: string
        }
        Insert: {
          created_at?: string
          crisis_id?: string | null
          id?: string
          media_reach?: number | null
          negative_pct?: number | null
          neutral_pct?: number | null
          positive_pct?: number | null
          reputation_score?: number | null
          sentiment_score?: number
          share_of_voice?: number | null
          signal_volume?: number | null
          snapshot_at?: string
        }
        Update: {
          created_at?: string
          crisis_id?: string | null
          id?: string
          media_reach?: number | null
          negative_pct?: number | null
          neutral_pct?: number | null
          positive_pct?: number | null
          reputation_score?: number | null
          sentiment_score?: number
          share_of_voice?: number | null
          signal_volume?: number | null
          snapshot_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reputation_snapshots_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
        ]
      }
      response_log: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          channel: string
          content: string
          created_at: string
          crisis_id: string | null
          id: string
          published_at: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          channel?: string
          content: string
          created_at?: string
          crisis_id?: string | null
          id?: string
          published_at?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          channel?: string
          content?: string
          created_at?: string
          crisis_id?: string | null
          id?: string
          published_at?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_log_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "response_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      response_templates: {
        Row: {
          channel: string
          content: string
          created_at: string
          created_by: string | null
          crisis_type: Database["public"]["Enums"]["crisis_type"] | null
          id: string
          title: string
          type: Database["public"]["Enums"]["response_template_type"]
          updated_at: string
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string
          created_by?: string | null
          crisis_type?: Database["public"]["Enums"]["crisis_type"] | null
          id?: string
          title: string
          type: Database["public"]["Enums"]["response_template_type"]
          updated_at?: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          created_by?: string | null
          crisis_type?: Database["public"]["Enums"]["crisis_type"] | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["response_template_type"]
          updated_at?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          author: string
          author_followers: number | null
          content: string
          created_at: string
          crisis_id: string | null
          detected_at: string
          id: string
          ingested_at: string
          is_influencer: boolean | null
          keywords: string[] | null
          matched_keyword: string | null
          reach: number | null
          sentiment: Database["public"]["Enums"]["sentiment_type"]
          source: Database["public"]["Enums"]["signal_source"]
          source_url: string | null
          tracking_rule_id: string | null
        }
        Insert: {
          author: string
          author_followers?: number | null
          content: string
          created_at?: string
          crisis_id?: string | null
          detected_at?: string
          id?: string
          ingested_at?: string
          is_influencer?: boolean | null
          keywords?: string[] | null
          matched_keyword?: string | null
          reach?: number | null
          sentiment?: Database["public"]["Enums"]["sentiment_type"]
          source: Database["public"]["Enums"]["signal_source"]
          source_url?: string | null
          tracking_rule_id?: string | null
        }
        Update: {
          author?: string
          author_followers?: number | null
          content?: string
          created_at?: string
          crisis_id?: string | null
          detected_at?: string
          id?: string
          ingested_at?: string
          is_influencer?: boolean | null
          keywords?: string[] | null
          matched_keyword?: string | null
          reach?: number | null
          sentiment?: Database["public"]["Enums"]["sentiment_type"]
          source?: Database["public"]["Enums"]["signal_source"]
          source_url?: string | null
          tracking_rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signals_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signals_tracking_rule_id_fkey"
            columns: ["tracking_rule_id"]
            isOneToOne: false
            referencedRelation: "tracking_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_rules: {
        Row: {
          created_at: string
          created_by: string | null
          crisis_id: string
          id: string
          is_active: boolean
          label: string | null
          monitoring_window:
            | Database["public"]["Enums"]["monitoring_window"]
            | null
          notes: string | null
          platform: string
          priority: number
          rule_text: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          crisis_id: string
          id?: string
          is_active?: boolean
          label?: string | null
          monitoring_window?:
            | Database["public"]["Enums"]["monitoring_window"]
            | null
          notes?: string | null
          platform?: string
          priority?: number
          rule_text: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          crisis_id?: string
          id?: string
          is_active?: boolean
          label?: string | null
          monitoring_window?:
            | Database["public"]["Enums"]["monitoring_window"]
            | null
          notes?: string | null
          platform?: string
          priority?: number
          rule_text?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_rules_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verified_communications: {
        Row: {
          authorizing_executive: string
          chain_tx_hash: string | null
          content_hash: string
          document_title: string
          file_name: string
          file_size: number
          id: string
          metadata: Json | null
          mime_type: string
          minted_at: string
          minted_by: string
          signature: string
          status: string
          verification_url: string | null
        }
        Insert: {
          authorizing_executive: string
          chain_tx_hash?: string | null
          content_hash: string
          document_title: string
          file_name: string
          file_size?: number
          id?: string
          metadata?: Json | null
          mime_type?: string
          minted_at?: string
          minted_by: string
          signature: string
          status?: string
          verification_url?: string | null
        }
        Update: {
          authorizing_executive?: string
          chain_tx_hash?: string | null
          content_hash?: string
          document_title?: string
          file_name?: string
          file_size?: number
          id?: string
          metadata?: Json | null
          mime_type?: string
          minted_at?: string
          minted_by?: string
          signature?: string
          status?: string
          verification_url?: string | null
        }
        Relationships: []
      }
      war_room_messages: {
        Row: {
          created_at: string
          crisis_id: string | null
          id: string
          message: string
          message_type: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crisis_id?: string | null
          id?: string
          message: string
          message_type?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crisis_id?: string | null
          id?: string
          message?: string
          message_type?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "war_room_messages_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_cron_jobs_status: {
        Args: never
        Returns: {
          active: boolean
          avg_duration_ms_7d: number
          command: string
          history_7d: Json
          jobid: number
          jobname: string
          last_duration_ms: number
          last_end: string
          last_return_message: string
          last_start: string
          last_status: string
          schedule: string
        }[]
      }
      get_effective_monitoring_window: {
        Args: { _crisis_id: string; _rule_id?: string }
        Returns: Database["public"]["Enums"]["monitoring_window"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      transition_approval_status: {
        Args: {
          _new_status: Database["public"]["Enums"]["approval_status"]
          _response_id: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "pr_manager" | "legal_reviewer" | "social_manager"
      approval_status:
        | "draft"
        | "pending_legal"
        | "pending_exec"
        | "approved"
        | "rejected"
        | "published"
      crisis_status:
        | "detected"
        | "active"
        | "responding"
        | "recovering"
        | "resolved"
      crisis_type: "pr" | "regulatory" | "operational"
      monitoring_window: "24h" | "7d" | "30d" | "90d"
      response_template_type: "holding" | "apology" | "clarification"
      risk_level: "low" | "medium" | "high" | "critical"
      sentiment_type: "positive" | "neutral" | "negative"
      signal_source: "twitter" | "news" | "blog" | "linkedin"
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
    Enums: {
      app_role: ["admin", "pr_manager", "legal_reviewer", "social_manager"],
      approval_status: [
        "draft",
        "pending_legal",
        "pending_exec",
        "approved",
        "rejected",
        "published",
      ],
      crisis_status: [
        "detected",
        "active",
        "responding",
        "recovering",
        "resolved",
      ],
      crisis_type: ["pr", "regulatory", "operational"],
      monitoring_window: ["24h", "7d", "30d", "90d"],
      response_template_type: ["holding", "apology", "clarification"],
      risk_level: ["low", "medium", "high", "critical"],
      sentiment_type: ["positive", "neutral", "negative"],
      signal_source: ["twitter", "news", "blog", "linkedin"],
    },
  },
} as const
