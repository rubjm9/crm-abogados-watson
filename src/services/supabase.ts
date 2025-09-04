import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Por favor, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas de Supabase
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          nationality: string;
          expedient_number: number;
          birth_date: string | null;
          preferred_language: string;
          country_of_origin: string;
          city_of_residence: string | null;
          passport_number: string | null;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          nationality: string;
          expedient_number?: number;
          birth_date?: string | null;
          preferred_language?: string;
          country_of_origin: string;
          city_of_residence?: string | null;
          passport_number?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          nationality?: string;
          expedient_number?: number;
          birth_date?: string | null;
          preferred_language?: string;
          country_of_origin?: string;
          city_of_residence?: string | null;
          passport_number?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          base_price: number;
          estimated_cost: number;
          complexity: string;
          required_documents: string[];
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          base_price: number;
          estimated_cost: number;
          complexity?: string;
          required_documents?: string[];
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          base_price?: number;
          estimated_cost?: number;
          complexity?: string;
          required_documents?: string[];
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_milestones: {
        Row: {
          id: string;
          service_id: string;
          name: string;
          description: string | null;
          order_number: number;
          is_payment_required: boolean;
          default_payment_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          name: string;
          description?: string | null;
          order_number: number;
          is_payment_required?: boolean;
          default_payment_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          name?: string;
          description?: string | null;
          order_number?: number;
          is_payment_required?: boolean;
          default_payment_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_services: {
        Row: {
          id: string;
          client_id: string;
          service_id: string;
          assigned_lawyer_id: string | null;
          custom_price: number | null;
          status: string;
          start_date: string;
          end_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          service_id: string;
          assigned_lawyer_id?: string | null;
          custom_price?: number | null;
          status?: string;
          start_date?: string;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          service_id?: string;
          assigned_lawyer_id?: string | null;
          custom_price?: number | null;
          status?: string;
          start_date?: string;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_milestones: {
        Row: {
          id: string;
          client_service_id: string;
          milestone_id: string;
          is_completed: boolean;
          completed_at: string | null;
          payment_amount: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_service_id: string;
          milestone_id: string;
          is_completed?: boolean;
          completed_at?: string | null;
          payment_amount?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_service_id?: string;
          milestone_id?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          payment_amount?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_expenses: {
        Row: {
          id: string;
          client_service_id: string;
          description: string;
          amount: number;
          expense_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_service_id: string;
          description: string;
          amount: number;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_service_id?: string;
          description?: string;
          amount?: number;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_documents: {
        Row: {
          id: string;
          client_service_id: string;
          document_name: string;
          is_obtained: boolean;
          obtained_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_service_id: string;
          document_name: string;
          is_obtained?: boolean;
          obtained_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_service_id?: string;
          document_name?: string;
          is_obtained?: boolean;
          obtained_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
