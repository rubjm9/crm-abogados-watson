import { supabase } from './supabase';
import { Case, CreateCaseForm, UpdateCaseForm } from '../types';

export const caseService = {
  // Obtener todos los casos
  async getAllCases(): Promise<Case[]> {
    const { data, error } = await supabase
      .from('client_services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cases:', error);
      throw new Error('Error al obtener los casos');
    }

    // Obtener datos relacionados
    const clientIds = [...new Set(data.map(cs => cs.client_id))];
    const serviceIds = [...new Set(data.map(cs => cs.service_id))];
    const lawyerIds = [...new Set(data.map(cs => cs.assigned_lawyer_id).filter(Boolean))];

    const [clients, services, lawyers] = await Promise.all([
      clientIds.length > 0 ? supabase.from('clients').select('*').in('id', clientIds) : { data: [] },
      serviceIds.length > 0 ? supabase.from('services').select('*').in('id', serviceIds) : { data: [] },
      lawyerIds.length > 0 ? supabase.from('users').select('*').in('id', lawyerIds) : { data: [] }
    ]);

    // Crear mapas para acceso rápido
    const clientMap = new Map((clients.data || []).map(c => [c.id, c]));
    const serviceMap = new Map((services.data || []).map(s => [s.id, s]));
    const lawyerMap = new Map((lawyers.data || []).map(l => [l.id, l]));

    // Mapear client_services a Case
    const cases = (data || []).map(clientService => {
      const client = clientMap.get(clientService.client_id);
      const service = serviceMap.get(clientService.service_id);
      const lawyer = clientService.assigned_lawyer_id ? lawyerMap.get(clientService.assigned_lawyer_id) : null;

      return {
        id: clientService.id,
        caseNumber: `CS-${clientService.id.slice(0, 8)}`,
        title: `${client?.firstName || ''} ${client?.lastName || ''} - ${service?.name || ''}`,
        description: service?.description || '',
        clientId: clientService.client_id,
        serviceId: clientService.service_id,
        assignedLawyerId: clientService.assigned_lawyer_id,
        status: clientService.status === 'Abierto' ? 'abierto' as const : 
                clientService.status === 'En Progreso' ? 'en_proceso' as const : 
                clientService.status === 'Completado' ? 'cerrado' as const : 'cancelado' as const,
        priority: 'media' as const,
        totalPrice: clientService.custom_price || 0,
        pricePaid: 0,
        priceRemaining: clientService.custom_price || 0,
        estimatedDuration: undefined,
        startDate: clientService.start_date,
        endDate: clientService.end_date,
        notes: clientService.notes,
        createdAt: clientService.created_at,
        updatedAt: clientService.updated_at,
        client,
        service,
        assignedLawyer: lawyer
      };
    });

    return cases;
  },

  // Obtener casos por cliente
  async getCasesByClient(clientId: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        client:clients(*),
        service:services(*),
        assignedLawyer:users(*),
        activities:activities(*)
      `)
      .eq('clientId', clientId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching client cases:', error);
      throw new Error('Error al obtener los casos del cliente');
    }

    return data || [];
  },

  // Obtener casos por abogado asignado
  async getCasesByLawyer(lawyerId: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        client:clients(*),
        service:services(*),
        assignedLawyer:users(*),
        activities:activities(*)
      `)
      .eq('assignedLawyerId', lawyerId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching lawyer cases:', error);
      throw new Error('Error al obtener los casos del abogado');
    }

    return data || [];
  },

  // Obtener un caso específico
  async getCaseById(id: string): Promise<Case | null> {
    const { data, error } = await supabase
      .from('client_services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching case:', error);
      throw new Error('Error al obtener el caso');
    }

    if (!data) return null;

    // Obtener datos relacionados
    const [client, service, lawyer] = await Promise.all([
      data.client_id ? supabase.from('clients').select('*').eq('id', data.client_id).single() : { data: null },
      data.service_id ? supabase.from('services').select('*').eq('id', data.service_id).single() : { data: null },
      data.assigned_lawyer_id ? supabase.from('users').select('*').eq('id', data.assigned_lawyer_id).single() : { data: null }
    ]);

    // Obtener hitos del caso
    let milestones = [];
    try {
      const { caseMilestoneService } = await import('./caseMilestoneService');
      milestones = await caseMilestoneService.getCaseMilestones(id);
    } catch (err) {
      console.warn('Error loading milestones:', err);
    }

    return {
      id: data.id,
      caseNumber: `CS-${data.id.slice(0, 8)}`,
      title: `${client.data?.firstName || ''} ${client.data?.lastName || ''} - ${service.data?.name || ''}`,
      description: service.data?.description || '',
      clientId: data.client_id,
      serviceId: data.service_id,
      assignedLawyerId: data.assigned_lawyer_id,
      status: data.status === 'Abierto' ? 'abierto' as const : 
              data.status === 'En Progreso' ? 'en_proceso' as const : 
              data.status === 'Completado' ? 'cerrado' as const : 'cancelado' as const,
      priority: 'media' as const,
      totalPrice: data.custom_price || 0,
      pricePaid: 0,
      priceRemaining: data.custom_price || 0,
      estimatedDuration: undefined,
      startDate: data.start_date,
      endDate: data.end_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      client: client.data,
      service: service.data,
      assignedLawyer: lawyer.data,
      milestones
    };
  },

  // Crear un nuevo caso
  async createCase(caseData: CreateCaseForm): Promise<Case> {
    try {
      // Validar campos requeridos
      if (!caseData.clientId || caseData.clientId.trim() === '') {
        throw new Error('El cliente es requerido');
      }
      if (!caseData.serviceId || caseData.serviceId.trim() === '') {
        throw new Error('El servicio es requerido');
      }
      if (!caseData.startDate || caseData.startDate.trim() === '') {
        throw new Error('La fecha de inicio es requerida');
      }

      // Calcular precios
      const initialPayment = caseData.initialPayment || 0;
      const priceRemaining = caseData.totalPrice - initialPayment;

      // Mapear campos de Case a client_services
      const clientServiceData = {
        client_id: caseData.clientId,
        service_id: caseData.serviceId,
        assigned_lawyer_id: caseData.assignedLawyerId || null,
        custom_price: caseData.totalPrice,
        status: 'Abierto',
        start_date: caseData.startDate,
        notes: caseData.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('client_services')
        .insert([clientServiceData])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating case:', error);
        throw new Error('Error al crear el caso');
      }

      // Crear hitos del caso basados en el servicio
      if (data.service_id) {
        const { caseMilestoneService } = await import('./caseMilestoneService');
        await caseMilestoneService.createCaseMilestonesFromService(
          data.id, 
          data.service_id, 
          data.custom_price
        );
      }

      return data;
    } catch (error) {
      console.error('Error in createCase:', error);
      throw error;
    }
  },

  // Actualizar un caso
  async updateCase(id: string, updates: UpdateCaseForm): Promise<Case> {
    // Mapear estados de Case a client_services
    const mappedStatus = updates.status === 'abierto' ? 'Abierto' : 
                        updates.status === 'en_proceso' ? 'En Progreso' : 
                        updates.status === 'cerrado' ? 'Completado' : 'Cancelado';

    const clientServiceData = {
      client_id: updates.clientId,
      service_id: updates.serviceId,
      assigned_lawyer_id: updates.assignedLawyerId || null,
      custom_price: updates.totalPrice,
      status: mappedStatus,
      start_date: updates.startDate,
      end_date: updates.endDate || null,
      notes: updates.notes || '',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('client_services')
      .update(clientServiceData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating case:', error);
      throw new Error('Error al actualizar el caso');
    }

    // Obtener datos relacionados para devolver un Case completo
    const [client, service, lawyer] = await Promise.all([
      data.client_id ? supabase.from('clients').select('*').eq('id', data.client_id).single() : { data: null },
      data.service_id ? supabase.from('services').select('*').eq('id', data.service_id).single() : { data: null },
      data.assigned_lawyer_id ? supabase.from('users').select('*').eq('id', data.assigned_lawyer_id).single() : { data: null }
    ]);

    return {
      id: data.id,
      caseNumber: `CS-${data.id.slice(0, 8)}`,
      title: `${client.data?.firstName || ''} ${client.data?.lastName || ''} - ${service.data?.name || ''}`,
      description: service.data?.description || '',
      clientId: data.client_id,
      serviceId: data.service_id,
      assignedLawyerId: data.assigned_lawyer_id,
      status: updates.status,
      priority: 'media' as const,
      totalPrice: data.custom_price || 0,
      pricePaid: 0,
      priceRemaining: data.custom_price || 0,
      estimatedDuration: undefined,
      startDate: data.start_date,
      endDate: data.end_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      client: client.data,
      service: service.data,
      assignedLawyer: lawyer.data
    };
  },

  // Cambiar estado del caso
  async updateCaseStatus(id: string, status: Case['status']): Promise<Case> {
    // Mapear estados de Case a client_services
    const mappedStatus = status === 'abierto' ? 'Abierto' : 
                        status === 'en_proceso' ? 'En Progreso' : 
                        status === 'cerrado' ? 'Completado' : 'Cancelado';

    const { data, error } = await supabase
      .from('client_services')
      .update({
        status: mappedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating case status:', error);
      throw new Error('Error al actualizar el estado del caso');
    }

    // Obtener datos relacionados para devolver un Case completo
    const [client, service, lawyer] = await Promise.all([
      data.client_id ? supabase.from('clients').select('*').eq('id', data.client_id).single() : { data: null },
      data.service_id ? supabase.from('services').select('*').eq('id', data.service_id).single() : { data: null },
      data.assigned_lawyer_id ? supabase.from('users').select('*').eq('id', data.assigned_lawyer_id).single() : { data: null }
    ]);

    return {
      id: data.id,
      caseNumber: `CS-${data.id.slice(0, 8)}`,
      title: `${client.data?.firstName || ''} ${client.data?.lastName || ''} - ${service.data?.name || ''}`,
      description: service.data?.description || '',
      clientId: data.client_id,
      serviceId: data.service_id,
      assignedLawyerId: data.assigned_lawyer_id,
      status: status,
      priority: 'media' as const,
      totalPrice: data.custom_price || 0,
      pricePaid: 0,
      priceRemaining: data.custom_price || 0,
      estimatedDuration: undefined,
      startDate: data.start_date,
      endDate: data.end_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      client: client.data,
      service: service.data,
      assignedLawyer: lawyer.data
    };
  },

  // Asignar abogado al caso
  async assignLawyer(caseId: string, lawyerId: string): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .update({
        assignedLawyerId: lawyerId,
        updatedAt: new Date().toISOString()
      })
      .eq('id', caseId)
      .select(`
        *,
        client:clients(*),
        service:services(*),
        assignedLawyer:users(*)
      `)
      .single();

    if (error) {
      console.error('Error assigning lawyer:', error);
      throw new Error('Error al asignar el abogado');
    }

    return data;
  },

  // Eliminar un caso
  async deleteCase(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting case:', error);
      throw new Error('Error al eliminar el caso');
    }
  },

  // Obtener estadísticas de casos
  async getCaseStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    closed: number;
    urgent: number;
  }> {
    const { data, error } = await supabase
      .from('cases')
      .select('status, priority');

    if (error) {
      console.error('Error fetching case stats:', error);
      throw new Error('Error al obtener estadísticas de casos');
    }

    const stats = {
      total: data?.length || 0,
      open: data?.filter(c => c.status === 'abierto').length || 0,
      inProgress: data?.filter(c => c.status === 'en_proceso').length || 0,
      closed: data?.filter(c => c.status === 'cerrado').length || 0,
      urgent: data?.filter(c => c.priority === 'urgente').length || 0
    };

    return stats;
  },

  // Buscar casos
  async searchCases(query: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        client:clients(*),
        service:services(*),
        assignedLawyer:users(*)
      `)
      .or(`caseNumber.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error searching cases:', error);
      throw new Error('Error al buscar casos');
    }

    return data || [];
  }
};
