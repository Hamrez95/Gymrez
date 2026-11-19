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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      body_measurements: {
        Row: {
          arm_cm: number | null
          chest_cm: number | null
          created_at: string
          height_cm: number | null
          hip_cm: number | null
          household_id: string
          id: string
          measurement_date: string
          metrics: Json | null
          neck_cm: number | null
          notes: string | null
          profile_id: string
          revision: number
          source: string
          thigh_cm: number | null
          updated_at: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          household_id: string
          id?: string
          measurement_date: string
          metrics?: Json | null
          neck_cm?: number | null
          notes?: string | null
          profile_id: string
          revision?: number
          source?: string
          thigh_cm?: number | null
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          household_id?: string
          id?: string
          measurement_date?: string
          metrics?: Json | null
          neck_cm?: number | null
          notes?: string | null
          profile_id?: string
          revision?: number
          source?: string
          thigh_cm?: number | null
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_profile_id_household_id_fkey"
            columns: ["profile_id", "household_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "household_id"]
          },
        ]
      }
      exercise_media: {
        Row: {
          alt_fa: string
          created_at: string
          exercise_id: string
          id: string
          license: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_fa: string
          created_at?: string
          exercise_id: string
          id?: string
          license: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_fa?: string
          created_at?: string
          exercise_id?: string
          id?: string
          license?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_media_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          equipment: string | null
          id: string
          instructions: string | null
          is_active: boolean
          muscle_group: string | null
          name_en: string | null
          name_fa: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          muscle_group?: string | null
          name_en?: string | null
          name_fa: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          muscle_group?: string | null
          name_en?: string | null
          name_fa?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          created_at: string
          household_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      performed_sets: {
        Row: {
          actual_reps: number | null
          client_id: string
          completed_at: string | null
          created_at: string
          distance_m: number | null
          duration_seconds: number | null
          exercise_id: string | null
          exercise_snapshot: Json
          household_id: string
          id: string
          is_done: boolean
          load_kg: number | null
          position: number
          profile_id: string
          revision: number
          updated_at: string
          workout_session_id: string
        }
        Insert: {
          actual_reps?: number | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          distance_m?: number | null
          duration_seconds?: number | null
          exercise_id?: string | null
          exercise_snapshot: Json
          household_id: string
          id?: string
          is_done?: boolean
          load_kg?: number | null
          position?: number
          profile_id: string
          revision?: number
          updated_at?: string
          workout_session_id: string
        }
        Update: {
          actual_reps?: number | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          distance_m?: number | null
          duration_seconds?: number | null
          exercise_id?: string | null
          exercise_snapshot?: Json
          household_id?: string
          id?: string
          is_done?: boolean
          load_kg?: number | null
          position?: number
          profile_id?: string
          revision?: number
          updated_at?: string
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performed_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performed_sets_profile_id_household_id_fkey"
            columns: ["profile_id", "household_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "household_id"]
          },
          {
            foreignKeyName: "performed_sets_workout_session_id_profile_id_fkey"
            columns: ["workout_session_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id", "profile_id"]
          },
        ]
      }
      planned_exercises: {
        Row: {
          created_at: string
          exercise_id: string | null
          exercise_snapshot: Json
          group_key: string | null
          household_id: string
          id: string
          notes: string | null
          position: number
          profile_id: string
          program_id: string
          program_session_id: string
          program_version_id: string
          reps_max: number | null
          reps_min: number | null
          rest_seconds: number | null
          set_count: number | null
          tempo: string | null
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          exercise_snapshot: Json
          group_key?: string | null
          household_id: string
          id?: string
          notes?: string | null
          position?: number
          profile_id: string
          program_id: string
          program_session_id: string
          program_version_id: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          set_count?: number | null
          tempo?: string | null
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          exercise_snapshot?: Json
          group_key?: string | null
          household_id?: string
          id?: string
          notes?: string | null
          position?: number
          profile_id?: string
          program_id?: string
          program_session_id?: string
          program_version_id?: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          set_count?: number | null
          tempo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planned_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_exercises_profile_id_household_id_fkey"
            columns: ["profile_id", "household_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "household_id"]
          },
          {
            foreignKeyName: "planned_exercises_program_session_id_program_version_id_pr_fkey"
            columns: [
              "program_session_id",
              "program_version_id",
              "program_id",
              "profile_id",
            ]
            isOneToOne: false
            referencedRelation: "program_sessions"
            referencedColumns: [
              "id",
              "program_version_id",
              "program_id",
              "profile_id",
            ]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          display_name: string
          goal: string | null
          height_cm: number | null
          household_id: string
          id: string
          revision: number
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          display_name: string
          goal?: string | null
          height_cm?: number | null
          household_id: string
          id?: string
          revision?: number
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          display_name?: string
          goal?: string | null
          height_cm?: number | null
          household_id?: string
          id?: string
          revision?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      program_imports: {
        Row: {
          checksum: string
          household_id: string
          id: string
          imported_at: string
          imported_program_id: string | null
          profile_id: string
          source_id: string
          source_version: string
        }
        Insert: {
          checksum: string
          household_id: string
          id?: string
          imported_at?: string
          imported_program_id?: string | null
          profile_id: string
          source_id: string
          source_version: string
        }
        Update: {
          checksum?: string
          household_id?: string
          id?: string
          imported_at?: string
          imported_program_id?: string | null
          profile_id?: string
          source_id?: string
          source_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_imports_imported_program_id_profile_id_fkey"
            columns: ["imported_program_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id", "profile_id"]
          },
          {
            foreignKeyName: "program_imports_profile_id_household_id_fkey"
            columns: ["profile_id", "household_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "household_id"]
          },
        ]
      }
      program_sessions: {
        Row: {
          created_at: string
          household_id: string
          id: string
          name: string
          notes: string | null
          position: number
          profile_id: string
          program_id: string
          program_version_id: string
          weekday: number | null
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          name: string
          notes?: string | null
          position?: number
          profile_id: string
          program_id: string
          program_version_id: string
          weekday?: number | null
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          name?: string
          notes?: string | null
          position?: number
          profile_id?: string
          program_id?: string
          program_version_id?: string
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "program_sessions_profile_id_household_id_fkey"
            columns: ["profile_id", "household_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "household_id"]
          },
          {
            foreignKeyName: "program_sessions_program_version_id_program_id_profile_id_fkey"
            columns: ["program_version_id", "program_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "program_versions"
            referencedColumns: ["id", "program_id", "profile_id"]
          },
        ]
      }
      program_versions: {
        Row: {
          checksum: string | null
          created_at: string
          household_id: string
          id: string
          plan_snapshot: Json | null
          profile_id: string
          program_id: string
          published_at: string | null
          source_id: string | null
          source_version: string | null
          title_snapshot: string
          version_no: number
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          household_id: string
          id?: string
          plan_snapshot?: Json | null
          profile_id: string
          program_id: string
          published_at?: string | null
          source_id?: string | null
          source_version?: string | null
          title_snapshot: string
          version_no: number
        }
        Update: {
          checksum?: string | null
          created_at?: string
          household_id?: string
          id?: string
          plan_snapshot?: Json | null
          profile_id?: string
          program_id?: string
          published_at?: string | null
          source_id?: string | null
          source_version?: string | null
          title_snapshot?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_versions_profile_id_household_id_fkey"
            columns: ["profile_id", "household_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "household_id"]
          },
          {
            foreignKeyName: "program_versions_program_id_profile_id_fkey"
            columns: ["program_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id", "profile_id"]
          },
        ]
      }
      programs: {
        Row: {
          archive_checksum: string | null
          archive_metadata: Json | null
          created_at: string
          ends_on: string | null
          household_id: string
          id: string
          profile_id: string
          revision: number
          starts_on: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          archive_checksum?: string | null
          archive_metadata?: Json | null
          created_at?: string
          ends_on?: string | null
          household_id: string
          id?: string
          profile_id: string
          revision?: number
          starts_on?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          archive_checksum?: string | null
          archive_metadata?: Json | null
          created_at?: string
          ends_on?: string | null
          household_id?: string
          id?: string
          profile_id?: string
          revision?: number
          starts_on?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_profile_id_household_id_fkey"
            columns: ["profile_id", "household_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "household_id"]
          },
        ]
      }
      sync_operations: {
        Row: {
          created_at: string
          entity_type: string
          household_id: string
          id: string
          operation_id: string
          payload: Json
          processed_at: string | null
          profile_id: string | null
          result: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          household_id: string
          id?: string
          operation_id: string
          payload: Json
          processed_at?: string | null
          profile_id?: string | null
          result?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          household_id?: string
          id?: string
          operation_id?: string
          payload?: Json
          processed_at?: string | null
          profile_id?: string | null
          result?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_operations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_operations_profile_id_household_id_fkey"
            columns: ["profile_id", "household_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "household_id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string
          elapsed_seconds: number
          ended_at: string | null
          household_id: string
          id: string
          notes: string | null
          plan_snapshot: Json
          profile_id: string
          program_id: string | null
          program_version_id: string | null
          revision: number
          started_at: string
          status: string
          title_snapshot: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          elapsed_seconds?: number
          ended_at?: string | null
          household_id: string
          id?: string
          notes?: string | null
          plan_snapshot?: Json
          profile_id: string
          program_id?: string | null
          program_version_id?: string | null
          revision?: number
          started_at?: string
          status?: string
          title_snapshot: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          elapsed_seconds?: number
          ended_at?: string | null
          household_id?: string
          id?: string
          notes?: string | null
          plan_snapshot?: Json
          profile_id?: string
          program_id?: string | null
          program_version_id?: string | null
          revision?: number
          started_at?: string
          status?: string
          title_snapshot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_profile_id_household_id_fkey"
            columns: ["profile_id", "household_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "household_id"]
          },
          {
            foreignKeyName: "workout_sessions_program_id_profile_id_fkey"
            columns: ["program_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id", "profile_id"]
          },
          {
            foreignKeyName: "workout_sessions_program_version_id_program_id_profile_id_fkey"
            columns: ["program_version_id", "program_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "program_versions"
            referencedColumns: ["id", "program_id", "profile_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_archive_program: {
        Args: { p_checksum: string; p_profile: string }
        Returns: undefined
      }
      import_archive_program: {
        Args: { p_checksum: string; p_metadata: Json; p_profile: string }
        Returns: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
