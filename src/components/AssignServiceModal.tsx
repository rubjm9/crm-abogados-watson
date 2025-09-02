import React, { useState, useEffect } from 'react';
import { X, Plus, Check, User } from 'lucide-react';
import { Service, CreateClientServiceForm, User as UserType } from '../types';
import { serviceService } from '../services/serviceService';
import { clientServiceService } from '../services/clientServiceService';
import { userService } from '../services/userService';

interface AssignServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName?: string;
  onServiceAssigned: () => void;
}

export const AssignServiceModal: React.FC<AssignServiceModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  onServiceAssigned
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedLawyer, setSelectedLawyer] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [personCount, setPersonCount] = useState<number>(1);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadServices();
      loadUsers();
    }
  }, [isOpen]);

  const loadServices = async () => {
    try {
      const activeServices = await serviceService.getAllServices();
      setServices(activeServices);
      if (activeServices.length > 0) {
        setSelectedService(activeServices[0].id);
        setCustomPrice(activeServices[0].basePrice);
      }
    } catch (err) {
      setError('Error al cargar los servicios');
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      // No mostrar error si no hay usuarios, es opcional
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      setError('Debes seleccionar un servicio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const serviceData: CreateClientServiceForm = {
        clientId,
        serviceId: selectedService,
        assignedLawyerId: selectedLawyer || undefined,
        customPrice,
        personCount,
        initialPayment,
        notes: notes.trim() || undefined
      };

      await clientServiceService.createClientService(serviceData);
      onServiceAssigned();
      onClose();
    } catch (err) {
      setError('Error al asignar el servicio');
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setCustomPrice(service.basePrice);
      setInitialPayment(service.basePrice * 0.5); // 50% inicial por defecto
    }
  };

  const handlePriceChange = (newPrice: number) => {
    setCustomPrice(newPrice);
    setInitialPayment(newPrice * 0.5); // Recalcular pago inicial al cambiar precio
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900" id="assign-service-title">
            Asignar servicio a {clientName || 'cliente'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="serviceId">
              Servicio*
            </label>
            <select
              id="serviceId"
              value={selectedService}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.category}: {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Lawyer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="assignedLawyerId">
              <User className="inline w-4 h-4 mr-1" />
              Abogado responsable
            </label>
            <select
              id="assignedLawyerId"
              value={selectedLawyer}
              onChange={(e) => setSelectedLawyer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sin asignar</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Abogado que se encargará de este servicio
            </p>
          </div>

          {/* Person Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="personCount">
              Número de personas*
            </label>
            <input
              id="personCount"
              type="number"
              value={personCount}
              onChange={(e) => setPersonCount(Number(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Número de personas incluidas en este trámite
            </p>
          </div>

          {/* Custom Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="customPrice">
              Precio total del servicio (EUR) *
            </label>
            <input
              id="customPrice"
              type="number"
              value={customPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {selectedService && (
              <p className="text-sm text-gray-500 mt-1">
                Precio base: {services.find(s => s.id === selectedService)?.basePrice || 0} EUR
              </p>
            )}
          </div>

          {/* Payment Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="initialPayment">
                Pago inicial (EUR) *
              </label>
              <input
                id="initialPayment"
                type="number"
                value={initialPayment}
                onChange={(e) => setInitialPayment(Number(e.target.value))}
                min="0"
                max={customPrice}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Pago que recibe al contratar
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="amountOwed">
                Cantidad adeudada (EUR)
              </label>
              <input
                id="amountOwed"
                type="number"
                value={customPrice - initialPayment}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
              <p className="text-sm text-gray-500 mt-1">
                Resto pendiente de pago
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="notes">
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales sobre este servicio..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Asignando...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Asignar Servicio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
