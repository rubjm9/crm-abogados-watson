import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  FileText,
  Target
} from 'lucide-react';
import { dashboardService, DashboardStats } from '../services/dashboardService';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const dashboardStats = await dashboardService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aw-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del dashboard */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Resumen general de la actividad y estado de tu CRM
              </p>
            </div>
            <button 
              onClick={loadDashboardData}
              className="btn-secondary"
            >
              <Clock className="w-4 h-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total de Clientes"
            value={stats.totalClients}
            icon={Users}
            color="blue"
            change={{
              value: stats.totalClients > 0 ? Math.round((stats.activeClients / stats.totalClients) * 100) : 0,
              isPositive: true
            }}
          />
          
          <StatsCard
            title="Servicios Activos"
            value={stats.activeServices}
            icon={Briefcase}
            color="green"
            change={{
              value: stats.totalServices > 0 ? Math.round((stats.activeServices / stats.totalServices) * 100) : 0,
              isPositive: true
            }}
          />
          
          <StatsCard
            title="Ingresos Totales"
            value={`${stats.totalRevenue.toLocaleString('es-ES')}€`}
            icon={DollarSign}
            color="amber"
          />
          
          <StatsCard
            title="Pagos Pendientes"
            value={`${stats.pendingPayments.toLocaleString('es-ES')}€`}
            icon={Target}
            color="red"
          />
        </div>

        {/* Gráficos y contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Gráfico de ingresos */}
          <div className="lg:col-span-2">
            <RevenueChart data={stats.monthlyRevenue} />
          </div>

          {/* Actividad reciente */}
          <div className="lg:col-span-1">
            <ActivityFeed activities={stats.recentActivity} />
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Distribución de clientes por estado */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Clientes</h3>
            <div className="space-y-4">
              {stats.clientStatusDistribution.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'active' ? 'bg-green-500' :
                      item.status === 'potential' ? 'bg-blue-500' :
                      item.status === 'inactive' ? 'bg-gray-500' : 'bg-amber-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {item.status === 'active' ? 'Activos' :
                       item.status === 'potential' ? 'Potenciales' :
                       item.status === 'inactive' ? 'Inactivos' : item.status}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Servicios por categoría */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios por Categoría</h3>
            <div className="space-y-4">
              {stats.servicesByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-aw-primary"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {item.count} servicios
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.revenue.toLocaleString('es-ES')}€
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de métricas */}
        <div className="mt-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumen de Métricas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Clientes Potenciales</h4>
                <p className="text-3xl font-bold text-blue-600">{stats.potentialClients}</p>
                <p className="text-sm text-gray-500">En proceso de conversión</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Servicios Completados</h4>
                <p className="text-3xl font-bold text-green-600">{stats.completedServices}</p>
                <p className="text-sm text-gray-500">Casos finalizados</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Tasa de Conversión</h4>
                <p className="text-3xl font-bold text-amber-600">
                  {stats.totalClients > 0 ? Math.round((stats.activeClients / stats.totalClients) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-500">Clientes activos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
