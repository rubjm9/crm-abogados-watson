import React from 'react';
import { 
  UserPlus, 
  Briefcase, 
  CheckCircle, 
  DollarSign,
  Clock
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'client_created' | 'service_assigned' | 'milestone_completed' | 'payment_received';
  description: string;
  date: string;
  clientName?: string;
  amount?: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  title = "Actividad Reciente" 
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'client_created':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'service_assigned':
        return <Briefcase className="w-4 h-4 text-green-500" />;
      case 'milestone_completed':
        return <CheckCircle className="w-4 h-4 text-amber-500" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'client_created':
        return 'bg-blue-50 border-blue-200';
      case 'service_assigned':
        return 'bg-green-50 border-green-200';
      case 'milestone_completed':
        return 'bg-amber-50 border-amber-200';
      case 'payment_received':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
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

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay actividad reciente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={`${activity.id}-${index}`}
            className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
          >
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <span className="text-xs text-gray-500">
                  {formatDate(activity.date)}
                </span>
              </div>
              
              {activity.clientName && (
                <p className="text-sm text-gray-600 mt-1">
                  Cliente: {activity.clientName}
                </p>
              )}
              
              {activity.amount && (
                <p className="text-sm font-medium text-green-600 mt-1">
                  {activity.amount.toLocaleString('es-ES')}€
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {activities.length >= 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-aw-primary hover:text-aw-primary-dark font-medium">
            Ver toda la actividad →
          </button>
        </div>
      )}
    </div>
  );
};
