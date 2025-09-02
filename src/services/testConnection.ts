import { supabase } from './supabase';

export const testConnection = {
  async testServicesTable() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Error testing services table:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Exception testing services table:', err);
      return { success: false, error: 'Exception occurred' };
    }
  },

  async testTablesExist() {
    const tables = ['services', 'service_milestones', 'client_services', 'client_milestones', 'client_expenses', 'client_documents'];
    const results = {};
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        results[table] = error ? { exists: false, error: error.message } : { exists: true };
      } catch (err) {
        results[table] = { exists: false, error: 'Exception occurred' };
      }
    }
    
    return results;
  }
};
