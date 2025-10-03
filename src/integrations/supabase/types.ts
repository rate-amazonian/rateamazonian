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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      boss_photos: {
        Row: {
          boss_id: string
          created_at: string | null
          id: string
          photo_url: string
          uploaded_by_nickname: string | null
        }
        Insert: {
          boss_id: string
          created_at?: string | null
          id?: string
          photo_url: string
          uploaded_by_nickname?: string | null
        }
        Update: {
          boss_id?: string
          created_at?: string | null
          id?: string
          photo_url?: string
          uploaded_by_nickname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boss_photos_boss_id_fkey"
            columns: ["boss_id"]
            isOneToOne: false
            referencedRelation: "bosses"
            referencedColumns: ["id"]
          },
        ]
      }
      boss_reactions: {
        Row: {
          boss_id: string
          created_at: string | null
          id: string
          reaction_type: string
          session_id: string
        }
        Insert: {
          boss_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          session_id: string
        }
        Update: {
          boss_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boss_reactions_boss_id_fkey"
            columns: ["boss_id"]
            isOneToOne: false
            referencedRelation: "bosses"
            referencedColumns: ["id"]
          },
        ]
      }
      bosses: {
        Row: {
          average_rating: number | null
          bio: string | null
          company: string | null
          created_at: string | null
          id: string
          name: string
          photo_url: string | null
          position: string
          total_dislikes: number | null
          total_likes: number | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          id?: string
          name: string
          photo_url?: string | null
          position: string
          total_dislikes?: number | null
          total_likes?: number | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          position?: string
          total_dislikes?: number | null
          total_likes?: number | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          boss_id: string
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          upvotes: number | null
          user_nickname: string | null
        }
        Insert: {
          boss_id: string
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          upvotes?: number | null
          user_nickname?: string | null
        }
        Update: {
          boss_id?: string
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          upvotes?: number | null
          user_nickname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_boss_id_fkey"
            columns: ["boss_id"]
            isOneToOne: false
            referencedRelation: "bosses"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          boss_id: string
          created_at: string | null
          id: string
          rating: number
          user_nickname: string | null
        }
        Insert: {
          boss_id: string
          created_at?: string | null
          id?: string
          rating: number
          user_nickname?: string | null
        }
        Update: {
          boss_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          user_nickname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_boss_id_fkey"
            columns: ["boss_id"]
            isOneToOne: false
            referencedRelation: "bosses"
            referencedColumns: ["id"]
          },
        ]
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
