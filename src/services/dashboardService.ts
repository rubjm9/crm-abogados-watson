import { supabase } from './supabase';

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  potentialClients: number;
  totalServices: number;
  activeServices: number;
  completedServices: number;
  totalRevenue: number;
  pendingPayments: number;
  recentActivity: Array<{
    id: string;
    type: 'client_created' | 'service_assigned' | 'milestone_completed' | 'payment_received';
    description: string;
    date: string;
    clientName?: string;
    amount?: number;
  }>;
  servicesByCategory: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  clientStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
}

export const dashboardService = {
  // Obtener todas las estadísticas del dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Obtener estadísticas de clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, status, created_at');

      if (clientsError) {
        console.error('Error al obtener clientes:', clientsError);
        // Retornar datos mock si hay error
        return this.getMockDashboardStats();
      }

      // Intentar obtener estadísticas de servicios (puede fallar si la tabla no existe)
      let clientServices: any[] = [];
      try {
        const { data: servicesData, error: servicesError } = await supabase
          .from('client_services')
          .select('id, status, custom_price, created_at');

        if (!servicesError && servicesData) {
          clientServices = servicesData;
        }
      } catch (error) {
        console.warn('Tabla client_services no disponible:', error);
      }

      // Intentar obtener hitos (puede fallar si la tabla no existe)
      let recentMilestones: any[] = [];
      try {
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('client_milestones')
          .select(`
            id,
            is_completed,
            completed_at,
            client_service:client_services(
              client:clients(first_name, last_name)
            )
          `)
          .eq('is_completed', true)
          .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('completed_at', { ascending: false })
          .limit(10);

        if (!milestonesError && milestonesData) {
          recentMilestones = milestonesData;
        }
      } catch (error) {
        console.warn('Tabla client_milestones no disponible:', error);
      }

      // Calcular estadísticas
      const totalClients = clients?.length || 0;
      const activeClients = clients?.filter(c => c.status === 'active').length || 0;
      const potentialClients = clients?.filter(c => c.status === 'potential').length || 0;

      const totalServices = clientServices?.length || 0;
      const activeServices = clientServices?.filter(s => s.status === 'Abierto').length || 0;
      const completedServices = clientServices?.filter(s => s.status === 'Cerrado').length || 0;

      const totalRevenue = clientServices?.reduce((sum, s) => sum + (s.custom_price || 0), 0) || 0;
      const pendingPayments = clientServices?.reduce((sum, s) => {
        if (s.status === 'Abierto') {
          return sum + (s.custom_price || 0);
        }
        return sum;
      }, 0) || 0;

      // Generar actividad reciente
      const recentActivity = [
        // Clientes creados recientemente
        ...(clients?.filter(c => 
          new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).map(c => ({
          id: c.id,
          type: 'client_created' as const,
          description: 'Nuevo cliente registrado',
          date: c.created_at,
          clientName: `Cliente ${c.id.slice(0, 8)}`
        })) || []),
        
        // Hitos completados recientemente
        ...(recentMilestones?.map(m => ({
          id: m.id,
          type: 'milestone_completed' as const,
          description: 'Hito completado',
          date: m.completed_at,
          clientName: m.client_service?.client ? 
            `${m.client_service.client.first_name} ${m.client_service.client.last_name}` : 
            'Cliente'
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      // Servicios por categoría (mock por ahora)
      const servicesByCategory = [
        { category: 'Extranjería', count: Math.floor(totalServices * 0.6), revenue: Math.floor(totalRevenue * 0.6) },
        { category: 'Civil', count: Math.floor(totalServices * 0.2), revenue: Math.floor(totalRevenue * 0.2) },
        { category: 'Laboral', count: Math.floor(totalServices * 0.15), revenue: Math.floor(totalRevenue * 0.15) },
        { category: 'Otros', count: Math.floor(totalServices * 0.05), revenue: Math.floor(totalRevenue * 0.05) }
      ].filter(item => item.count > 0);

      // Distribución de estados de clientes
      const clientStatusDistribution = clients?.reduce((acc, client) => {
        const existing = acc.find(item => item.status === client.status);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({
            status: client.status,
            count: 1
          });
        }
        return acc;
      }, [] as Array<{ status: string; count: number }>) || [];

      // Ingresos mensuales (últimos 6 meses)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        
        const monthRevenue = clientServices?.filter(s => 
          s.created_at?.startsWith(monthKey)
        ).reduce((sum, s) => sum + (s.custom_price || 0), 0) || 0;

        monthlyRevenue.push({
          month: date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' }),
          revenue: monthRevenue
        });
      }

      return {
        totalClients,
        activeClients,
        potentialClients,
        totalServices,
        activeServices,
        completedServices,
        totalRevenue,
        pendingPayments,
        recentActivity,
        servicesByCategory,
        monthlyRevenue,
        clientStatusDistribution
      };

    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      // Retornar datos mock en caso de error
      return this.getMockDashboardStats();
    }
  },

  // Datos mock para cuando las tablas no existen
  getMockDashboardStats(): DashboardStats {
    const now = new Date();
    const mockClients = [
      { id: '1', status: 'active', created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '2', status: 'potential', created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '3', status: 'active', created_at: now.toISOString() }
    ];

    return {
      totalClients: 3,
      activeClients: 2,
      potentialClients: 1,
      totalServices: 5,
      activeServices: 3,
      completedServices: 2,
      totalRevenue: 15000,
      pendingPayments: 8000,
      recentActivity: mockClients.map(c => ({
        id: c.id,
        type: 'client_created' as const,
        description: 'Nuevo cliente registrado',
        date: c.created_at,
        clientName: `Cliente ${c.id}`
      })),
      servicesByCategory: [
        { category: 'Extranjería', count: 3, revenue: 9000 },
        { category: 'Civil', count: 1, revenue: 3000 },
        { category: 'Laboral', count: 1, revenue: 3000 }
      ],
      monthlyRevenue: [
        { month: 'Ene 2024', revenue: 2000 },
        { month: 'Feb 2024', revenue: 3000 },
        { month: 'Mar 2024', revenue: 2500 },
        { month: 'Abr 2024', revenue: 4000 },
        { month: 'May 2024', revenue: 3500 },
        { month: 'Jun 2024', revenue: 5000 }
      ],
      clientStatusDistribution: [
        { status: 'active', count: 2 },
        { status: 'potential', count: 1 }
      ]
    };
  },

  // Obtener estadísticas de hitos
  async getMilestoneStats() {
    try {
      const { data, error } = await supabase
        .from('client_milestones')
        .select('is_completed, payment_amount');

      if (error) throw error;

      const total = data?.length || 0;
      const completed = data?.filter(m => m.isCompleted).length || 0;
      const pendingPayments = data?.filter(m => !m.isCompleted && m.paymentAmount).length || 0;
      const totalPaymentAmount = data?.reduce((sum, m) => sum + (m.paymentAmount || 0), 0) || 0;

      return {
        total,
        completed,
        pending: total - completed,
        pendingPayments,
        totalPaymentAmount,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de hitos:', error);
      // Retornar datos mock
      return {
        total: 10,
        completed: 6,
        pending: 4,
        pendingPayments: 3,
        totalPaymentAmount: 5000,
        completionRate: 60
      };
    }
  },

  // Obtener actividad reciente detallada
  async getRecentActivity(limit: number = 20) {
    try {
      // Combinar diferentes tipos de actividad
      const activities = [];

      // Clientes creados recientemente
      const { data: recentClients } = await supabase
        .from('clients')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (recentClients) {
        activities.push(...recentClients.map(c => ({
          id: c.id,
          type: 'client_created',
          description: 'Nuevo cliente registrado',
          date: c.created_at,
          clientName: `${c.first_name} ${c.last_name}`,
          icon: 'user-plus'
        })));
      }

      // Servicios asignados recientemente (si la tabla existe)
      try {
        const { data: recentServices } = await supabase
          .from('client_services')
          .select(`
            id, 
            created_at,
            client:clients(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (recentServices) {
          activities.push(...recentServices.map(s => ({
            id: s.id,
            type: 'service_assigned',
            description: 'Servicio asignado',
            date: s.created_at,
            clientName: s.client ? `${s.client.first_name} ${s.client.last_name}` : 'Cliente',
            icon: 'briefcase'
          })));
        }
      } catch (error) {
        console.warn('No se pudieron cargar servicios:', error);
      }

      // Hitos completados recientemente (si la tabla existe)
      try {
        const { data: recentMilestones } = await supabase
          .from('client_milestones')
          .select(`
            id,
            completed_at,
            client_service:client_services(
              client:clients(first_name, last_name)
            )
          `)
          .eq('is_completed', true)
          .order('completed_at', { ascending: false })
          .limit(limit);

        if (recentMilestones) {
          activities.push(...recentMilestones.map(m => ({
            id: m.id,
            type: 'milestone_completed',
            description: 'Hito completado',
            date: m.completed_at,
            clientName: m.client_service?.client ? 
              `${m.client_service.client.first_name} ${m.client_service.client.last_name}` : 
              'Cliente',
            icon: 'check-circle'
          })));
        }
      } catch (error) {
        console.warn('No se pudieron cargar hitos:', error);
      }

      // Ordenar por fecha y limitar
      return activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      // Retornar actividad mock
      return [
        {
          id: '1',
          type: 'client_created',
          description: 'Nuevo cliente registrado',
          date: new Date().toISOString(),
          clientName: 'Cliente Demo',
          icon: 'user-plus'
        }
      ];
    }
  }
};
