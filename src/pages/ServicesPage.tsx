import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Service, ServiceMilestone } from '../types';
import { serviceService } from '../services/serviceService';
import CreateServiceModal from '../components/CreateServiceModal';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAllServices();
      setServices(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los servicios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceCreated = () => {
    setIsCreateModalOpen(false);
    loadServices();
  };

  const handleDeactivateService = async (serviceId: string) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este servicio?')) {
      try {
        await serviceService.deactivateService(serviceId);
        loadServices();
      } catch (err) {
        setError('Error al desactivar el servicio');
        console.error(err);
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Nacionalidad': 'bg-blue-100 text-blue-800',
      'Residencia': 'bg-green-100 text-green-800',
      'Visado': 'bg-purple-100 text-purple-800',
      'Otros': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors['Otros'];
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      'Baja': 'bg-green-100 text-green-800',
      'Media': 'bg-yellow-100 text-yellow-800',
      'Alta': 'bg-red-100 text-red-800'
    };
    return colors[complexity as keyof typeof colors] || colors['Media'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600">Gestiona los servicios disponibles para los clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="btn-secondary"
          >
            {viewMode === 'grid' ? 'Vista Lista' : 'Vista Cuadrícula'}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Nuevo Servicio
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Servicios</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nacionalidad</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.category === 'Nacionalidad').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Residencia</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.category === 'Residencia').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Visado</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.category === 'Visado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Servicios */}
      {services.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay servicios</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer servicio.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Servicio
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="card hover:shadow-medium transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Ver detalles"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDeactivateService(service.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Desactivar"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                    {service.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(service.complexity)}`}>
                    {service.complexity}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio base:</span>
                  <span className="font-medium">{service.basePrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coste estimado:</span>
                  <span className="font-medium">{service.estimatedCost.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Documentos:</span>
                  <span className="font-medium">{service.requiredDocuments.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complejidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(service.complexity)}`}>
                        {service.complexity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.basePrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.requiredDocuments.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedService(service)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeactivateService(service.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Desactivar"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Creación */}
      {isCreateModalOpen && (
        <CreateServiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onServiceCreated={handleServiceCreated}
        />
      )}
    </div>
  );
};

export default ServicesPage;
