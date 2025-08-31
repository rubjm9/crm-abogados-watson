import React from 'react';
import { Mail, Phone, MapPin, Calendar, User, FileText, Hash, Globe } from 'lucide-react';
import { Client } from '../types';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div 
      className="card p-6 hover:shadow-medium transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      {/* Header de la tarjeta */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {client.firstName} {client.lastName}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Globe className="w-4 h-4" />
              <span>{client.nationality}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
            {getStatusText(client.status)}
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Hash className="w-3 h-3" />
            <span>#{client.expedientNumber}</span>
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate">{client.email}</span>
        </div>
        {client.phone && (
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{client.address}</span>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="space-y-3 mb-4">
        {client.countryOfOrigin && (
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>País: {client.countryOfOrigin}</span>
          </div>
        )}
        {client.cityOfResidence && (
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>Ciudad: {client.cityOfResidence}</span>
          </div>
        )}
        {client.birthDate && (
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Nacimiento: {new Date(client.birthDate).toLocaleDateString('es-ES')}</span>
          </div>
        )}
        {client.preferredLanguage && (
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <FileText className="w-4 h-4 text-gray-400" />
            <span>Idioma: {client.preferredLanguage}</span>
          </div>
        )}
      </div>

      {/* Información del expediente */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Cliente desde {new Date(client.createdAt).toLocaleDateString('es-ES', { 
            month: 'short', 
            year: 'numeric' 
          })}</span>
        </div>
        {client.passportNumber && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span className="truncate">DNI: {client.passportNumber}</span>
          </div>
        )}
      </div>

      {/* Notas (si existen) */}
      {client.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start space-x-2 text-sm">
            <FileText className="w-4 h-4 text-primary-500 mt-0.5" />
            <div>
              <span className="text-gray-600 font-medium">Notas:</span>
              <p className="text-gray-500 mt-1 line-clamp-2">{client.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCard;
