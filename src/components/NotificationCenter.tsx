import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  UserPlus, 
  Briefcase, 
  CheckCircle, 
  FileText,
  Settings,
  Trash2
} from 'lucide-react';
import { Notification, notificationService } from '../services/notificationService';
import Modal from './Modal';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onNotificationUpdated?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  isOpen,
  onClose,
  onNotificationUpdated
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen, userId, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      let notificationsData: Notification[];
      if (filter === 'unread') {
        notificationsData = await notificationService.getUnreadNotifications(userId);
      } else {
        notificationsData = await notificationService.getUserNotifications(userId);
      }

      // Filtrar por prioridad alta si es necesario
      if (filter === 'high') {
        notificationsData = notificationsData.filter(n => n.priority === 'high');
      }

      setNotifications(notificationsData);
      
      // Obtener estadísticas
      const stats = await notificationService.getNotificationStats(userId);
      setUnreadCount(stats.unread);
    } catch (err) {
      setError('Error al cargar las notificaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Notificar al componente padre que se actualizó una notificación
      if (onNotificationUpdated) {
        onNotificationUpdated();
      }
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      
      // Notificar al componente padre que se actualizaron notificaciones
      if (onNotificationUpdated) {
        onNotificationUpdated();
      }
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Notificar al componente padre que se eliminó una notificación
      if (onNotificationUpdated) {
        onNotificationUpdated();
      }
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_due':
        return <DollarSign className="w-5 h-5 text-red-500" />;
      case 'milestone_due':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'client_created':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'service_assigned':
        return <Briefcase className="w-5 h-5 text-green-500" />;
      case 'milestone_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'document_required':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Centro de Notificaciones" maxWidth="max-w-2xl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aw-primary"></div>
          <span className="ml-3 text-gray-600">Cargando notificaciones...</span>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Centro de Notificaciones" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Header con filtros y acciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'high')}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-aw-primary"
            >
              <option value="all">Todas</option>
              <option value="unread">No leídas ({unreadCount})</option>
              <option value="high">Alta prioridad</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-aw-primary hover:text-aw-primary-dark font-medium"
              >
                Marcar todas como leídas
              </button>
            )}
            <button
              onClick={loadNotifications}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {filter === 'all' ? 'No hay notificaciones' :
                 filter === 'unread' ? 'No hay notificaciones no leídas' :
                 'No hay notificaciones de alta prioridad'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'ring-2 ring-aw-primary ring-opacity-20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      {notification.priority === 'high' && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-2">
                          Alta prioridad
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-3">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Marcar como leída"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con estadísticas */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''}
              {unreadCount > 0 && ` • ${unreadCount} no leída${unreadCount !== 1 ? 's' : ''}`}
            </span>
            <button
              onClick={loadNotifications}
              className="text-aw-primary hover:text-aw-primary-dark font-medium"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
