import React, { useState } from 'react';
import { CaseMilestone } from '../types';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  DollarSign,
  Edit,
  AlertTriangle
} from 'lucide-react';

interface CaseMilestonesProps {
  milestones: CaseMilestone[];
  onCompleteMilestone: (milestoneId: string) => Promise<void>;
  onMarkPaymentCollected: (milestoneId: string) => Promise<void>;
  onEditMilestone: (milestone: CaseMilestone) => void;
  isLoading?: boolean;
}

const CaseMilestones: React.FC<CaseMilestonesProps> = ({
  milestones,
  onCompleteMilestone,
  onMarkPaymentCollected,
  onEditMilestone,
  isLoading = false
}) => {
  const [completingMilestone, setCompletingMilestone] = useState<string | null>(null);
  const [collectingPayment, setCollectingPayment] = useState<string | null>(null);

  const handleCompleteMilestone = async (milestoneId: string) => {
    setCompletingMilestone(milestoneId);
    try {
      await onCompleteMilestone(milestoneId);
    } finally {
      setCompletingMilestone(null);
    }
  };

  const handleCollectPayment = async (milestoneId: string) => {
    setCollectingPayment(milestoneId);
    try {
      await onMarkPaymentCollected(milestoneId);
    } finally {
      setCollectingPayment(null);
    }
  };

  const getMilestoneStatus = (milestone: CaseMilestone) => {
    if (milestone.isCompleted) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: 'Completado',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        icon: <Circle className="w-5 h-5 text-gray-400" />,
        text: 'Pendiente',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    }
  };

  const getPaymentStatus = (milestone: CaseMilestone) => {
    if (!milestone.isPaymentRequired) {
      return {
        icon: null,
        text: 'Sin pago',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50'
      };
    }
    
    if (milestone.isPaymentCollected) {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        text: 'Pagado',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    } else {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
        text: 'Pendiente',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-aw-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Cargando hitos...</span>
        </div>
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay hitos definidos</h3>
        <p className="text-gray-600">Este caso no tiene hitos configurados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Hitos del Caso</h3>
        <div className="text-sm text-gray-500">
          {milestones.filter(m => m.isCompleted).length} de {milestones.length} completados
        </div>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const status = getMilestoneStatus(milestone);
          const paymentStatus = getPaymentStatus(milestone);

          return (
            <div
              key={milestone.id}
              className={`p-4 border rounded-lg ${status.bgColor} ${status.borderColor} transition-all duration-200 hover:shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2 mt-1">
                    {status.icon}
                    <span className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {milestone.milestone?.name || 'Hito sin nombre'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {milestone.milestone?.description || 'Sin descripción'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${status.color}`}>
                        {status.icon}
                        {status.text}
                      </span>
                      
                      {milestone.isPaymentRequired && (
                        <span className={`flex items-center gap-1 ${paymentStatus.color}`}>
                          {paymentStatus.icon}
                          {paymentStatus.text}
                        </span>
                      )}
                      
                      {milestone.paymentAmount && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          €{milestone.paymentAmount.toFixed(2)}
                        </span>
                      )}
                      
                      {milestone.paymentPercentage && (
                        <span className="text-gray-600">
                          {milestone.paymentPercentage}% del total
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!milestone.isCompleted && (
                    <button
                      onClick={() => handleCompleteMilestone(milestone.id)}
                      disabled={completingMilestone === milestone.id}
                      className="px-3 py-1 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      {completingMilestone === milestone.id ? 'Completando...' : 'Completar'}
                    </button>
                  )}
                  
                  {milestone.isPaymentRequired && !milestone.isPaymentCollected && (
                    <button
                      onClick={() => handleCollectPayment(milestone.id)}
                      disabled={collectingPayment === milestone.id}
                      className="px-3 py-1 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors disabled:opacity-50"
                    >
                      {collectingPayment === milestone.id ? 'Marcando...' : 'Cobrar'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => onEditMilestone(milestone)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {milestone.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notas:</span> {milestone.notes}
                  </p>
                </div>
              )}

              {milestone.completedAt && (
                <div className="mt-2 text-xs text-gray-500">
                  Completado el {new Date(milestone.completedAt).toLocaleDateString('es-ES')}
                </div>
              )}

              {milestone.paymentCollectedAt && (
                <div className="mt-1 text-xs text-gray-500">
                  Pago cobrado el {new Date(milestone.paymentCollectedAt).toLocaleDateString('es-ES')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumen de pagos */}
      {milestones.some(m => m.isPaymentRequired) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Resumen de Pagos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Total requerido:</span>
              <span className="ml-2 font-medium">
                €{milestones
                  .filter(m => m.isPaymentRequired)
                  .reduce((sum, m) => sum + (m.paymentAmount || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-green-600">Pagado:</span>
              <span className="ml-2 font-medium">
                €{milestones
                  .filter(m => m.isPaymentRequired && m.isPaymentCollected)
                  .reduce((sum, m) => sum + (m.paymentAmount || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-orange-600">Pendiente:</span>
              <span className="ml-2 font-medium">
                €{milestones
                  .filter(m => m.isPaymentRequired && !m.isPaymentCollected)
                  .reduce((sum, m) => sum + (m.paymentAmount || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseMilestones;
