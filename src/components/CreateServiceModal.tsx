import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { CreateServiceForm, CreateMilestoneForm } from '../types';
import { serviceService } from '../services/serviceService';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: () => void;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  isOpen,
  onClose,
  onServiceCreated
}) => {
  const [formData, setFormData] = useState<CreateServiceForm>({
    name: '',
    description: '',
    category: 'Residencia',
    basePrice: 0,
    estimatedCost: 0,
    complexity: 'Media',
    requiredDocuments: [],
    notes: '',
    milestones: []
  });

  const [milestones, setMilestones] = useState<CreateMilestoneForm[]>([]);
  const [newDocument, setNewDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateServiceForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMilestoneChange = (index: number, field: keyof CreateMilestoneForm, value: any) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value
    };
    setMilestones(updatedMilestones);
  };

  const addMilestone = () => {
    const newMilestone: CreateMilestoneForm = {
      name: '',
      description: '',
      orderNumber: milestones.length + 1,
      isPaymentRequired: false,
      defaultPaymentAmount: undefined
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (index: number) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index);
    // Reordenar los números de orden
    const reorderedMilestones = updatedMilestones.map((milestone, i) => ({
      ...milestone,
      orderNumber: i + 1
    }));
    setMilestones(reorderedMilestones);
  };

  const addDocument = () => {
    if (newDocument.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, newDocument.trim()]
      }));
      setNewDocument('');
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre del servicio es obligatorio');
      return;
    }

    if (formData.basePrice < 0) {
      setError('El precio base no puede ser negativo');
      return;
    }

    if (formData.estimatedCost < 0) {
      setError('El coste estimado no puede ser negativo');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const serviceData = {
        ...formData,
        milestones: milestones
      };

      await serviceService.createService(serviceData);
      onServiceCreated();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'Residencia',
        basePrice: 0,
        estimatedCost: 0,
        complexity: 'Media',
        requiredDocuments: [],
        notes: '',
        milestones: []
      });
      setMilestones([]);
      setNewDocument('');
    } catch (err) {
      setError('Error al crear el servicio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Servicio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-field"
                placeholder="Ej: Residencia por Arraigo Social"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="input-field"
              >
                <option value="Nacionalidad">Nacionalidad</option>
                <option value="Residencia">Residencia</option>
                <option value="Visado">Visado</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Base (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coste Estimado (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.estimatedCost}
                onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complejidad *
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => handleInputChange('complexity', e.target.value)}
                className="input-field"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Describe el servicio..."
            />
          </div>

          {/* Documentos requeridos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos Requeridos
            </label>
            <div className="space-y-2">
              {formData.requiredDocuments.map((doc, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 bg-gray-50 px-3 py-2 rounded border text-sm">
                    {doc}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Añadir documento..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                />
                <button
                  type="button"
                  onClick={addDocument}
                  className="btn-secondary"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Hitos */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Hitos del Servicio
              </label>
              <button
                type="button"
                onClick={addMilestone}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus size={16} />
                Añadir Hito
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <GripVertical className="text-gray-400" size={16} />
                    <span className="text-sm font-medium text-gray-700">
                      Hito {milestone.orderNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="ml-auto text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={milestone.name}
                        onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                        className="input-field"
                        placeholder="Ej: Entrevista inicial"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                        className="input-field"
                        placeholder="Descripción del hito..."
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={milestone.isPaymentRequired}
                          onChange={(e) => handleMilestoneChange(index, 'isPaymentRequired', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Requiere pago
                        </span>
                      </label>
                    </div>

                    {milestone.isPaymentRequired && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad sugerida (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={milestone.defaultPaymentAmount || ''}
                          onChange={(e) => handleMilestoneChange(index, 'defaultPaymentAmount', parseFloat(e.target.value) || undefined)}
                          className="input-field"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceModal;
