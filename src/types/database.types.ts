export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PlanType = 'basic' | 'plus' | 'vip'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          plan_type: PlanType // Added
          gender: string | null
          age: number | null
          height: number | null
          weight: number | null
          activity_level: string | null // Added
          objective: string | null // Added
          onboarding_complete: boolean | null
          current_diet_plan_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          plan_type?: PlanType
          gender?: string | null
          age?: number | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          objective?: string | null
          onboarding_complete?: boolean | null
          current_diet_plan_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          plan_type?: PlanType
          gender?: string | null
          age?: number | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          objective?: string | null
          onboarding_complete?: boolean | null
          current_diet_plan_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      diet_regenerations: { // New Table
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      quiz_submissions: {
        Row: {
          id: string
          user_id: string | null
          responses: Json | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          responses?: Json | null
          completed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          responses?: Json | null
          completed_at?: string | null
          created_at?: string | null
        }
      }
      // ... existing tables (simplified for this context)
      diet_plans: {
        Row: {
          id: string
          user_id: string
          daily_calories: number
          macros: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_calories: number
          macros: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_calories?: number
          macros?: Json
          created_at?: string
        }
      }
    }
  }
}
