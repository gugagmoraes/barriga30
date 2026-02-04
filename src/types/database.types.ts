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
          plan_type: PlanType
          workout_level: 'beginner' | 'intermediate' | 'advanced'
          gender: string | null
          age: number | null
          height: number | null
          weight: number | null
          activity_level: string | null
          objective: string | null
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
          workout_level?: 'beginner' | 'intermediate' | 'advanced'
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
          workout_level?: 'beginner' | 'intermediate' | 'advanced'
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
      workouts: {
        Row: {
          id: string
          name: string
          description: string | null
          level: 'beginner' | 'intermediate' | 'advanced' | null
          type: 'A' | 'B' | 'C' | null
          video_url: string | null
          duration_minutes: number | null
          exercises: Json | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced' | null
          type?: 'A' | 'B' | 'C' | null
          video_url?: string | null
          duration_minutes?: number | null
          exercises?: Json | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced' | null
          type?: 'A' | 'B' | 'C' | null
          video_url?: string | null
          duration_minutes?: number | null
          exercises?: Json | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      workout_completions: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          points_earned: number | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          points_earned?: number | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          points_earned?: number | null
          completed_at?: string | null
        }
      }
      diet_preferences: {
        Row: {
          id: string
          user_id: string
          weight: number | null
          height: number | null
          age: number | null
          gender: string | null
          workout_frequency: string | null
          workout_duration: string | null
          food_preferences: Json | null
          water_bottle_size_ml: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          weight?: number | null
          height?: number | null
          age?: number | null
          gender?: string | null
          workout_frequency?: string | null
          workout_duration?: string | null
          food_preferences?: Json | null
          water_bottle_size_ml?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number | null
          height?: number | null
          age?: number | null
          gender?: string | null
          workout_frequency?: string | null
          workout_duration?: string | null
          food_preferences?: Json | null
          water_bottle_size_ml?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      daily_tracking: {
        Row: {
          id: string
          user_id: string
          date: string
          water_ml: number
          meals_completed: number
          workout_completed: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          water_ml?: number
          meals_completed?: number
          workout_completed?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          water_ml?: number
          meals_completed?: number
          workout_completed?: boolean
          created_at?: string | null
        }
      }
      weight_records: {
        Row: {
          id: string
          user_id: string
          weight: number
          recorded_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          recorded_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          recorded_at?: string | null
        }
      }
      measurements: {
        Row: {
          id: string
          user_id: string
          waist: number | null
          hips: number | null
          thigh: number | null
          arm: number | null
          bust: number | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          waist?: number | null
          hips?: number | null
          thigh?: number | null
          arm?: number | null
          bust?: number | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          waist?: number | null
          hips?: number | null
          thigh?: number | null
          arm?: number | null
          bust?: number | null
          recorded_at?: string | null
        }
      }
      diet_snapshots: {
        Row: {
          id: string
          user_id: string
          origin: string | null
          name: string | null
          daily_calories: number
          macros: Json | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          origin?: string | null
          name?: string | null
          daily_calories: number
          macros?: Json | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          origin?: string | null
          name?: string | null
          daily_calories?: number
          macros?: Json | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      snapshot_meals: {
        Row: {
          id: string
          diet_snapshot_id: string
          name: string
          order_index: number
          time_of_day: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          diet_snapshot_id: string
          name: string
          order_index: number
          time_of_day?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          diet_snapshot_id?: string
          name?: string
          order_index?: number
          time_of_day?: string | null
          created_at?: string | null
        }
      }
      snapshot_items: {
        Row: {
          id: string
          snapshot_meal_id: string
          name: string
          quantity: string | null
          calories: number | null
          category: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          snapshot_meal_id: string
          name: string
          quantity?: string | null
          calories?: number | null
          category?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          snapshot_meal_id?: string
          name?: string
          quantity?: string | null
          calories?: number | null
          category?: string | null
          created_at?: string | null
        }
      }
      quiz_submissions: {
        Row: {
          id: string
          user_id: string | null
          responses: Json | null
          status: string
          version: string | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          responses?: Json | null
          status: string
          version?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          responses?: Json | null
          status?: string
          version?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
      }
    }
  }
}
