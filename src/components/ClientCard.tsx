import React from 'react';
import { Mail, Phone, MapPin, Calendar, FileText, Plus, Eye, Archive } from 'lucide-react';
import { Client } from '../types';

interface ClientCardProps {
  client: Client;
  onAssignService: () => void;
  onArchive?: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onAssignService, onArchive }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'potential': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'potential': return 'Cliente potencial';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {client.firstName} {client.lastName}
            </h3>
            <p className="text-sm text-gray-500">
              Exp. #{client.expedientNumber}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
            {getStatusText(client.status)}
          </span>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span>{client.cityOfResidence || client.countryOfOrigin}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="p-6 space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>Nacimiento: {client.birthDate ? formatDate(client.birthDate) : 'N/A'}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Nacionalidad:</span> {client.nationality}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Idioma:</span> {client.preferredLanguage}
        </div>
        {client.notes && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Notas:</span> {client.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onAssignService}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            title="Asignar servicio"
          >
            <Plus className="h-4 w-4" />
            <span>Asignar Servicio</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors" title="Ver detalle">
            <Eye className="h-4 w-4" />
            <span>Ver Detalle</span>
          </button>
          {onArchive && (
            <button
              onClick={() => onArchive(client.id)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors"
              title="Archivar cliente"
            >
              <Archive className="h-4 w-4" />
              <span>Archivar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
