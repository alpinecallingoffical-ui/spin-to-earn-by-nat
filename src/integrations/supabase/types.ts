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
      admin_messages: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          message: string
          message_type: string
          read: boolean
          sent_at: string | null
          title: string
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          message: string
          message_type?: string
          read?: boolean
          sent_at?: string | null
          title: string
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          message?: string
          message_type?: string
          read?: boolean
          sent_at?: string | null
          title?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      daily_leaderboard: {
        Row: {
          coins: number
          created_at: string
          id: string
          leaderboard_date: string
          name: string
          profile_picture_url: string | null
          rank: number
          user_id: string
        }
        Insert: {
          coins: number
          created_at?: string
          id?: string
          leaderboard_date: string
          name: string
          profile_picture_url?: string | null
          rank: number
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          id?: string
          leaderboard_date?: string
          name?: string
          profile_picture_url?: string | null
          rank?: number
          user_id?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          requested_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          requested_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          requested_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          achieved_at: string
          game_type: string
          id: string
          reward_coins: number
          score: number
          user_id: string
        }
        Insert: {
          achieved_at?: string
          game_type: string
          id?: string
          reward_coins?: number
          score?: number
          user_id: string
        }
        Update: {
          achieved_at?: string
          game_type?: string
          id?: string
          reward_coins?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_given: number
          created_at: string
          id: string
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          bonus_given?: number
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          bonus_given?: number
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_management: {
        Row: {
          admin_notes: string | null
          id: string
          original_spin_id: string | null
          processed_at: string | null
          processed_by: string | null
          spin_time: string
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          id?: string
          original_spin_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          spin_time?: string
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          id?: string
          original_spin_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          spin_time?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spin_management_original_spin_id_fkey"
            columns: ["original_spin_id"]
            isOneToOne: false
            referencedRelation: "spins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spin_management_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spin_management_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spin_management_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spin_management_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spins: {
        Row: {
          id: string
          reward: number
          spun_at: string
          user_id: string
        }
        Insert: {
          id?: string
          reward: number
          spun_at?: string
          user_id: string
        }
        Update: {
          id?: string
          reward?: number
          spun_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          reward_coins: number
          status: string
          task_description: string | null
          task_title: string
          task_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          reward_coins?: number
          status?: string
          task_description?: string | null
          task_title: string
          task_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          reward_coins?: number
          status?: string
          task_description?: string | null
          task_title?: string
          task_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_benefits: {
        Row: {
          benefit_data: Json | null
          benefit_type: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          benefit_data?: Json | null
          benefit_type: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          benefit_data?: Json | null
          benefit_type?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          coins: number
          created_at: string
          daily_spin_limit: number | null
          email: string | null
          id: string
          name: string
          phone: string | null
          profile_picture_url: string | null
          referral_code: string
          referred_by: string | null
        }
        Insert: {
          coins?: number
          created_at?: string
          daily_spin_limit?: number | null
          email?: string | null
          id: string
          name: string
          phone?: string | null
          profile_picture_url?: string | null
          referral_code: string
          referred_by?: string | null
        }
        Update: {
          coins?: number
          created_at?: string
          daily_spin_limit?: number | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          profile_picture_url?: string | null
          referral_code?: string
          referred_by?: string | null
        }
        Relationships: []
      }
      video_watches: {
        Row: {
          id: string
          reward_coins: number
          user_id: string
          video_id: string
          video_title: string
          watched_at: string
        }
        Insert: {
          id?: string
          reward_coins?: number
          user_id: string
          video_id: string
          video_title: string
          watched_at?: string
        }
        Update: {
          id?: string
          reward_coins?: number
          user_id?: string
          video_id?: string
          video_title?: string
          watched_at?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          coin_amount: number
          esewa_number: string
          id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          coin_amount: number
          esewa_number: string
          id?: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          coin_amount?: number
          esewa_number?: string
          id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_daily_stats: {
        Row: {
          daily_spin_limit: number | null
          email: string | null
          id: string | null
          name: string | null
          pending_requests: number | null
          today_coins: number | null
          today_spins: number | null
          total_coins: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_friend_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      approve_withdrawal_with_notification: {
        Args: { withdrawal_id: string; admin_notes?: string }
        Returns: boolean
      }
      can_spin_today: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      complete_task: {
        Args: { task_uuid: string }
        Returns: boolean
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      record_game_score: {
        Args: {
          user_uuid: string
          game_type_param: string
          score_param: number
          reward_amount: number
        }
        Returns: boolean
      }
      record_spin: {
        Args: { user_uuid: string; reward_amount: number }
        Returns: boolean
      }
      record_video_watch: {
        Args: {
          user_uuid: string
          video_id_param: string
          video_title_param: string
          reward_amount: number
        }
        Returns: boolean
      }
      reject_friend_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      remove_friend: {
        Args: { friend_user_id: string }
        Returns: boolean
      }
      send_friend_request: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      send_message_to_all_users: {
        Args: {
          message_title: string
          message_content: string
          message_type?: string
        }
        Returns: boolean
      }
      update_spin_status: {
        Args: {
          spin_management_id: string
          new_status: string
          admin_notes?: string
        }
        Returns: boolean
      }
      update_spin_time: {
        Args: { spin_management_id: string; new_spin_time: string }
        Returns: boolean
      }
      update_user_spin_limit: {
        Args: { target_user_id: string; new_limit: number }
        Returns: boolean
      }
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
