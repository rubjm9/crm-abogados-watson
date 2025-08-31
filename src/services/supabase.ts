import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
          status: 'active' | 'inactive' | 'pending';
          address: string | null;
          passport_number: string | null;
          assigned_lawyer: string | null;
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
          status?: 'active' | 'inactive' | 'pending';
          address?: string | null;
          passport_number?: string | null;
          assigned_lawyer?: string | null;
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
          status?: 'active' | 'inactive' | 'pending';
          address?: string | null;
          passport_number?: string | null;
          assigned_lawyer?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      case_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          estimated_duration: number | null;
          complexity: 'baja' | 'media' | 'alta';
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          estimated_duration?: number | null;
          complexity?: 'baja' | 'media' | 'alta';
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          estimated_duration?: number | null;
          complexity?: 'baja' | 'media' | 'alta';
        };
      };
      cases: {
        Row: {
          id: string;
          client_id: string;
          case_type_id: string;
          title: string;
          description: string | null;
          status: 'abierto' | 'en_proceso' | 'cerrado' | 'archivado';
          priority: 'baja' | 'media' | 'alta' | 'urgente';
          opened_at: string;
          closed_at: string | null;
          assigned_lawyer: string | null;
          estimated_completion: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          case_type_id: string;
          title: string;
          description?: string | null;
          status?: 'abierto' | 'en_proceso' | 'cerrado' | 'archivado';
          priority?: 'baja' | 'media' | 'alta' | 'urgente';
          opened_at?: string;
          closed_at?: string | null;
          assigned_lawyer?: string | null;
          estimated_completion?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          case_type_id?: string;
          title?: string;
          description?: string | null;
          status?: 'abierto' | 'en_proceso' | 'cerrado' | 'archivado';
          priority?: 'baja' | 'media' | 'alta' | 'urgente';
          opened_at?: string;
          closed_at?: string | null;
          assigned_lawyer?: string | null;
          estimated_completion?: string | null;
        };
      };
    };
  };
}
