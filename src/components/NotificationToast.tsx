import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  DollarSign, 
  Clock, 
  UserPlus, 
  Briefcase, 
  FileText
} from 'lucide-react';
import { Notification } from '../services/notificationService';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onMarkAsRead
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Mostrar la notificación después de un pequeño delay
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-ocultar después de 5 segundos (si no está siendo hover)
    const hideTimer = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false);
        setTimeout(onClose, 300); // Esperar a que termine la animación
      }
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isHovered, onClose]);

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

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    onClose();
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-80 max-w-sm transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`rounded-lg shadow-lg border-l-4 ${getPriorityColor(notification.priority)} bg-white border border-gray-200`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h4>
                <button
                  onClick={onClose}
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
              
              {notification.priority === 'high' && (
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-2">
                  Alta prioridad
                </span>
              )}
              
              <div className="mt-3 flex items-center space-x-2">
                {!notification.isRead && (
                  <button
                    onClick={handleMarkAsRead}
                    className="text-xs text-aw-primary hover:text-aw-primary-dark font-medium"
                  >
                    Marcar como leída
                  </button>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
