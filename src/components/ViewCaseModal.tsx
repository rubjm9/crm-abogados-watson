import React, { useEffect, useState } from 'react';
import { Case, CaseMilestone } from '../types';
import Modal from './Modal';
import { caseService } from '../services/caseService';
import { caseMilestoneService } from '../services/caseMilestoneService';
import CaseMilestones from './CaseMilestones';
import EditMilestoneModal from './EditMilestoneModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';

interface ViewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string | null;
  onEdit: (caseId: string) => void;
  onDelete: (caseId: string) => void;
}

const ViewCaseModal: React.FC<ViewCaseModalProps> = ({
  isOpen,
  onClose,
  caseId,
  onEdit,
  onDelete
}) => {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [milestones, setMilestones] = useState<CaseMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMilestoneModalOpen, setIsEditMilestoneModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<CaseMilestone | null>(null);

  useEffect(() => {
    if (isOpen && caseId) {
      loadCaseData();
    }
  }, [isOpen, caseId]);

  const loadCaseData = async () => {
    if (!caseId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await caseService.getCaseById(caseId);
      setCaseData(data);
      
      // Cargar hitos del caso
      await loadMilestones();
    } catch (err) {
      setError('Error al cargar los datos del caso');
      console.error('Error loading case:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMilestones = async () => {
    if (!caseId) return;
    
    setIsLoadingMilestones(true);
    try {
      const milestonesData = await caseMilestoneService.getCaseMilestones(caseId);
      setMilestones(milestonesData);
    } catch (err) {
      console.error('Error loading milestones:', err);
    } finally {
      setIsLoadingMilestones(false);
    }
  };

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

  const handleEdit = () => {
    if (caseData) {
      onEdit(caseData.id);
      onClose();
    }
  };

  const handleDelete = () => {
    if (caseData) {
      onDelete(caseData.id);
      onClose();
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      await caseMilestoneService.completeMilestone(milestoneId);
      await loadMilestones();
      
      // Crear notificación de hito completado
      if (caseData) {
        const milestone = milestones.find(m => m.id === milestoneId);
        if (milestone && caseData.assignedLawyerId) {
          await notificationService.createMilestoneCompletionNotification(
            caseData.assignedLawyerId,
            caseData.id,
            milestone.milestone?.name || 'Hito sin nombre',
            caseData.caseNumber
          );
        }
      }
    } catch (error) {
      console.error('Error completing milestone:', error);
    }
  };

  const handleMarkPaymentCollected = async (milestoneId: string) => {
    try {
      await caseMilestoneService.markPaymentAsCollected(milestoneId);
      await loadMilestones();
      
      // Crear notificación de pago cobrado
      if (caseData) {
        const milestone = milestones.find(m => m.id === milestoneId);
        if (milestone && caseData.assignedLawyerId) {
          await notificationService.createPaymentReminderNotification(
            caseData.assignedLawyerId,
            caseData.id,
            milestone.paymentAmount || 0,
            caseData.caseNumber,
            milestone.milestone?.name
          );
        }
      }
    } catch (error) {
      console.error('Error marking payment as collected:', error);
    }
  };

  const handleEditMilestone = (milestone: CaseMilestone) => {
    setSelectedMilestone(milestone);
    setIsEditMilestoneModalOpen(true);
  };

  const handleUpdateMilestone = async (milestoneId: string, updates: Partial<CaseMilestone>) => {
    try {
      await caseMilestoneService.updateMilestone(milestoneId, updates);
      await loadMilestones();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Caso" maxWidth="max-w-4xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-aw-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando detalles del caso...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : caseData ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {caseData.service?.name || 'Sin servicio'}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Caso:</span> {caseData.caseNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Cliente:</span> {caseData.client?.firstName} {caseData.client?.lastName}
                </p>
              </div>
              
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(caseData.status)}`}>
                {getStatusIcon(caseData.status)}
                <span className="capitalize">{caseData.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Información del Servicio */}
          {caseData.service && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Servicio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Servicio</p>
                  <p className="font-medium">{caseData.service.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categoría</p>
                  <p className="font-medium">{caseData.service.category}</p>
                </div>
                {caseData.service.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Descripción</p>
                    <p className="text-gray-700">{caseData.service.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información del Cliente */}
          {caseData.client && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nombre</p>
                  <p className="font-medium">{caseData.client.firstName} {caseData.client.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{caseData.client.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                  <p className="font-medium">{caseData.client.phone || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estado</p>
                  <p className="font-medium">{caseData.client.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información del Abogado */}
          {caseData.assignedLawyer && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Abogado Asignado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nombre</p>
                  <p className="font-medium">{caseData.assignedLawyer.firstName} {caseData.assignedLawyer.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{caseData.assignedLawyer.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Fechas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de inicio</p>
                  <p className="font-medium">{formatDate(caseData.startDate)}</p>
                </div>
              </div>
              {caseData.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha de fin</p>
                    <p className="font-medium">{formatDate(caseData.endDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Información Financiera</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Precio Total</p>
                <p className="text-lg font-semibold text-gray-900">€{caseData.totalPrice?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Pagado</p>
                <p className="text-lg font-semibold text-green-600">€{caseData.pricePaid?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Restante</p>
                <p className="text-lg font-semibold text-orange-600">€{caseData.priceRemaining?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          {/* Hitos del Caso */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <CaseMilestones
              milestones={milestones}
              onCompleteMilestone={handleCompleteMilestone}
              onMarkPaymentCollected={handleMarkPaymentCollected}
              onEditMilestone={handleEditMilestone}
              isLoading={isLoadingMilestones}
            />
          </div>

          {/* Notas */}
          {caseData.notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Notas</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{caseData.notes}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No se encontró información del caso</p>
        </div>
      )}

      {/* Edit Milestone Modal */}
      <EditMilestoneModal
        isOpen={isEditMilestoneModalOpen}
        onClose={() => {
          setIsEditMilestoneModalOpen(false);
          setSelectedMilestone(null);
        }}
        milestone={selectedMilestone}
        onSubmit={handleUpdateMilestone}
        isLoading={false}
      />
    </Modal>
  );
};

export default ViewCaseModal;
