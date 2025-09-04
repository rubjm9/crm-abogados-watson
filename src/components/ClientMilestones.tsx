import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  Plus,
  Edit
} from 'lucide-react';
import { ClientService, ClientMilestone, ServiceMilestone } from '../types';
import { clientServiceService } from '../services/clientServiceService';
import { clientMilestoneService } from '../services/clientMilestoneService';
import Modal from './Modal';

interface ClientMilestonesProps {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientMilestones: React.FC<ClientMilestonesProps> = ({
  clientId,
  clientName,
  isOpen,
  onClose
}) => {
  const [clientServices, setClientServices] = useState<ClientService[]>([]);
  const [milestones, setMilestones] = useState<ClientMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && clientId) {
      loadClientData();
    }
  }, [isOpen, clientId]);

  const loadClientData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Cargar servicios del cliente
      const services = await clientServiceService.getClientServices(clientId);
      setClientServices(services);

      // Cargar hitos del cliente usando el servicio real
      const clientMilestones = await clientMilestoneService.getClientMilestones(clientId);
      setMilestones(clientMilestones);
    } catch (err) {
      setError('Error al cargar los datos del cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneToggle = async (milestoneId: string) => {
    try {
      const milestone = milestones.find(m => m.id === milestoneId);
      if (!milestone) return;

      // Actualizar en la base de datos
      const updatedMilestone = await clientMilestoneService.updateClientMilestone(milestoneId, {
        isCompleted: !milestone.isCompleted,
        completedAt: !milestone.isCompleted ? new Date().toISOString() : undefined
      });

      // Actualizar estado local
      setMilestones(prev => 
        prev.map(m => m.id === milestoneId ? updatedMilestone : m)
      );
    } catch (err) {
      setError('Error al actualizar el hito');
      console.error(err);
    }
  };

  const getProgressPercentage = (serviceId: string) => {
    const serviceMilestones = milestones.filter(m => m.clientServiceId === serviceId);
    if (serviceMilestones.length === 0) return 0;
    
    const completed = serviceMilestones.filter(m => m.isCompleted).length;
    return Math.round((completed / serviceMilestones.length) * 100);
  };

  const getMilestoneStatus = (milestone: ClientMilestone) => {
    if (milestone.isCompleted) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: 'Completado',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    }
    
    // TODO: Implementar lógica de fechas límite
    return {
      icon: <Circle className="w-5 h-5 text-gray-400" />,
      text: 'Pendiente',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Hitos de ${clientName}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aw-primary"></div>
          <span className="ml-3 text-gray-600">Cargando hitos...</span>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Hitos de ${clientName}`} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Total de hitos</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{milestones.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Completados</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {milestones.filter(m => m.isCompleted).length}
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-amber-600 mr-2" />
              <span className="text-sm font-medium text-amber-800">Pagos pendientes</span>
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-1">
              {milestones.filter(m => !m.isCompleted && m.paymentAmount).length}
            </p>
          </div>
        </div>

        {/* Servicios y sus hitos */}
        {clientServices.map((service) => {
          const serviceMilestones = milestones.filter(m => m.clientServiceId === service.id);
          const progress = getProgressPercentage(service.id);

          return (
            <div key={service.id} className="border border-gray-200 rounded-lg p-6">
              {/* Header del servicio */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.service?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {service.service?.category} • {service.status}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Progreso</div>
                  <div className="text-2xl font-bold text-aw-primary">{progress}%</div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-aw-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Lista de hitos */}
              <div className="space-y-3">
                {serviceMilestones.map((milestone) => {
                  const status = getMilestoneStatus(milestone);
                  
                  return (
                    <div 
                      key={milestone.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${status.bgColor} hover:bg-gray-50 transition-colors`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleMilestoneToggle(milestone.id)}
                          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                        >
                          {status.icon}
                          <div>
                            <div className={`font-medium ${status.color}`}>
                              {milestone.milestone?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {milestone.milestone?.description}
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Fecha de completado */}
                        {milestone.isCompleted && milestone.completedAt && (
                          <div className="text-sm text-green-600">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(milestone.completedAt)}
                          </div>
                        )}

                        {/* Pago asociado */}
                        {milestone.paymentAmount && (
                          <div className="text-sm text-amber-600">
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            {milestone.paymentAmount}€
                          </div>
                        )}

                        {/* Estado */}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color} ${status.bgColor}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mensaje si no hay hitos */}
              {serviceMilestones.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Este servicio no tiene hitos definidos</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Mensaje si no hay servicios */}
        {clientServices.length === 0 && (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay servicios asignados</h3>
            <p className="mt-1 text-sm text-gray-500">
              Asigna un servicio al cliente para ver sus hitos.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
