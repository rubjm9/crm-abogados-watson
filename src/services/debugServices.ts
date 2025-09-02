import { supabase } from './supabase';

export const debugServices = {
  async checkServicesData() {
    try {
      // Verificar si hay servicios
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .limit(5);
      
      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        return { success: false, error: servicesError.message };
      }
      
      console.log('Services found:', services);
      
      // Verificar si hay hitos
      const { data: milestones, error: milestonesError } = await supabase
        .from('service_milestones')
        .select('*')
        .limit(5);
      
      if (milestonesError) {
        console.error('Error fetching milestones:', milestonesError);
      } else {
        console.log('Milestones found:', milestones);
      }
      
      return { 
        success: true, 
        servicesCount: services?.length || 0,
        milestonesCount: milestones?.length || 0
      };
    } catch (err) {
      console.error('Exception checking services data:', err);
      return { success: false, error: 'Exception occurred' };
    }
  },

  async checkTableStructure() {
    try {
      // Intentar obtener la estructura de la tabla
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Error checking table structure:', error);
        return { success: false, error: error.message };
      }
      
      // Si no hay datos, intentar obtener al menos la estructura
      const { data: structureData, error: structureError } = await supabase
        .from('services')
        .select('id, name, description, category, base_price, estimated_cost, complexity, required_documents, notes, is_active, created_at, updated_at')
        .limit(0);
      
      if (structureError) {
        console.error('Error checking full structure:', structureError);
        return { success: false, error: structureError.message };
      }
      
      return { success: true, message: 'Table structure is accessible' };
    } catch (err) {
      console.error('Exception checking table structure:', err);
      return { success: false, error: 'Exception occurred' };
    }
  },

  async getTableColumns() {
    try {
      // Intentar obtener todas las columnas posibles
      const columns = [
        'id', 'name', 'description', 'category', 'base_price', 
        'estimated_cost', 'complexity', 'required_documents', 
        'notes', 'is_active', 'created_at', 'updated_at'
      ];
      
      const results = {};
      
      for (const column of columns) {
        try {
          const { error } = await supabase
            .from('services')
            .select(column)
            .limit(1);
          
          results[column] = error ? { exists: false, error: error.message } : { exists: true };
        } catch (err) {
          results[column] = { exists: false, error: 'Exception occurred' };
        }
      }
      
      return results;
    } catch (err) {
      console.error('Exception checking columns:', err);
      return { error: 'Exception occurred' };
    }
  }
};
