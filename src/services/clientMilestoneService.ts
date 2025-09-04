import { supabase } from './supabase';
import { ClientMilestone, CreateClientMilestoneForm } from '../types';

export const clientMilestoneService = {
  // Obtener todos los hitos de un cliente
  async getClientMilestones(clientId: string): Promise<ClientMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('client_milestones')
        .select(`
          *,
          client_service:client_services(*),
          milestone:service_milestones(*)
        `)
        .eq('client_service.client_id', clientId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((cm: any) => ({
        id: cm.id,
        clientServiceId: cm.client_service_id,
        milestoneId: cm.milestone_id,
        isCompleted: cm.is_completed,
        completedAt: cm.completed_at,
        paymentAmount: cm.payment_amount,
        notes: cm.notes,
        createdAt: cm.created_at,
        updatedAt: cm.updated_at,
        milestone: cm.milestone ? {
          id: cm.milestone.id,
          serviceId: cm.milestone.service_id,
          name: cm.milestone.name,
          description: cm.milestone.description,
          orderNumber: cm.milestone.order_number,
          isPaymentRequired: cm.milestone.is_payment_required,
          defaultPaymentAmount: cm.milestone.default_payment_amount,
          paymentPercentage: cm.milestone.payment_percentage,
          createdAt: cm.milestone.created_at,
          updatedAt: cm.milestone.updated_at,
        } : undefined,
      }));
    } catch (error) {
      console.error('Error al obtener hitos del cliente:', error);
      throw error;
    }
  },

  // Obtener hitos de un servicio específico
  async getServiceMilestones(clientServiceId: string): Promise<ClientMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('client_milestones')
        .select(`
          *,
          milestone:service_milestones(*)
        `)
        .eq('client_service_id', clientServiceId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((cm: any) => ({
        id: cm.id,
        clientServiceId: cm.client_service_id,
        milestoneId: cm.milestone_id,
        isCompleted: cm.is_completed,
        completedAt: cm.completed_at,
        paymentAmount: cm.payment_amount,
        notes: cm.notes,
        createdAt: cm.created_at,
        updatedAt: cm.updated_at,
        milestone: cm.milestone ? {
          id: cm.milestone.id,
          serviceId: cm.milestone.service_id,
          name: cm.milestone.name,
          description: cm.milestone.description,
          orderNumber: cm.milestone.order_number,
          isPaymentRequired: cm.milestone.is_payment_required,
          defaultPaymentAmount: cm.milestone.default_payment_amount,
          paymentPercentage: cm.milestone.payment_percentage,
          createdAt: cm.milestone.created_at,
          updatedAt: cm.milestone.updated_at,
        } : undefined,
      }));
    } catch (error) {
      console.error('Error al obtener hitos del servicio:', error);
      throw error;
    }
  },

  // Crear un nuevo hito para un cliente
  async createClientMilestone(milestoneData: CreateClientMilestoneForm): Promise<ClientMilestone> {
    try {
      const { data, error } = await supabase
        .from('client_milestones')
        .insert({
          client_service_id: milestoneData.clientServiceId,
          milestone_id: milestoneData.milestoneId,
          is_completed: false,
          payment_amount: milestoneData.paymentAmount || null,
          notes: milestoneData.notes || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        clientServiceId: data.client_service_id,
        milestoneId: data.milestone_id,
        isCompleted: data.is_completed,
        completedAt: data.completed_at,
        paymentAmount: data.payment_amount,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error al crear hito del cliente:', error);
      throw error;
    }
  },

  // Actualizar un hito
  async updateClientMilestone(id: string, updates: Partial<ClientMilestone>): Promise<ClientMilestone> {
    try {
      const updateData: any = {};
      
      if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;
      if (updates.paymentAmount !== undefined) updateData.payment_amount = updates.paymentAmount;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('client_milestones')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        clientServiceId: data.client_service_id,
        milestoneId: data.milestone_id,
        isCompleted: data.is_completed,
        completedAt: data.completed_at,
        paymentAmount: data.payment_amount,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error al actualizar hito del cliente:', error);
      throw error;
    }
  },

  // Marcar hito como completado
  async completeMilestone(id: string, notes?: string): Promise<ClientMilestone> {
    try {
      const updateData: any = {
        is_completed: true,
        completed_at: new Date().toISOString()
      };

      if (notes) updateData.notes = notes;

      const { data, error } = await supabase
        .from('client_milestones')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        clientServiceId: data.client_service_id,
        milestoneId: data.milestone_id,
        isCompleted: data.is_completed,
        completedAt: data.completed_at,
        paymentAmount: data.payment_amount,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error al completar hito:', error);
      throw error;
    }
  },

  // Obtener progreso de un servicio
  async getServiceProgress(clientServiceId: string): Promise<{ completed: number; total: number; percentage: number }> {
    try {
      const milestones = await this.getServiceMilestones(clientServiceId);
      const total = milestones.length;
      const completed = milestones.filter(m => m.isCompleted).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percentage };
    } catch (error) {
      console.error('Error al obtener progreso del servicio:', error);
      throw error;
    }
  },

  // Obtener hitos próximos a vencer (para notificaciones)
  async getUpcomingMilestones(days: number = 7): Promise<ClientMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('client_milestones')
        .select(`
          *,
          milestone:service_milestones(*)
        `)
        .eq('is_completed', false)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((cm: any) => ({
        id: cm.id,
        clientServiceId: cm.client_service_id,
        milestoneId: cm.milestone_id,
        isCompleted: cm.is_completed,
        completedAt: cm.completed_at,
        paymentAmount: cm.payment_amount,
        notes: cm.notes,
        createdAt: cm.created_at,
        updatedAt: cm.updated_at,
        milestone: cm.milestone ? {
          id: cm.milestone.id,
          serviceId: cm.milestone.service_id,
          name: cm.milestone.name,
          description: cm.milestone.description,
          orderNumber: cm.milestone.order_number,
          isPaymentRequired: cm.milestone.is_payment_required,
          defaultPaymentAmount: cm.milestone.default_payment_amount,
          paymentPercentage: cm.milestone.payment_percentage,
          createdAt: cm.milestone.created_at,
          updatedAt: cm.milestone.updated_at,
        } : undefined,
      }));
    } catch (error) {
      console.error('Error al obtener hitos próximos a vencer:', error);
      throw error;
    }
  },

  // Eliminar un hito
  async deleteClientMilestone(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('client_milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error al eliminar hito del cliente:', error);
      throw error;
    }
  }
};
