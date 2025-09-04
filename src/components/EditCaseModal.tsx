import React, { useEffect, useState } from 'react';
import { Case, UpdateCaseForm } from '../types';
import Modal from './Modal';
import { caseService } from '../services/caseService';
import { clientService } from '../services/clientService';
import { serviceService } from '../services/serviceService';
import { userService } from '../services/userService';
import { Client, Service, User } from '../types';

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string | null;
  onSubmit: (caseId: string, data: UpdateCaseForm) => Promise<void>;
  isLoading?: boolean;
}

const EditCaseModal: React.FC<EditCaseModalProps> = ({
  isOpen,
  onClose,
  caseId,
  onSubmit,
  isLoading = false
}) => {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateCaseForm>({
    clientId: '',
    serviceId: '',
    assignedLawyerId: '',
    totalPrice: 0,
    status: 'abierto',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<UpdateCaseForm>>({});

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && caseId) {
      loadCaseData();
    }
  }, [isOpen, caseId]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [clientsData, servicesData, lawyersData] = await Promise.all([
        clientService.getAllClients(),
        serviceService.getAllServices(),
        userService.getUsersByRole('lawyer')
      ]);
      
      setClients(clientsData);
      setServices(servicesData);
      setLawyers(lawyersData);
    } catch (err) {
      setError('Error al cargar los datos iniciales');
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCaseData = async () => {
    if (!caseId) return;
    
    setIsLoadingData(true);
    setError(null);
    
    try {
      const data = await caseService.getCaseById(caseId);
      setCaseData(data);
      
      // Prellenar el formulario
      setFormData({
        clientId: data.clientId || '',
        serviceId: data.serviceId || '',
        assignedLawyerId: data.assignedLawyerId || '',
        totalPrice: data.totalPrice || 0,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate || '',
        notes: data.notes || ''
      });
    } catch (err) {
      setError('Error al cargar los datos del caso');
      console.error('Error loading case:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof UpdateCaseForm, value: string | number) => {
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

    // Auto-calcular precio si cambia el servicio
    if (field === 'serviceId' && typeof value === 'string') {
      const selectedService = services.find(s => s.id === value);
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          totalPrice: selectedService.basePrice
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateCaseForm> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'El cliente es requerido';
    }
    if (!formData.serviceId) {
      newErrors.serviceId = 'El servicio es requerido';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }
    if (formData.totalPrice < 0) {
      newErrors.totalPrice = 'El precio total debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !caseId) return;

    try {
      await onSubmit(caseId, formData);
      onClose();
    } catch (error) {
      console.error('Error updating case:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      clientId: '',
      serviceId: '',
      assignedLawyerId: '',
      totalPrice: 0,
      status: 'abierto',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setErrors({});
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Caso" maxWidth="max-w-2xl">
      {isLoadingData ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-aw-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando datos del caso...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                errors.clientId ? 'border-red-500' : ''
              }`}
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
            )}
          </div>

          {/* Servicio */}
          <div>
            <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 mb-2">
              Servicio *
            </label>
            <select
              id="serviceId"
              value={formData.serviceId}
              onChange={(e) => handleInputChange('serviceId', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                errors.serviceId ? 'border-red-500' : ''
              }`}
            >
              <option value="">Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.category}
                </option>
              ))}
            </select>
            {errors.serviceId && (
              <p className="mt-1 text-sm text-red-600">{errors.serviceId}</p>
            )}
          </div>

          {/* Abogado Asignado */}
          <div>
            <label htmlFor="assignedLawyerId" className="block text-sm font-medium text-gray-700 mb-2">
              Abogado Asignado
            </label>
            <select
              id="assignedLawyerId"
              value={formData.assignedLawyerId}
              onChange={(e) => handleInputChange('assignedLawyerId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
            >
              <option value="">Sin asignar</option>
              {lawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.firstName} {lawyer.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as Case['status'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
            >
              <option value="abierto">Abierto</option>
              <option value="en_proceso">En Proceso</option>
              <option value="cerrado">Cerrado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Precio Total */}
          <div>
            <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Precio Total (€)
            </label>
            <input
              type="number"
              id="totalPrice"
              value={formData.totalPrice}
              onChange={(e) => handleInputChange('totalPrice', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                errors.totalPrice ? 'border-red-500' : ''
              }`}
            />
            {errors.totalPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.totalPrice}</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.startDate ? 'border-red-500' : ''
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
              placeholder="Notas adicionales sobre el caso..."
            />
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
      )}
    </Modal>
  );
};

export default EditCaseModal;
