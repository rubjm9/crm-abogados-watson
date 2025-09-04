import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Globe, FileText, Save, Loader2 } from 'lucide-react';
import { CreateClientForm, User as UserType, CaseType, Client } from '../types';
import { clientService } from '../services/clientService';
import Modal from './Modal';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client?: Client) => void;
}

const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated
}) => {
  const [formData, setFormData] = useState<CreateClientForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    status: 'active',
    birthDate: '',
    preferredLanguage: 'Español',
    countryOfOrigin: '',
    cityOfResidence: '',
    address: '',
    passportNumber: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<UserType[]>([]);
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [phonePrefix, setPhonePrefix] = useState<string>('+34');

  // Cargar usuarios y tipos de casos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadCaseTypes();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      // TODO: Implementar userService
      // const data = await userService.getAllUsers();
      // setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const loadCaseTypes = async () => {
    try {
      // TODO: Implementar caseTypeService
      // const data = await caseTypeService.getAllCaseTypes();
      // setCaseTypes(data);
    } catch (error) {
      console.error('Error cargando tipos de casos:', error);
    }
  };

  const handleInputChange = (field: keyof CreateClientForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'Los apellidos son obligatorios';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
    if (!formData.nationality.trim()) newErrors.nationality = 'La nacionalidad es obligatoria';
    if (!formData.countryOfOrigin.trim()) newErrors.countryOfOrigin = 'El país de origen es obligatorio';

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload: CreateClientForm = {
        ...formData,
        phone: formData.phone ? `${phonePrefix} ${formData.phone}`.trim() : ''
      };

      const created = await clientService.createClient(payload);
      
      // Limpiar formulario
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        status: 'active',
        birthDate: '',
        preferredLanguage: 'Español',
        countryOfOrigin: '',
        cityOfResidence: '',
        address: '',
        passportNumber: '',
        notes: ''
      });
      setPhonePrefix('+34');
      
      onClientCreated(created);
      onClose();
    } catch (error) {
      console.error('Error creando cliente:', error);
      setErrors({ submit: 'Error al crear el cliente. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo cliente"
      maxWidth="max-w-4xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-aw-primary bg-opacity-10 rounded-lg flex items-center justify-center">
          <User className="w-6 h-6 text-aw-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Añade un nuevo cliente al sistema</p>
        </div>
      </div>

      <form id="create-client-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-aw-primary" />
              Información personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del cliente"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Apellidos del cliente"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="email@ejemplo.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        id="phonePrefix"
                        value={phonePrefix}
                        onChange={(e) => setPhonePrefix(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                      >
                        <option value="+34">+34 España</option>
                        <option value="+33">+33 Francia</option>
                        <option value="+49">+49 Alemania</option>
                        <option value="+44">+44 Reino Unido</option>
                        <option value="+39">+39 Italia</option>
                        <option value="+351">+351 Portugal</option>
                        <option value="+1">+1 EE.UU./Canadá</option>
                        <option value="+52">+52 México</option>
                        <option value="+57">+57 Colombia</option>
                        <option value="+58">+58 Venezuela</option>
                        <option value="+51">+51 Perú</option>
                        <option value="+56">+56 Chile</option>
                        <option value="+54">+54 Argentina</option>
                        <option value="+55">+55 Brasil</option>
                        <option value="+90">+90 Turquía</option>
                        <option value="+7">+7 Rusia</option>
                        <option value="+86">+86 China</option>
                        <option value="+91">+91 India</option>
                        <option value="+98">+98 Irán</option>
                        <option value="+971">+971 EAU</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                      placeholder="612 345 678"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-2">Idioma preferido</label>
                <select
                  id="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                >
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Persa">Persa</option>
                  <option value="Francés">Francés</option>
                  <option value="Alemán">Alemán</option>
                  <option value="Italiano">Italiano</option>
                  <option value="Portugués">Portugués</option>
                  <option value="Ruso">Ruso</option>
                  <option value="Chino">Chino</option>
                  <option value="Árabe">Árabe</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información de Nacionalidad y Ubicación */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-aw-primary" />
              Nacionalidad y ubicación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">Nacionalidad *</label>
                <input
                  id="nationality"
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                    errors.nationality ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Colombiana, Venezolana, etc."
                />
                {errors.nationality && (
                  <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>
                )}
              </div>

              <div>
                <label htmlFor="countryOfOrigin" className="block text-sm font-medium text-gray-700 mb-2">País de origen *</label>
                <input
                  id="countryOfOrigin"
                  type="text"
                  value={formData.countryOfOrigin}
                  onChange={(e) => handleInputChange('countryOfOrigin', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary ${
                    errors.countryOfOrigin ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Colombia, Venezuela, etc."
                />
                {errors.countryOfOrigin && (
                  <p className="mt-1 text-sm text-red-600">{errors.countryOfOrigin}</p>
                )}
              </div>

              <div>
                <label htmlFor="cityOfResidence" className="block text-sm font-medium text-gray-700 mb-2">Ciudad de residencia</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="cityOfResidence"
                    type="text"
                    value={formData.cityOfResidence}
                    onChange={(e) => handleInputChange('cityOfResidence', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                    placeholder="Ej: Madrid, Barcelona, etc."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                  placeholder="Dirección completa"
                />
              </div>

              <div>
                <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-2">Número de pasaporte/DNI</label>
                <input
                  id="passportNumber"
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                  placeholder="Número de documento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  value="Cliente potencial"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <p className="text-sm text-gray-500 mt-1">
                  El estado se actualiza automáticamente al asignar servicios
                </p>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-aw-primary" />
              Información adicional
            </h3>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                placeholder="Observaciones adicionales sobre el cliente..."
              />
            </div>
          </div>

          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-aw-primary focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-aw-primary text-white rounded-lg hover:bg-aw-primary-dark focus:outline-none focus:ring-2 focus:ring-aw-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Crear cliente</span>
                </>
              )}
            </button>

          </div>
        </form>
      </Modal>
    );
};

export default CreateClientModal;
