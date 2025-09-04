import { supabase } from './supabase';
import { ClientService, CreateClientServiceForm } from '../types';

export const clientServiceService = {
  // Obtener todos los servicios de clientes
  async getAllClientServices(): Promise<ClientService[]> {
    try {
      const { data, error } = await supabase
        .from('client_services')
        .select(`
          *,
          service:services(*),
          client:clients(*),
          assigned_lawyer:users(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((cs: any) => ({
        id: cs.id,
        clientId: cs.client_id,
        serviceId: cs.service_id,
        assignedLawyerId: cs.assigned_lawyer_id,
        customPrice: cs.custom_price,
        personCount: cs.person_count,
        initialPayment: cs.initial_payment,
        amountOwed: cs.amount_owed,
        status: cs.status,
        startDate: cs.start_date,
        endDate: cs.end_date,
        notes: cs.notes,
        createdAt: cs.created_at,
        updatedAt: cs.updated_at,
        service: cs.service ? {
          id: cs.service.id,
          name: cs.service.name,
          description: cs.service.description,
          category: cs.service.category,
          basePrice: cs.service.base_price,
          estimatedCost: cs.service.estimated_cost,
          complexity: cs.service.complexity,
          requiredDocuments: cs.service.required_documents || [],
          notes: cs.service.notes,
          isActive: cs.service.is_active,
          createdAt: cs.service.created_at,
          updatedAt: cs.service.updated_at,
        } : undefined,
        client: cs.client ? {
          id: cs.client.id,
          firstName: cs.client.first_name,
          lastName: cs.client.last_name,
          email: cs.client.email,
          phone: cs.client.phone || '',
          nationality: cs.client.nationality,
          status: cs.client.status,
          expedientNumber: cs.client.expedient_number,
          birthDate: cs.client.birth_date,
          preferredLanguage: cs.client.preferred_language || 'Español',
          countryOfOrigin: cs.client.country_of_origin,
          cityOfResidence: cs.client.city_of_residence || '',
          createdAt: cs.client.created_at,
          updatedAt: cs.client.updated_at,
          notes: cs.client.notes || '',
          address: cs.client.address || '',
          passportNumber: cs.client.passport_number || ''
        } : undefined,
        assignedLawyer: cs.assigned_lawyer ? {
          id: cs.assigned_lawyer.id,
          email: cs.assigned_lawyer.email,
          firstName: cs.assigned_lawyer.first_name,
          lastName: cs.assigned_lawyer.last_name,
          role: cs.assigned_lawyer.role,
          avatarUrl: cs.assigned_lawyer.avatar_url || undefined,
          isActive: Boolean(cs.assigned_lawyer.is_active),
          billingType: cs.assigned_lawyer.billing_type || 'salario',
          commissionPercentage: cs.assigned_lawyer.commission_percentage || undefined,
          hourlyRate: cs.assigned_lawyer.hourly_rate || undefined,
          monthlySalary: cs.assigned_lawyer.monthly_salary || undefined,
          createdAt: cs.assigned_lawyer.created_at,
          updatedAt: cs.assigned_lawyer.updated_at,
        } : undefined,
      } as ClientService));
    } catch (error) {
      console.error('Error al obtener servicios de clientes:', error);
      throw error;
    }
  },

  // Obtener servicios de un cliente específico
  async getClientServices(clientId: string): Promise<ClientService[]> {
    try {
      const { data, error } = await supabase
        .from('client_services')
        .select(`
          *,
          service:services(*),
          assigned_lawyer:users(*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((cs: any) => ({
        id: cs.id,
        clientId: cs.client_id,
        serviceId: cs.service_id,
        assignedLawyerId: cs.assigned_lawyer_id,
        customPrice: cs.custom_price,
        personCount: cs.person_count,
        initialPayment: cs.initial_payment,
        amountOwed: cs.amount_owed,
        status: cs.status,
        startDate: cs.start_date,
        endDate: cs.end_date,
        notes: cs.notes,
        createdAt: cs.created_at,
        updatedAt: cs.updated_at,
        service: cs.service ? {
          id: cs.service.id,
          name: cs.service.name,
          description: cs.service.description,
          category: cs.service.category,
          basePrice: cs.service.base_price,
          estimatedCost: cs.service.estimated_cost,
          complexity: cs.service.complexity,
          requiredDocuments: cs.service.required_documents || [],
          notes: cs.service.notes,
          isActive: cs.service.is_active,
          createdAt: cs.service.created_at,
          updatedAt: cs.service.updated_at,
        } : undefined,
        assignedLawyer: cs.assigned_lawyer ? {
          id: cs.assigned_lawyer.id,
          email: cs.assigned_lawyer.email,
          firstName: cs.assigned_lawyer.first_name,
          lastName: cs.assigned_lawyer.last_name,
          role: cs.assigned_lawyer.role,
          avatarUrl: cs.assigned_lawyer.avatar_url || undefined,
          isActive: Boolean(cs.assigned_lawyer.is_active),
          billingType: cs.assigned_lawyer.billing_type || 'salario',
          commissionPercentage: cs.assigned_lawyer.commission_percentage || undefined,
          hourlyRate: cs.assigned_lawyer.hourly_rate || undefined,
          monthlySalary: cs.assigned_lawyer.monthly_salary || undefined,
          createdAt: cs.assigned_lawyer.created_at,
          updatedAt: cs.assigned_lawyer.updated_at,
        } : undefined,
      } as ClientService));
    } catch (error) {
      console.error('Error al obtener servicios del cliente:', error);
      throw error;
    }
  },

  // Crear un nuevo servicio para un cliente
  async createClientService(serviceData: CreateClientServiceForm): Promise<ClientService> {
    try {
      const { data, error } = await supabase
        .from('client_services')
        .insert({
          client_id: serviceData.clientId,
          service_id: serviceData.serviceId,
          assigned_lawyer_id: serviceData.assignedLawyerId || null,
          custom_price: serviceData.customPrice,
          person_count: serviceData.personCount,
          initial_payment: serviceData.initialPayment,
          amount_owed: serviceData.customPrice - serviceData.initialPayment,
          status: 'Abierto',
          start_date: new Date().toISOString(),
          notes: serviceData.notes || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating client service:', error);
        throw error;
      }

      // Actualizar el estado del cliente a "active" cuando se le asigna un servicio
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update({ status: 'active' })
        .eq('id', serviceData.clientId);

      if (clientUpdateError) {
        console.error('Error updating client status:', clientUpdateError);
      }

      return {
        id: data.id,
        clientId: data.client_id,
        serviceId: data.service_id,
        assignedLawyerId: data.assigned_lawyer_id,
        customPrice: data.custom_price,
        personCount: data.person_count,
        initialPayment: data.initial_payment,
        amountOwed: data.amount_owed,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error al crear servicio para cliente:', error);
      throw error;
    }
  },

  // Actualizar un servicio de cliente
  async updateClientService(id: string, updates: Partial<ClientService>): Promise<ClientService> {
    try {
      const updateData: any = {};
      
      if (updates.customPrice !== undefined) updateData.custom_price = updates.customPrice;
      if (updates.personCount !== undefined) updateData.person_count = updates.personCount;
      if (updates.initialPayment !== undefined) updateData.initial_payment = updates.initialPayment;
      if (updates.amountOwed !== undefined) updateData.amount_owed = updates.amountOwed;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.assignedLawyerId !== undefined) updateData.assigned_lawyer_id = updates.assignedLawyerId;
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('client_services')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        clientId: data.client_id,
        serviceId: data.service_id,
        assignedLawyerId: data.assigned_lawyer_id,
        customPrice: data.custom_price,
        personCount: data.person_count,
        initialPayment: data.initial_payment,
        amountOwed: data.amount_owed,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error al actualizar servicio de cliente:', error);
      throw error;
    }
  },

  // Registrar un pago para un servicio de cliente
  async recordPayment(clientServiceId: string, amount: number, notes?: string): Promise<void> {
    try {
      // Obtener el servicio actual
      const { data: currentService, error: fetchError } = await supabase
        .from('client_services')
        .select('amount_owed, initial_payment')
        .eq('id', clientServiceId)
        .single();

      if (fetchError) throw fetchError;

      const newAmountOwed = Math.max(0, currentService.amount_owed - amount);

      // Actualizar el amount_owed
      const { error: updateError } = await supabase
        .from('client_services')
        .update({ amount_owed: newAmountOwed })
        .eq('id', clientServiceId);

      if (updateError) throw updateError;

      // Aquí podrías también crear un registro de pago en una tabla separada
      // para mantener un historial de pagos
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  },

  // Eliminar un servicio de cliente
  async deleteClientService(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('client_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error al eliminar servicio de cliente:', error);
      throw error;
    }
  }
};
