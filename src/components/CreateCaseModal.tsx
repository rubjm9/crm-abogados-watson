import React, { useState, useEffect } from 'react';
import { Save, User, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { CreateCaseForm, Client, Service, User as UserType } from '../types';
import { clientService } from '../services/clientService';
import { serviceService } from '../services/serviceService';
import { userService } from '../services/userService';
import Modal from './Modal';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (caseData: CreateCaseForm) => void;
  isLoading?: boolean;
}

const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateCaseForm>({
    caseNumber: '',
    title: '',
    description: '',
    clientId: '',
    serviceId: '',
    assignedLawyerId: '',
    priority: 'media',
    totalPrice: 0,
    initialPayment: 0,
    estimatedDuration: undefined,
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [lawyers, setLawyers] = useState<UserType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const loadFormData = async () => {
    setIsLoadingData(true);
    try {
      const [clientsData, servicesData, lawyersData] = await Promise.all([
        clientService.getAllClients(),
        serviceService.getAllServices(),
        userService.getUsersByRole('abogado')
      ]);

      setClients(clientsData);
      setServices(servicesData);
      setLawyers(lawyersData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Debe seleccionar un cliente';
    }

    if (!formData.serviceId) {
      newErrors.serviceId = 'Debe seleccionar un servicio';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (formData.totalPrice <= 0) {
      newErrors.totalPrice = 'El precio total debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Solo enviar los campos necesarios para client_services
      const caseData = {
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        assignedLawyerId: formData.assignedLawyerId,
        totalPrice: formData.totalPrice,
        startDate: formData.startDate,
        notes: formData.notes || ''
      };
      onSubmit(caseData as CreateCaseForm);
      
      // Resetear el formulario
      setFormData({
        caseNumber: '',
        title: '',
        description: '',
        clientId: '',
        serviceId: '',
        assignedLawyerId: '',
        priority: 'media',
        totalPrice: 0,
        initialPayment: 0,
        estimatedDuration: undefined,
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof CreateCaseForm, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Si se selecciona un servicio, cargar automáticamente el precio base
    if (field === 'serviceId' && value) {
      const selectedService = services.find(service => service.id === value);
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          totalPrice: selectedService.basePrice,
          initialPayment: Math.round(selectedService.basePrice / 2 * 100) / 100 // Mitad del precio, redondeado a 2 decimales
        }));
      }
    }
  };

  const generateCaseNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const caseNumber = `CASE-${year}-${random}`;
    handleInputChange('caseNumber', caseNumber);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear nuevo caso"
      maxWidth="max-w-3xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-aw-primary bg-opacity-10 rounded-lg">
          <FileText className="w-6 h-6 text-aw-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Complete la información del caso</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Número de caso *
              </label>
              <input
                id="caseNumber"
                type="text"
                value={formData.caseNumber}
                onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.caseNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: CASE-2024-001"
              />
              {errors.caseNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.caseNumber}</p>
              )}
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={generateCaseNumber}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Generar
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
                        <label htmlFor="caseTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Título del caso *
            </label>
            <input
              id="caseTitle"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: Solicitud de Nacionalidad Española"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="caseDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="caseDescription"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Descripción detallada del caso..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Client and Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                          <label htmlFor="caseClient" className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              id="caseClient"
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.clientId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoadingData}
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName} - {client.email}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
              )}
            </div>

            <div>
                          <label htmlFor="caseService" className="block text-sm font-medium text-gray-700 mb-2">
              Servicio *
            </label>
            <select
              id="caseService"
                value={formData.serviceId}
                onChange={(e) => handleInputChange('serviceId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.serviceId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoadingData}
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
          </div>

          {/* Assigned Lawyer and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                          <label htmlFor="caseLawyer" className="block text-sm font-medium text-gray-700 mb-2">
              Abogado asignado (opcional)
            </label>
            <select
              id="caseLawyer"
                value={formData.assignedLawyerId || ''}
                onChange={(e) => handleInputChange('assignedLawyerId', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                disabled={isLoadingData}
              >
                <option value="">Seleccionar abogado</option>
                {lawyers.map((lawyer) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.firstName} {lawyer.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
                          <label htmlFor="casePriority" className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              id="casePriority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* Dates and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                          <label htmlFor="caseStartDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de inicio *
            </label>
            <input
              id="caseStartDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
                          <label htmlFor="caseDuration" className="block text-sm font-medium text-gray-700 mb-2">
              Duración estimada (meses)
            </label>
            <input
              id="caseDuration"
                type="number"
                value={formData.estimatedDuration || ''}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: 6"
              />
              {errors.estimatedDuration && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedDuration}</p>
              )}
            </div>

            <div>
                          <label htmlFor="caseTotalPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Precio total *
            </label>
            <input
              id="caseTotalPrice"
                type="number"
                value={formData.totalPrice}
                onChange={(e) => handleInputChange('totalPrice', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.totalPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: 2500.00"
              />
              {errors.totalPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.totalPrice}</p>
              )}
            </div>

            <div>
                          <label htmlFor="caseInitialPayment" className="block text-sm font-medium text-gray-700 mb-2">
              Pago inicial
            </label>
            <input
              id="caseInitialPayment"
                type="number"
                value={formData.initialPayment || ''}
                onChange={(e) => handleInputChange('initialPayment', e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                max={formData.totalPrice}
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                  errors.initialPayment ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: 500.00"
              />
              {errors.initialPayment && (
                <p className="mt-1 text-sm text-red-600">{errors.initialPayment}</p>
              )}
            </div>

            <div className="flex items-end">
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                Restante: €{(formData.totalPrice - (formData.initialPayment || 0)).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
                        <label htmlFor="caseNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales
            </label>
            <textarea
              id="caseNotes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
              placeholder="Información adicional relevante..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingData}
              className="flex items-center gap-2 px-4 py-2 bg-aw-primary text-white rounded-lg hover:bg-aw-primary-dark transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear caso
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    );
};

export default CreateCaseModal;
