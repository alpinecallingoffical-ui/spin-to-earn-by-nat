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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
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
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      diamond_packages: {
        Row: {
          bonus_percentage: number | null
          coin_equivalent: number
          created_at: string
          description: string | null
          diamonds: number
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_rs: number
          updated_at: string
        }
        Insert: {
          bonus_percentage?: number | null
          coin_equivalent: number
          created_at?: string
          description?: string | null
          diamonds: number
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_rs: number
          updated_at?: string
        }
        Update: {
          bonus_percentage?: number | null
          coin_equivalent?: number
          created_at?: string
          description?: string | null
          diamonds?: number
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_rs?: number
          updated_at?: string
        }
        Relationships: []
      }
      diamond_purchases: {
        Row: {
          completed_at: string | null
          created_at: string
          diamonds_purchased: number
          esewa_payment_id: string | null
          id: string
          package_id: string | null
          payment_method: string
          payment_status: string
          price_paid_rs: number
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          diamonds_purchased: number
          esewa_payment_id?: string | null
          id?: string
          package_id?: string | null
          payment_method?: string
          payment_status?: string
          price_paid_rs: number
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          diamonds_purchased?: number
          esewa_payment_id?: string | null
          id?: string
          package_id?: string | null
          payment_method?: string
          payment_status?: string
          price_paid_rs?: number
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diamond_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "diamond_packages"
            referencedColumns: ["id"]
          },
        ]
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
      item_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      lottery_games: {
        Row: {
          created_at: string
          description: string | null
          draw_time: string
          id: string
          jackpot_amount: number | null
          max_tickets: number | null
          max_tickets_per_user: number | null
          name: string
          status: string
          ticket_price: number
          tickets_sold: number | null
          total_prize_pool: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          draw_time: string
          id?: string
          jackpot_amount?: number | null
          max_tickets?: number | null
          max_tickets_per_user?: number | null
          name: string
          status?: string
          ticket_price: number
          tickets_sold?: number | null
          total_prize_pool?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          draw_time?: string
          id?: string
          jackpot_amount?: number | null
          max_tickets?: number | null
          max_tickets_per_user?: number | null
          name?: string
          status?: string
          ticket_price?: number
          tickets_sold?: number | null
          total_prize_pool?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      lottery_prizes: {
        Row: {
          created_at: string
          id: string
          lottery_game_id: string | null
          max_winners: number | null
          prize_amount: number
          prize_name: string
          prize_percentage: number | null
          prize_tier: number
          winners_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          lottery_game_id?: string | null
          max_winners?: number | null
          prize_amount: number
          prize_name: string
          prize_percentage?: number | null
          prize_tier: number
          winners_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          lottery_game_id?: string | null
          max_winners?: number | null
          prize_amount?: number
          prize_name?: string
          prize_percentage?: number | null
          prize_tier?: number
          winners_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lottery_prizes_lottery_game_id_fkey"
            columns: ["lottery_game_id"]
            isOneToOne: false
            referencedRelation: "lottery_games"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_tickets: {
        Row: {
          id: string
          is_winner: boolean | null
          lottery_game_id: string | null
          numbers_chosen: Json | null
          prize_amount: number | null
          prize_tier: number | null
          purchased_at: string
          ticket_number: string
          user_id: string
        }
        Insert: {
          id?: string
          is_winner?: boolean | null
          lottery_game_id?: string | null
          numbers_chosen?: Json | null
          prize_amount?: number | null
          prize_tier?: number | null
          purchased_at?: string
          ticket_number: string
          user_id: string
        }
        Update: {
          id?: string
          is_winner?: boolean | null
          lottery_game_id?: string | null
          numbers_chosen?: Json | null
          prize_amount?: number | null
          prize_tier?: number | null
          purchased_at?: string
          ticket_number?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_tickets_lottery_game_id_fkey"
            columns: ["lottery_game_id"]
            isOneToOne: false
            referencedRelation: "lottery_games"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_winners: {
        Row: {
          claimed: boolean | null
          claimed_at: string | null
          created_at: string
          id: string
          lottery_game_id: string | null
          prize_amount: number
          prize_tier: number
          ticket_id: string | null
          user_id: string
        }
        Insert: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string
          id?: string
          lottery_game_id?: string | null
          prize_amount: number
          prize_tier: number
          ticket_id?: string | null
          user_id: string
        }
        Update: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string
          id?: string
          lottery_game_id?: string | null
          prize_amount?: number
          prize_tier?: number
          ticket_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_winners_lottery_game_id_fkey"
            columns: ["lottery_game_id"]
            isOneToOne: false
            referencedRelation: "lottery_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "lottery_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_daily_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          is_admin_message: boolean
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_admin_message?: boolean
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_admin_message?: boolean
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_history: {
        Row: {
          id: string
          item_id: string | null
          purchased_at: string
          quantity: number | null
          total_price: number
          user_id: string
        }
        Insert: {
          id?: string
          item_id?: string | null
          purchased_at?: string
          quantity?: number | null
          total_price: number
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string | null
          purchased_at?: string
          quantity?: number | null
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
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
      shop_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_limited: boolean | null
          item_data: Json | null
          item_type: string
          limited_quantity: number | null
          name: string
          price: number
          sold_count: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_limited?: boolean | null
          item_data?: Json | null
          item_type: string
          limited_quantity?: number | null
          name: string
          price: number
          sold_count?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_limited?: boolean | null
          item_data?: Json | null
          item_type?: string
          limited_quantity?: number | null
          name?: string
          price?: number
          sold_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "item_categories"
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
      user_inventory: {
        Row: {
          id: string
          is_equipped: boolean | null
          item_id: string | null
          purchased_at: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          id?: string
          is_equipped?: boolean | null
          item_id?: string | null
          purchased_at?: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          id?: string
          is_equipped?: boolean | null
          item_id?: string | null
          purchased_at?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          banned: boolean
          coins: number
          created_at: string
          daily_spin_limit: number | null
          diamonds: number | null
          email: string | null
          id: string
          name: string
          phone: string | null
          profile_picture_url: string | null
          referral_code: string
          referred_by: string | null
        }
        Insert: {
          banned?: boolean
          coins?: number
          created_at?: string
          daily_spin_limit?: number | null
          diamonds?: number | null
          email?: string | null
          id: string
          name: string
          phone?: string | null
          profile_picture_url?: string | null
          referral_code: string
          referred_by?: string | null
        }
        Update: {
          banned?: boolean
          coins?: number
          created_at?: string
          daily_spin_limit?: number | null
          diamonds?: number | null
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
          admin_notes: string | null
          coin_amount: number
          esewa_number: string
          id: string
          processed_at: string | null
          processing_fee: number | null
          requested_at: string
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          coin_amount: number
          esewa_number: string
          id?: string
          processed_at?: string | null
          processing_fee?: number | null
          requested_at?: string
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          coin_amount?: number
          esewa_number?: string
          id?: string
          processed_at?: string | null
          processing_fee?: number | null
          requested_at?: string
          status?: string
          transaction_id?: string | null
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
        Args: { admin_notes?: string; withdrawal_id: string }
        Returns: boolean
      }
      buy_lottery_ticket: {
        Args: { chosen_numbers?: Json; lottery_game_uuid: string }
        Returns: Json
      }
      can_spin_today: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      complete_task: {
        Args: { task_uuid: string }
        Returns: boolean
      }
      conduct_lottery_draw: {
        Args: { lottery_game_uuid: string }
        Returns: Json
      }
      convert_diamonds_to_coins: {
        Args: { diamond_amount: number }
        Returns: boolean
      }
      equip_item: {
        Args: { item_uuid: string; should_equip?: boolean }
        Returns: boolean
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_transaction_id: {
        Args: { prefix?: string }
        Returns: string
      }
      get_or_create_conversation: {
        Args: { other_user_id: string }
        Returns: string
      }
      mark_messages_read: {
        Args: { sender_id: string }
        Returns: boolean
      }
      purchase_item: {
        Args: { item_uuid: string; purchase_quantity?: number }
        Returns: boolean
      }
      record_game_score: {
        Args: {
          game_type_param: string
          reward_amount: number
          score_param: number
          user_uuid: string
        }
        Returns: boolean
      }
      record_spin: {
        Args: { reward_amount: number; user_uuid: string }
        Returns: boolean
      }
      record_video_watch: {
        Args: {
          reward_amount: number
          user_uuid: string
          video_id_param: string
          video_title_param: string
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
      send_message: {
        Args: { content: string; receiver_id: string } | { message: string }
        Returns: string
      }
      send_message_to_all_users: {
        Args: {
          message_content: string
          message_title: string
          message_type?: string
        }
        Returns: boolean
      }
      update_spin_status: {
        Args: {
          admin_notes?: string
          new_status: string
          spin_management_id: string
        }
        Returns: boolean
      }
      update_spin_time: {
        Args: { new_spin_time: string; spin_management_id: string }
        Returns: boolean
      }
      update_user_spin_limit: {
        Args: { new_limit: number; target_user_id: string }
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
