import { supabase } from './supabase';
import { ClientService, CreateClientServiceForm } from '../types';

export const clientServiceService = {
  // Obtener todos los servicios de un cliente
  async getClientServices(clientId: string): Promise<ClientService[]> {
    const { data, error } = await supabase
      .from('client_services')
      .select(`
        *,
        service:services(*),
        client:clients(*),
        assignedLawyer:users(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client services:', error);
      throw error;
    }

    // Mapear snake_case a camelCase
    const mappedData = (data || []).map(item => ({
      id: item.id,
      clientId: item.client_id,
      serviceId: item.service_id,
      assignedLawyerId: item.assigned_lawyer_id,
      customPrice: item.custom_price,
      personCount: item.person_count,
      initialPayment: item.initial_payment,
      amountOwed: item.amount_owed,
      status: item.status,
      startDate: item.start_date,
      endDate: item.end_date,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      service: item.service,
      client: item.client,
      assignedLawyer: item.assignedLawyer
    }));

    return mappedData;
  },

  // Obtener un servicio específico de un cliente
  async getClientServiceById(id: string): Promise<ClientService> {
    const { data, error } = await supabase
      .from('client_services')
      .select(`
        *,
        service:services(*),
        client:clients(*),
        assignedLawyer:users(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching client service:', error);
      throw error;
    }

    // Mapear snake_case a camelCase
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
      service: data.service,
      client: data.client,
      assignedLawyer: data.assignedLawyer
    };
  },

  // Crear un nuevo servicio para un cliente
  async createClientService(serviceData: CreateClientServiceForm): Promise<ClientService> {
    // Calcular el monto adeudado basado en los pagos
    const amountOwed = serviceData.customPrice - serviceData.initialPayment;

    const dbServiceData = {
      client_id: serviceData.clientId,
      service_id: serviceData.serviceId,
      assigned_lawyer_id: serviceData.assignedLawyerId,
      custom_price: serviceData.customPrice,
      person_count: serviceData.personCount,
      initial_payment: serviceData.initialPayment,
      amount_owed: amountOwed,
      status: 'Abierto',
      start_date: new Date().toISOString().split('T')[0],
      notes: serviceData.notes
    };

    const { data, error } = await supabase
      .from('client_services')
      .insert(dbServiceData)
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

    return data;
  },

  // Actualizar un servicio de cliente
  async updateClientService(id: string, updates: Partial<ClientService>): Promise<ClientService> {
    const { data, error } = await supabase
      .from('client_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client service:', error);
      throw error;
    }

    return data;
  },

  // Cambiar el estado de un servicio
  async updateServiceStatus(id: string, status: ClientService['status']): Promise<void> {
    const { error } = await supabase
      .from('client_services')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating service status:', error);
      throw error;
    }
  },

  // Registrar un pago
  async recordPayment(id: string, paymentAmount: number): Promise<void> {
    const { data: currentService, error: fetchError } = await supabase
      .from('client_services')
      .select('amount_owed')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current service:', fetchError);
      throw fetchError;
    }

    const newAmountOwed = Math.max(0, (currentService.amount_owed || 0) - paymentAmount);

    const { error: updateError } = await supabase
      .from('client_services')
      .update({ 
        amount_owed: newAmountOwed,
        status: newAmountOwed === 0 ? 'Completado' : 'Activo'
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      throw updateError;
    }
  }
};
