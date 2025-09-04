import { supabase } from './supabase';

export interface Notification {
  id: string;
  userId: string;
  type: 'payment_due' | 'milestone_due' | 'client_created' | 'service_assigned' | 'milestone_completed' | 'document_required' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string; // ID del cliente, servicio, etc.
  relatedType?: 'client' | 'service' | 'milestone' | 'document';
  createdAt: string;
  readAt?: string;
}

export interface CreateNotificationForm {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  relatedId?: string;
  relatedType?: 'client' | 'service' | 'milestone' | 'document';
}

export const notificationService = {
  // Obtener notificaciones de un usuario
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        priority: n.priority,
        relatedId: n.related_id,
        relatedType: n.related_type,
        createdAt: n.created_at,
        readAt: n.read_at,
      }));
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  },

  // Obtener notificaciones no leídas
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        priority: n.priority,
        relatedId: n.related_id,
        relatedType: n.related_type,
        createdAt: n.created_at,
        readAt: n.read_at,
      }));
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
      throw error;
    }
  },

  // Crear una nueva notificación
  async createNotification(notificationData: CreateNotificationForm): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          priority: notificationData.priority || 'medium',
          related_id: notificationData.relatedId,
          related_type: notificationData.relatedType,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: data.is_read,
        priority: data.priority,
        relatedId: data.related_id,
        relatedType: data.related_type,
        createdAt: data.created_at,
        readAt: data.read_at,
      };
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  },

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  },

  // Eliminar notificación
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  },

  // Obtener estadísticas de notificaciones
  async getNotificationStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('is_read, priority, type')
        .eq('user_id', userId);

      if (error) throw error;

      const total = data?.length || 0;
      const unread = data?.filter(n => !n.is_read).length || 0;
      const highPriority = data?.filter(n => n.priority === 'high' && !n.is_read).length || 0;
      const mediumPriority = data?.filter(n => n.priority === 'medium' && !n.is_read).length || 0;
      const lowPriority = data?.filter(n => n.priority === 'low' && !n.is_read).length || 0;

      return {
        total,
        unread,
        highPriority,
        mediumPriority,
        lowPriority
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de notificaciones:', error);
      throw error;
    }
  },

  // Generar notificaciones automáticas
  async generateAutomaticNotifications() {
    try {
      // Obtener pagos pendientes próximos a vencer
      const { data: pendingPayments } = await supabase
        .from('client_services')
        .select(`
          id,
          custom_price,
          initial_payment,
          client:clients(first_name, last_name, id),
          assigned_lawyer:users(id)
        `)
        .eq('status', 'Abierto');

      if (pendingPayments) {
        for (const payment of pendingPayments) {
          const amountOwed = payment.custom_price - (payment.initial_payment || 0);
          if (amountOwed > 0 && payment.assigned_lawyer?.id) {
            await this.createNotification({
              userId: payment.assigned_lawyer.id,
              type: 'payment_due',
              title: 'Pago Pendiente',
              message: `El cliente ${payment.client.first_name} ${payment.client.last_name} tiene un pago pendiente de ${amountOwed}€`,
              priority: 'high',
              relatedId: payment.client.id,
              relatedType: 'client'
            });
          }
        }
      }

      // Obtener hitos próximos a vencer
      const { data: upcomingMilestones } = await supabase
        .from('client_milestones')
        .select(`
          id,
          client_service:client_services(
            client:clients(first_name, last_name, id),
            assigned_lawyer:users(id)
          ),
          milestone:service_milestones(name)
        `)
        .eq('is_completed', false);

      if (upcomingMilestones) {
        for (const milestone of upcomingMilestones) {
          if (milestone.client_service?.assigned_lawyer?.id) {
            await this.createNotification({
              userId: milestone.client_service.assigned_lawyer.id,
              type: 'milestone_due',
              title: 'Hito Pendiente',
              message: `El hito "${milestone.milestone.name}" del cliente ${milestone.client_service.client.first_name} ${milestone.client_service.client.last_name} está pendiente`,
              priority: 'medium',
              relatedId: milestone.client_service.client.id,
              relatedType: 'client'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al generar notificaciones automáticas:', error);
    }
  },

  // Suscribirse a notificaciones en tiempo real
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            isRead: payload.new.is_read,
            priority: payload.new.priority,
            relatedId: payload.new.related_id,
            relatedType: payload.new.related_type,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
          };
          callback(notification);
        }
      )
      .subscribe();
  }
};
