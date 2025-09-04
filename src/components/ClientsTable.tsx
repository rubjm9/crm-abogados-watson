import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Eye, 
  Archive, 
  MoreHorizontal,
  User,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Client, ClientService } from '../types';
import { clientServiceService } from '../services/clientServiceService';

interface ClientsTableProps {
  clients: Client[];
  onAssignService: (clientId: string, clientName: string) => void;
  onArchive: (clientId: string) => void;
  onViewDetails: (clientId: string) => void;
  onViewMilestones: (clientId: string, clientName: string) => void;
}

type SortField = 'firstName' | 'email' | 'countryOfOrigin' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onAssignService,
  onArchive,
  onViewDetails,
  onViewMilestones
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [clientServices, setClientServices] = useState<Record<string, ClientService[]>>({});

  // Función para ordenar clientes
  const sortedClients = [...clients].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Manejo especial para fechas
    if (sortField === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Manejo especial para nombres (combinar firstName + lastName)
    if (sortField === 'firstName') {
      aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
      bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Función para manejar el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para obtener servicios de un cliente
  const getClientServices = async (clientId: string) => {
    if (!clientServices[clientId]) {
      try {
        const services = await clientServiceService.getClientServices(clientId);
        setClientServices(prev => ({
          ...prev,
          [clientId]: services
        }));
      } catch (error) {
        console.error('Error loading client services:', error);
      }
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'potential': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'potential': return 'Potencial';
      default: return status;
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para renderizar el icono de ordenamiento
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-aw-primary" />
      : <ChevronDown className="w-4 h-4 text-aw-primary" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('firstName')}
              >
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Cliente</span>
                  {renderSortIcon('firstName')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                  {renderSortIcon('email')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('countryOfOrigin')}
              >
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>País</span>
                  {renderSortIcon('countryOfOrigin')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Servicios</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Abogado</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Fecha</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedClients.map((client) => {
              // Cargar servicios al hacer hover
              const handleRowHover = () => {
                getClientServices(client.id);
              };

              const services = clientServices[client.id] || [];
              const assignedLawyer = services.find(s => s.assignedLawyer)?.assignedLawyer;

              return (
                <tr 
                  key={client.id} 
                  className="hover:bg-gray-50 transition-colors"
                  onMouseEnter={handleRowHover}
                >
                  {/* Cliente */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <button
                        onClick={() => onViewDetails(client.id)}
                        className="text-sm font-medium text-aw-primary hover:text-aw-primary-dark transition-colors text-left underline hover:no-underline"
                      >
                        {client.firstName} {client.lastName}
                      </button>
                      <div className="text-sm text-gray-500">
                        Exp. #{client.expedientNumber}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.email}</div>
                    {client.phone && (
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    )}
                  </td>

                  {/* País */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.countryOfOrigin}</div>
                    {client.cityOfResidence && (
                      <div className="text-sm text-gray-500">{client.cityOfResidence}</div>
                    )}
                  </td>

                  {/* Servicios */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {services.length > 0 ? (
                      <div className="space-y-1">
                        {services.slice(0, 2).map((service) => (
                          <div key={service.id} className="text-sm">
                            <span className="text-gray-900">{service.service?.name}</span>
                            <span className="text-gray-500 ml-1">({service.status})</span>
                          </div>
                        ))}
                        {services.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{services.length - 2} más
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Sin servicios</span>
                    )}
                  </td>

                  {/* Abogado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assignedLawyer ? (
                      <div className="text-sm text-gray-900">
                        {assignedLawyer.firstName} {assignedLawyer.lastName}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Sin asignar</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                      {getStatusText(client.status)}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(client.createdAt)}
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onAssignService(client.id, `${client.firstName} ${client.lastName}`)}
                        className="text-aw-primary hover:text-aw-primary-dark transition-colors"
                        title="Asignar servicio"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewMilestones(client.id, `${client.firstName} ${client.lastName}`)}
                        className="text-green-600 hover:text-green-700 transition-colors"
                        title="Ver hitos"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewDetails(client.id)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onArchive(client.id)}
                        className="text-amber-600 hover:text-amber-700 transition-colors"
                        title="Archivar cliente"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Estado vacío */}
      {sortedClients.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primer cliente.
          </p>
        </div>
      )}
    </div>
  );
};
