export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          created_at: string
          id: string
          inn: string | null
          passport_issued_by: string | null
          passport_issued_date: string | null
          passport_number: string | null
          passport_series: string | null
          snils: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inn?: string | null
          passport_issued_by?: string | null
          passport_issued_date?: string | null
          passport_number?: string | null
          passport_series?: string | null
          snils?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inn?: string | null
          passport_issued_by?: string | null
          passport_issued_date?: string | null
          passport_number?: string | null
          passport_series?: string | null
          snils?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          attachment_date: string | null
          birth_date: string | null
          card_number: string | null
          clinic: string | null
          created_at: string
          email: string | null
          email_confirmed_at: string | null
          full_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          last_sign_in_at: string | null
          password: string | null
          phone: string | null
          photo: string | null
          role: string
          updated_at: string
        }
        Insert: {
          attachment_date?: string | null
          birth_date?: string | null
          card_number?: string | null
          clinic?: string | null
          created_at?: string
          email?: string | null
          email_confirmed_at?: string | null
          full_name: string
          gender?: string | null
          id: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          password?: string | null
          phone?: string | null
          photo?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          attachment_date?: string | null
          birth_date?: string | null
          card_number?: string | null
          clinic?: string | null
          created_at?: string
          email?: string | null
          email_confirmed_at?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          password?: string | null
          phone?: string | null
          photo?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reset_password_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reset_password_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          created_at: string | null
          driving_categories: string[] | null
          experience: number | null
          full_name: string
          id: string
          photo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          driving_categories?: string[] | null
          experience?: number | null
          full_name: string
          id?: string
          photo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          driving_categories?: string[] | null
          experience?: number | null
          full_name?: string
          id?: string
          photo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      server_commands: {
        Row: {
          command: string
          created_at: string | null
          executed_at: string | null
          id: string
          output: string | null
          server_id: string | null
          status: string | null
        }
        Insert: {
          command: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          output?: string | null
          server_id?: string | null
          status?: string | null
        }
        Update: {
          command?: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          output?: string | null
          server_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "server_commands_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          created_at: string | null
          host: string
          id: string
          name: string
          ssh_key: string | null
          ssh_private_key: string | null
          ssh_public_key: string | null
          ssh_username: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          host: string
          id?: string
          name: string
          ssh_key?: string | null
          ssh_private_key?: string | null
          ssh_public_key?: string | null
          ssh_username?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          host?: string
          id?: string
          name?: string
          ssh_key?: string | null
          ssh_private_key?: string | null
          ssh_public_key?: string | null
          ssh_username?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          last_accessed_at: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          last_accessed_at?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_exercises: {
        Row: {
          created_at: string
          id: string
          name: string
          reps: string
          session_id: string
          sets: number
          updated_at: string
          weight: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          reps: string
          session_id: string
          sets: number
          updated_at?: string
          weight?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          reps?: string
          session_id?: string
          sets?: number
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          client_id: string | null
          created_at: string
          end_time: string
          id: string
          notes: string | null
          start_time: string
          status: string
          title: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          status?: string
          title: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          status?: string
          title?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_data: {
        Row: {
          bank_card: string | null
          created_at: string | null
          id: string
          name: string
          passport_info: string | null
          phone: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          bank_card?: string | null
          created_at?: string | null
          id: string
          name: string
          passport_info?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          bank_card?: string | null
          created_at?: string | null
          id?: string
          name?: string
          passport_info?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          role_fit_club: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role: string
          role_fit_club?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          role_fit_club?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string | null
          driver_license: string | null
          id: string
          insurance_number: string | null
          license_plate: string
          model: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          driver_license?: string | null
          id?: string
          insurance_number?: string | null
          license_plate: string
          model: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          driver_license?: string | null
          id?: string
          insurance_number?: string | null
          license_plate?: string
          model?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      work_experience: {
        Row: {
          company: string
          created_at: string | null
          duration: string
          id: string
          position: string
          resume_id: string
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          duration: string
          id?: string
          position: string
          resume_id: string
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          duration?: string
          id?: string
          position?: string
          resume_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_experience_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_user: {
        Args: {
          user_email: string
          user_password: string
        }
        Returns: string
      }
      create_session: {
        Args: {
          user_id: string
          expires_in?: unknown
        }
        Returns: string
      }
      create_user_data: {
        Args: {
          user_id: string
          user_name: string
          user_passport_info?: string
          user_bank_card?: string
          user_rating?: number
          user_phone?: string
        }
        Returns: boolean
      }
      get_user_by_email: {
        Args: {
          user_email: string
        }
        Returns: {
          id: string
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      hash_password: {
        Args: {
          password: string
        }
        Returns: string
      }
      update_user_password: {
        Args: {
          user_id: string
          new_password: string
        }
        Returns: boolean
      }
      validate_session: {
        Args: {
          session_token: string
        }
        Returns: string
      }
      verify_password: {
        Args: {
          input_password: string
          stored_password: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
