export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      player_total_shushers: {
        Row: {
          created_at: string
          id: string
          mancala: number | null
          pai_gow: number | null
          scrabble: number | null
          yahtzee: number | null
        }
        Insert: {
          created_at?: string
          id: string
          mancala?: number | null
          pai_gow?: number | null
          scrabble?: number | null
          yahtzee?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          mancala?: number | null
          pai_gow?: number | null
          scrabble?: number | null
          yahtzee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_total_shushers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          profile_pic_link: string | null
          username: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          profile_pic_link?: string | null
          username: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          profile_pic_link?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      yahtzee_games: {
        Row: {
          created_at: string
          current_player: string | null
          forfeiters: string[] | null
          gamemaster: string
          has_ended: boolean
          has_started: boolean
          id: string
          join_code: string | null
          players: string[] | null
          private: boolean
          room_name: string
          scorecards: string[] | null
          winner: string | null
        }
        Insert: {
          created_at?: string
          current_player?: string | null
          forfeiters?: string[] | null
          gamemaster: string
          has_ended?: boolean
          has_started?: boolean
          id?: string
          join_code?: string | null
          players?: string[] | null
          private?: boolean
          room_name: string
          scorecards?: string[] | null
          winner?: string | null
        }
        Update: {
          created_at?: string
          current_player?: string | null
          forfeiters?: string[] | null
          gamemaster?: string
          has_ended?: boolean
          has_started?: boolean
          id?: string
          join_code?: string | null
          players?: string[] | null
          private?: boolean
          room_name?: string
          scorecards?: string[] | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yahtzee_games_current_player_fkey"
            columns: ["current_player"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yahtzee_games_gamemaster_fkey"
            columns: ["gamemaster"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yahtzee_games_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      yahtzee_scorecards: {
        Row: {
          bonus: number | null
          bonus_potential: number | null
          chance: number | null
          chance_potential: number | null
          created_at: string
          current_dice: number[] | null
          fives: number | null
          fives_potential: number | null
          four_kind: number | null
          four_kind_potential: number | null
          fours: number | null
          fours_potential: number | null
          full_house: number | null
          full_house_potential: number | null
          game_id: string
          id: string
          large_straight: number | null
          large_straight_potential: number | null
          ones: number | null
          ones_potential: number | null
          player_id: string
          roll: number | null
          sixes: number | null
          sixes_potential: number | null
          small_straight: number | null
          small_straight_potential: number | null
          three_kind: number | null
          three_kind_potential: number | null
          threes: number | null
          threes_potential: number | null
          twos: number | null
          twos_potential: number | null
          yahtzee: number | null
          yahtzee_potential: number | null
        }
        Insert: {
          bonus?: number | null
          bonus_potential?: number | null
          chance?: number | null
          chance_potential?: number | null
          created_at?: string
          current_dice?: number[] | null
          fives?: number | null
          fives_potential?: number | null
          four_kind?: number | null
          four_kind_potential?: number | null
          fours?: number | null
          fours_potential?: number | null
          full_house?: number | null
          full_house_potential?: number | null
          game_id: string
          id?: string
          large_straight?: number | null
          large_straight_potential?: number | null
          ones?: number | null
          ones_potential?: number | null
          player_id: string
          roll?: number | null
          sixes?: number | null
          sixes_potential?: number | null
          small_straight?: number | null
          small_straight_potential?: number | null
          three_kind?: number | null
          three_kind_potential?: number | null
          threes?: number | null
          threes_potential?: number | null
          twos?: number | null
          twos_potential?: number | null
          yahtzee?: number | null
          yahtzee_potential?: number | null
        }
        Update: {
          bonus?: number | null
          bonus_potential?: number | null
          chance?: number | null
          chance_potential?: number | null
          created_at?: string
          current_dice?: number[] | null
          fives?: number | null
          fives_potential?: number | null
          four_kind?: number | null
          four_kind_potential?: number | null
          fours?: number | null
          fours_potential?: number | null
          full_house?: number | null
          full_house_potential?: number | null
          game_id?: string
          id?: string
          large_straight?: number | null
          large_straight_potential?: number | null
          ones?: number | null
          ones_potential?: number | null
          player_id?: string
          roll?: number | null
          sixes?: number | null
          sixes_potential?: number | null
          small_straight?: number | null
          small_straight_potential?: number | null
          three_kind?: number | null
          three_kind_potential?: number | null
          threes?: number | null
          threes_potential?: number | null
          twos?: number | null
          twos_potential?: number | null
          yahtzee?: number | null
          yahtzee_potential?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "yahtzee_scorecards_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "yahtzee_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yahtzee_scorecards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
