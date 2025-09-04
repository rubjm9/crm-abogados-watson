import { supabase } from './supabase';
import { CaseMilestone, CreateCaseMilestoneForm } from '../types';

export const caseMilestoneService = {
  // Obtener hitos de un caso
  async getCaseMilestones(caseId: string): Promise<CaseMilestone[]> {
    const { data, error } = await supabase
      .from('case_milestones')
      .select(`
        *,
        milestone:service_milestones(*)
      `)
      .eq('caseId', caseId)
      .order('orderNumber', { ascending: true });

    if (error) {
      console.error('Error fetching case milestones:', error);
      throw new Error('Error al obtener los hitos del caso');
    }

    return data || [];
  },

  // Crear hitos para un caso basado en el servicio
  async createCaseMilestonesFromService(caseId: string, serviceId: string, totalPrice: number): Promise<CaseMilestone[]> {
    try {
      // Primero obtener los hitos del servicio
      const { data: serviceMilestones, error: serviceError } = await supabase
        .from('service_milestones')
        .select('*')
        .eq('serviceId', serviceId)
        .order('orderNumber', { ascending: true });

      if (serviceError) {
        throw new Error('Error al obtener hitos del servicio');
      }

      if (!serviceMilestones || serviceMilestones.length === 0) {
        return [];
      }

      // Crear hitos del caso basados en los hitos del servicio
      const caseMilestones = serviceMilestones.map((milestone, index) => ({
        caseId,
        milestoneId: milestone.id,
        isCompleted: false,
        paymentAmount: milestone.paymentPercentage 
          ? (totalPrice * milestone.paymentPercentage / 100)
          : milestone.defaultPaymentAmount || 0,
        paymentPercentage: milestone.paymentPercentage || 0,
        isPaymentCollected: false,
        notes: `Hito ${index + 1}: ${milestone.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('case_milestones')
        .insert(caseMilestones)
        .select(`
          *,
          milestone:service_milestones(*)
        `);

      if (error) {
        console.error('Error creating case milestones:', error);
        throw new Error('Error al crear los hitos del caso');
      }

      return data || [];
    } catch (error) {
      console.error('Error in createCaseMilestonesFromService:', error);
      throw error;
    }
  },

  // Marcar hito como completado
  async completeMilestone(milestoneId: string, notes?: string): Promise<CaseMilestone> {
    const { data, error } = await supabase
      .from('case_milestones')
      .update({
        isCompleted: true,
        completedAt: new Date().toISOString(),
        notes: notes || 'Hito completado',
        updatedAt: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .select(`
        *,
        milestone:service_milestones(*)
      `)
      .single();

    if (error) {
      console.error('Error completing milestone:', error);
      throw new Error('Error al completar el hito');
    }

    return data;
  },

  // Marcar pago como cobrado
  async markPaymentAsCollected(milestoneId: string, paymentAmount?: number): Promise<CaseMilestone> {
    const updateData: any = {
      isPaymentCollected: true,
      paymentCollectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (paymentAmount !== undefined) {
      updateData.paymentAmount = paymentAmount;
    }

    const { data, error } = await supabase
      .from('case_milestones')
      .update(updateData)
      .eq('id', milestoneId)
      .select(`
        *,
        milestone:service_milestones(*)
      `)
      .single();

    if (error) {
      console.error('Error marking payment as collected:', error);
      throw new Error('Error al marcar el pago como cobrado');
    }

    return data;
  },

  // Actualizar hito
  async updateMilestone(milestoneId: string, updates: Partial<CaseMilestone>): Promise<CaseMilestone> {
    const { data, error } = await supabase
      .from('case_milestones')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .select(`
        *,
        milestone:service_milestones(*)
      `)
      .single();

    if (error) {
      console.error('Error updating milestone:', error);
      throw new Error('Error al actualizar el hito');
    }

    return data;
  },

  // Obtener hitos que requieren cobro
  async getMilestonesRequiringPayment(caseId: string): Promise<CaseMilestone[]> {
    const { data, error } = await supabase
      .from('case_milestones')
      .select(`
        *,
        milestone:service_milestones(*)
      `)
      .eq('caseId', caseId)
      .eq('isCompleted', true)
      .eq('isPaymentCollected', false)
      .gt('paymentAmount', 0)
      .order('completedAt', { ascending: true });

    if (error) {
      console.error('Error fetching milestones requiring payment:', error);
      throw new Error('Error al obtener hitos que requieren cobro');
    }

    return data || [];
  },

  // Obtener estadísticas de pagos de un caso
  async getCasePaymentStats(caseId: string): Promise<{
    totalMilestones: number;
    completedMilestones: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    pendingPayments: number;
  }> {
    const milestones = await this.getCaseMilestones(caseId);
    
    const stats = {
      totalMilestones: milestones.length,
      completedMilestones: milestones.filter(m => m.isCompleted).length,
      totalAmount: milestones.reduce((sum, m) => sum + (m.paymentAmount || 0), 0),
      paidAmount: milestones.filter(m => m.isPaymentCollected).reduce((sum, m) => sum + (m.paymentAmount || 0), 0),
      remainingAmount: 0,
      pendingPayments: milestones.filter(m => m.isCompleted && !m.isPaymentCollected && (m.paymentAmount || 0) > 0).length
    };

    stats.remainingAmount = stats.totalAmount - stats.paidAmount;

    return stats;
  },

  // Notificar hitos completados que requieren cobro
  async getPaymentNotifications(): Promise<{
    caseId: string;
    caseNumber: string;
    clientName: string;
    milestoneName: string;
    paymentAmount: number;
    completedAt: string;
  }[]> {
    const { data, error } = await supabase
      .from('case_milestones')
      .select(`
        *,
        milestone:service_milestones(*),
        case:cases(
          caseNumber,
          client:clients(firstName, lastName)
        )
      `)
      .eq('isCompleted', true)
      .eq('isPaymentCollected', false)
      .gt('paymentAmount', 0)
      .order('completedAt', { ascending: false });

    if (error) {
      console.error('Error fetching payment notifications:', error);
      throw new Error('Error al obtener notificaciones de pago');
    }

    return (data || []).map(item => ({
      caseId: item.caseId,
      caseNumber: item.case?.caseNumber || '',
      clientName: `${item.case?.client?.firstName || ''} ${item.case?.client?.lastName || ''}`,
      milestoneName: item.milestone?.name || '',
      paymentAmount: item.paymentAmount || 0,
      completedAt: item.completedAt || ''
    }));
  }
};
