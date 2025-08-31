import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Probar la conexión haciendo una consulta simple
        const { data, error } = await supabase
          .from('case_types')
          .select('*')
          .limit(1);

        if (error) {
          throw error;
        }

        setIsConnected(true);
        setError(null);
        console.log('✅ Conexión a Supabase exitosa');
      } catch (err) {
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('❌ Error de conexión a Supabase:', err);
      }
    };

    testConnection();
  }, []);

  return { isConnected, error };
};
