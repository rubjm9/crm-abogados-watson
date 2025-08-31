import { supabase } from './supabase';
import { Service, ServiceMilestone, CreateServiceForm, CreateMilestoneForm } from '../types';

export const serviceService = {
  // Obtener todos los servicios activos
  async getAllServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching services:', error);
      throw error;
    }

    return data || [];
  },

  // Obtener un servicio por ID con sus hitos
  async getServiceById(id: string): Promise<Service & { milestones: ServiceMilestone[] }> {
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (serviceError) {
      console.error('Error fetching service:', serviceError);
      throw serviceError;
    }

    const { data: milestones, error: milestonesError } = await supabase
      .from('service_milestones')
      .select('*')
      .eq('service_id', id)
      .order('order_number');

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
      throw milestonesError;
    }

    return {
      ...service,
      milestones: milestones || []
    };
  },

  // Crear un nuevo servicio con sus hitos
  async createService(serviceData: CreateServiceForm): Promise<Service> {
    const { milestones, ...serviceInfo } = serviceData;

    // Crear el servicio
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert(serviceInfo)
      .select()
      .single();

    if (serviceError) {
      console.error('Error creating service:', serviceError);
      throw serviceError;
    }

    // Crear los hitos si existen
    if (milestones && milestones.length > 0) {
      const milestonesWithServiceId = milestones.map(milestone => ({
        ...milestone,
        service_id: service.id
      }));

      const { error: milestonesError } = await supabase
        .from('service_milestones')
        .insert(milestonesWithServiceId);

      if (milestonesError) {
        console.error('Error creating milestones:', milestonesError);
        throw milestonesError;
      }
    }

    return service;
  },

  // Actualizar un servicio
  async updateService(id: string, serviceData: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      throw error;
    }

    return data;
  },

  // Desactivar un servicio (no eliminar)
  async deactivateService(id: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating service:', error);
      throw error;
    }
  },

  // Obtener hitos de un servicio
  async getServiceMilestones(serviceId: string): Promise<ServiceMilestone[]> {
    const { data, error } = await supabase
      .from('service_milestones')
      .select('*')
      .eq('service_id', serviceId)
      .order('order_number');

    if (error) {
      console.error('Error fetching milestones:', error);
      throw error;
    }

    return data || [];
  },

  // Crear un hito para un servicio
  async createMilestone(milestoneData: CreateMilestoneForm & { serviceId: string }): Promise<ServiceMilestone> {
    const { data, error } = await supabase
      .from('service_milestones')
      .insert({
        ...milestoneData,
        service_id: milestoneData.serviceId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }

    return data;
  },

  // Actualizar un hito
  async updateMilestone(id: string, milestoneData: Partial<ServiceMilestone>): Promise<ServiceMilestone> {
    const { data, error } = await supabase
      .from('service_milestones')
      .update(milestoneData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }

    return data;
  },

  // Eliminar un hito
  async deleteMilestone(id: string): Promise<void> {
    const { error } = await supabase
      .from('service_milestones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  }
};
