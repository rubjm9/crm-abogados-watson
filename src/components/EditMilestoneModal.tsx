import React, { useState } from 'react';
import { CaseMilestone } from '../types';
import Modal from './Modal';
import { 
  CheckCircle, 
  Circle, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface EditMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: CaseMilestone | null;
  onSubmit: (milestoneId: string, updates: Partial<CaseMilestone>) => Promise<void>;
  isLoading?: boolean;
}

const EditMilestoneModal: React.FC<EditMilestoneModalProps> = ({
  isOpen,
  onClose,
  milestone,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    notes: '',
    paymentAmount: 0,
    isCompleted: false,
    isPaymentCollected: false
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  React.useEffect(() => {
    if (milestone) {
      setFormData({
        notes: milestone.notes || '',
        paymentAmount: milestone.paymentAmount || 0,
        isCompleted: milestone.isCompleted,
        isPaymentCollected: milestone.isPaymentCollected || false
      });
    }
  }, [milestone]);

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    if (formData.paymentAmount < 0) {
      newErrors.paymentAmount = 'El monto del pago debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !milestone) return;

    try {
      const updates: Partial<CaseMilestone> = {
        notes: formData.notes,
        paymentAmount: formData.paymentAmount,
        isCompleted: formData.isCompleted,
        isPaymentCollected: formData.isPaymentCollected
      };

      // Si se marca como completado y no tiene fecha, agregar fecha
      if (formData.isCompleted && !milestone.completedAt) {
        updates.completedAt = new Date().toISOString();
      }

      // Si se marca como pagado y no tiene fecha, agregar fecha
      if (formData.isPaymentCollected && !milestone.paymentCollectedAt) {
        updates.paymentCollectedAt = new Date().toISOString();
      }

      await onSubmit(milestone.id, updates);
      onClose();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      notes: '',
      paymentAmount: 0,
      isCompleted: false,
      isPaymentCollected: false
    });
    setErrors({});
    onClose();
  };

  if (!milestone) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Hito" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del hito */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">
            {milestone.milestone?.name || 'Hito sin nombre'}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {milestone.milestone?.description || 'Sin descripción'}
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className={`flex items-center gap-1 ${milestone.isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
              {milestone.isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              {milestone.isCompleted ? 'Completado' : 'Pendiente'}
            </span>
            
            {milestone.isPaymentRequired && (
              <span className={`flex items-center gap-1 ${milestone.isPaymentCollected ? 'text-green-600' : 'text-orange-600'}`}>
                {milestone.isPaymentCollected ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {milestone.isPaymentCollected ? 'Pagado' : 'Pendiente de pago'}
              </span>
            )}
          </div>
        </div>

        {/* Estado de completado */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isCompleted"
            checked={formData.isCompleted}
            onChange={(e) => handleInputChange('isCompleted', e.target.checked)}
            className="w-4 h-4 text-aw-primary border-gray-300 rounded focus:ring-aw-primary"
          />
          <label htmlFor="isCompleted" className="text-sm font-medium text-gray-700">
            Marcar como completado
          </label>
        </div>

        {/* Estado de pago */}
        {milestone.isPaymentRequired && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPaymentCollected"
              checked={formData.isPaymentCollected}
              onChange={(e) => handleInputChange('isPaymentCollected', e.target.checked)}
              className="w-4 h-4 text-aw-primary border-gray-300 rounded focus:ring-aw-primary"
            />
            <label htmlFor="isPaymentCollected" className="text-sm font-medium text-gray-700">
              Marcar pago como cobrado
            </label>
          </div>
        )}

        {/* Monto del pago */}
        {milestone.isPaymentRequired && (
          <div>
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Monto del Pago (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                id="paymentAmount"
                value={formData.paymentAmount}
                onChange={(e) => handleInputChange('paymentAmount', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.paymentAmount ? 'border-red-500' : ''
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.paymentAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>
            )}
            {milestone.paymentPercentage && (
              <p className="mt-1 text-xs text-gray-500">
                {milestone.paymentPercentage}% del total del caso
              </p>
            )}
          </div>
        )}

        {/* Notas */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
            placeholder="Notas adicionales sobre este hito..."
          />
        </div>

        {/* Información de fechas */}
        <div className="text-xs text-gray-500 space-y-1">
          {milestone.completedAt && (
            <p>Completado el {new Date(milestone.completedAt).toLocaleDateString('es-ES')}</p>
          )}
          {milestone.paymentCollectedAt && (
            <p>Pago cobrado el {new Date(milestone.paymentCollectedAt).toLocaleDateString('es-ES')}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-aw-primary rounded-lg hover:bg-aw-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditMilestoneModal;
