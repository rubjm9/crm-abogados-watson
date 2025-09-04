import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Menu as MenuIcon } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { NotificationToast } from './NotificationToast';
import { notificationService, Notification } from '../services/notificationService';
import { supabase } from '../services/supabase';

interface HeaderProps {
  onMenuToggle: () => void;
  userId?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, userId = 'default-user' }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
  const [realUserId, setRealUserId] = useState<string | null>(null);

  // Obtener un userId válido de la base de datos
  useEffect(() => {
    const getRealUserId = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1)
          .single();

        if (error) {
          console.error('Error getting user ID:', error);
          return;
        }

        if (data) {
          setRealUserId(data.id);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };

    getRealUserId();
  }, []);

  useEffect(() => {
    if (realUserId) {
      loadUnreadCount();
      setupRealtimeNotifications();
      // Cargar notificaciones recientes solo una vez al inicio
      setTimeout(() => {
        loadRecentNotifications();
      }, 1000);
    }
  }, [realUserId]);

  const loadUnreadCount = async () => {
    if (!realUserId) return;
    
    try {
      const stats = await notificationService.getNotificationStats(realUserId);
      setUnreadCount(stats.unread);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadRecentNotifications = async () => {
    if (!realUserId) return;
    
    try {
      const notifications = await notificationService.getUserNotifications(realUserId, 3);
      
      // Mostrar solo las notificaciones no leídas como toasts
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length > 0) {
        // Reemplazar todos los toasts existentes con las notificaciones no leídas
        setToastNotifications(unreadNotifications.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading recent notifications:', error);
    }
  };

  const setupRealtimeNotifications = () => {
    if (!realUserId) return;
    
    // Suscribirse a notificaciones en tiempo real
    const subscription = notificationService.subscribeToNotifications(realUserId, (notification) => {
      // Mostrar la nueva notificación como toast
      setToastNotifications(prev => {
        const exists = prev.some(n => n.id === notification.id);
        if (!exists) {
          // Agregar la nueva notificación al inicio
          return [notification, ...prev.slice(0, 2)]; // Máximo 3 toasts
        }
        return prev;
      });
      // Actualizar contador inmediatamente
      setUnreadCount(prev => prev + 1);
    });

    // También suscribirse a cambios en notificaciones existentes
    const updateSubscription = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${realUserId}`
        },
        (payload) => {
          if (payload.new.is_read) {
            // Si se marcó como leída, actualizar contador
            setUnreadCount(prev => Math.max(0, prev - 1));
            // Remover de toasts si está presente
            setToastNotifications(prev => prev.filter(n => n.id !== payload.new.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      updateSubscription.unsubscribe();
    };
  };

  const handleNotificationClick = () => {
    setIsNotificationCenterOpen(true);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Actualizar contador inmediatamente
      setUnreadCount(prev => Math.max(0, prev - 1));
      // Remover el toast de la lista
      setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // También actualizar desde la base de datos para asegurar sincronización
      setTimeout(() => {
        loadUnreadCount();
      }, 100);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const removeToast = (notificationId: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Botón de menú para móvil */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-lg mx-4 lg:mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar clientes, casos, documentos..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-aw-primary focus:border-aw-primary sm:text-sm"
              />
            </div>
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">


            {/* Notificaciones */}
            <button 
              onClick={handleNotificationClick}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}

            </button>

            {/* Perfil del usuario */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">María García</p>
                <p className="text-xs text-gray-500">Abogada Senior</p>
              </div>
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-aw-primary bg-opacity-10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter
        userId={realUserId || 'default-user'}
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onNotificationUpdated={() => {
          // Solo actualizar contador cuando se modifica una notificación
          loadUnreadCount();
        }}
      />



      {/* Toast Notifications */}
      {toastNotifications.map((notification, index) => (
        <div key={notification.id} style={{ top: `${4 + index * 5}rem`, right: '1rem' }}>
          <NotificationToast
            notification={notification}
            onClose={() => removeToast(notification.id)}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      ))}
      

    </>
  );
};

export default Header;
