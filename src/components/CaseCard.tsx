import React from 'react';
import { Case } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface CaseCardProps {
  caseData: Case;
  onView: (caseId: string) => void;
  onEdit: (caseId: string) => void;
  onDelete: (caseId: string) => void;
  onStatusChange: (caseId: string, status: Case['status']) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({
  caseData,
  onView,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'abierto':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cerrado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Case['priority']) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-500';
      case 'alta':
        return 'bg-orange-500';
      case 'media':
        return 'bg-yellow-500';
      case 'baja':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Case['status']) => {
    switch (status) {
      case 'abierto':
        return <FileText className="w-4 h-4" />;
      case 'en_proceso':
        return <Clock className="w-4 h-4" />;
      case 'cerrado':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {caseData.service?.name || 'Sin servicio'}
              </h3>
              <div 
                className={`w-3 h-3 rounded-full ${getPriorityColor(caseData.priority)}`}
                title={`Prioridad: ${caseData.priority}`}
              />
            </div>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Caso:</span> {caseData.caseNumber}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Cliente:</span> {caseData.client?.firstName} {caseData.client?.lastName}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(caseData.status)}`}>
            {getStatusIcon(caseData.status)}
            <span className="capitalize">{caseData.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {caseData.service?.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {caseData.service.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Inicio: {formatDate(caseData.startDate)}</span>
          </div>
          
          {caseData.endDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Fin: {formatDate(caseData.endDate)}</span>
            </div>
          )}

          {caseData.assignedLawyer && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Abogado: {caseData.assignedLawyer.firstName} {caseData.assignedLawyer.lastName}</span>
            </div>
          )}

          {caseData.estimatedDuration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Duración estimada: {caseData.estimatedDuration} meses</span>
            </div>
          )}
        </div>

        {/* Service and Payment Info */}
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Servicio: {caseData.service?.name || 'Sin servicio'}
          </p>
          <p className="text-xs text-gray-600 mb-2">
            Categoría: {caseData.service?.category || 'Sin categoría'}
          </p>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Precio Total:</span>
              <span className="font-medium">€{caseData.totalPrice?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pagado:</span>
              <span className="font-medium text-green-600">€{caseData.pricePaid?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Restante:</span>
              <span className="font-medium text-orange-600">€{caseData.priceRemaining?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(caseData.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4" />
              Ver
            </button>
            
            <button
              onClick={() => onEdit(caseData.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(caseData.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;
