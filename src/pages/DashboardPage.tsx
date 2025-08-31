import React from 'react';
import { Users, Briefcase, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const DashboardPage: React.FC = () => {
  // Datos de ejemplo para el dashboard
  const stats = [
    {
      name: 'Total de Clientes',
      value: '127',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      name: 'Casos Activos',
      value: '89',
      change: '+8%',
      changeType: 'increase',
      icon: Briefcase,
      color: 'green'
    },
    {
      name: 'Tareas Pendientes',
      value: '23',
      change: '-5%',
      changeType: 'decrease',
      icon: Calendar,
      color: 'yellow'
    },
    {
      name: 'Documentos',
      value: '456',
      change: '+15%',
      changeType: 'increase',
      icon: FileText,
      color: 'purple'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'new_client',
      message: 'Nuevo cliente registrado: María González',
      time: 'Hace 2 horas',
      status: 'success'
    },
    {
      id: 2,
      type: 'case_update',
      message: 'Caso actualizado: Residencia por Trabajo - Carlos Rodríguez',
      time: 'Hace 4 horas',
      status: 'info'
    },
    {
      id: 3,
      type: 'task_completed',
      message: 'Tarea completada: Revisar documentación de Ana Silva',
      time: 'Hace 6 horas',
      status: 'success'
    },
    {
      id: 4,
      type: 'document_uploaded',
      message: 'Documento subido: Contrato de trabajo - Luis Hernández',
      time: 'Hace 8 horas',
      status: 'info'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Revisar expediente de residencia',
      client: 'María González',
      dueDate: 'Hoy',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Preparar documentación para nacionalidad',
      client: 'Carlos Rodríguez',
      dueDate: 'Mañana',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Contactar con cliente para reagrupación familiar',
      client: 'Ana Silva',
      dueDate: 'En 2 días',
      priority: 'low'
    }
  ];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'new_client':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'case_update':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'document_uploaded':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del dashboard */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Resumen general de la actividad y estado de tu CRM
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-500',
              green: 'bg-green-500',
              yellow: 'bg-yellow-500',
              purple: 'bg-purple-500'
            };
            
            return (
              <div key={stat.name} className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráficos y contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Actividad reciente */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Actividad Reciente</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Ver todo
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tareas próximas */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Tareas Próximas</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Ver todas
                </button>
              </div>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(task.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">{task.title}</p>
                        <p className="text-sm text-gray-600 mb-2">{task.client}</p>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de casos por tipo */}
        <div className="mt-8">
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Resumen de Casos por Tipo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Extranjería</h3>
                <p className="text-3xl font-bold text-blue-600">67</p>
                <p className="text-sm text-gray-500">Casos activos</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Civil</h3>
                <p className="text-3xl font-bold text-green-600">23</p>
                <p className="text-sm text-gray-500">Casos activos</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Penal</h3>
                <p className="text-3xl font-bold text-yellow-600">12</p>
                <p className="text-sm text-gray-500">Casos activos</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Laboral</h3>
                <p className="text-3xl font-bold text-purple-600">8</p>
                <p className="text-sm text-gray-500">Casos activos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
