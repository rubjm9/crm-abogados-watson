import React, { useState, useEffect } from 'react';
import { NotificationSettings, UpdateNotificationSettingsForm } from '../types';
import { notificationService } from '../services/notificationService';
import Modal from './Modal';
import { 
  Bell, 
  Mail, 
  Smartphone,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Target,
  User,
  FileText,
  Clock,
  Save,
  X
} from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, userId]);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getUserNotificationSettings(userId);
      setSettings(data);
    } catch (err) {
      setError('Error al cargar la configuración');
      console.error('Error loading notification settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateNotificationSettingsForm, value: any) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;

      if (field === 'notificationTypes') {
        return {
          ...prev,
          notificationTypes: {
            ...prev.notificationTypes,
            ...value
          }
        };
      }

      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setError(null);

    try {
      const updateData: UpdateNotificationSettingsForm = {
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        notificationTypes: settings.notificationTypes,
        emailFrequency: settings.emailFrequency
      };

      await notificationService.updateNotificationSettings(userId, updateData);
      onClose();
    } catch (err) {
      setError('Error al guardar la configuración');
      console.error('Error saving notification settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSettings(null);
    setError(null);
    onClose();
  };

  if (!settings && !isLoading) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Configuración de Notificaciones" maxWidth="max-w-2xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-aw-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando configuración...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : settings ? (
        <div className="space-y-6">
          {/* Métodos de Notificación */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Métodos de Notificación</h3>
            
            <div className="space-y-4">
              {/* Notificaciones por Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones por Email</h4>
                    <p className="text-sm text-gray-600">Recibe notificaciones en tu correo electrónico</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aw-primary peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aw-primary"></div>
                </label>
              </div>

              {/* Notificaciones Push */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones Push</h4>
                    <p className="text-sm text-gray-600">Recibe notificaciones en tiempo real en el navegador</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aw-primary peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aw-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Frecuencia de Emails */}
          {settings.emailNotifications && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Frecuencia de Emails</h3>
              
              <div className="space-y-3">
                {[
                  { value: 'immediate', label: 'Inmediato', description: 'Recibe emails tan pronto como ocurran los eventos' },
                  { value: 'daily', label: 'Diario', description: 'Recibe un resumen diario de todas las notificaciones' },
                  { value: 'weekly', label: 'Semanal', description: 'Recibe un resumen semanal de todas las notificaciones' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value={option.value}
                      checked={settings.emailFrequency === option.value}
                      onChange={(e) => handleInputChange('emailFrequency', e.target.value)}
                      className="w-4 h-4 text-aw-primary border-gray-300 focus:ring-aw-primary"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tipos de Notificación */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Notificación</h3>
            
            <div className="space-y-4">
              {[
                { 
                  key: 'caseUpdates', 
                  label: 'Actualizaciones de Casos', 
                  description: 'Cambios de estado, nuevos casos asignados',
                  icon: FileText,
                  color: 'text-blue-500'
                },
                { 
                  key: 'paymentReminders', 
                  label: 'Recordatorios de Pago', 
                  description: 'Pagos pendientes y recordatorios',
                  icon: DollarSign,
                  color: 'text-purple-500'
                },
                { 
                  key: 'milestoneCompletions', 
                  label: 'Hitos Completados', 
                  description: 'Cuando se complete un hito del caso',
                  icon: Target,
                  color: 'text-green-500'
                },
                { 
                  key: 'clientUpdates', 
                  label: 'Actualizaciones de Clientes', 
                  description: 'Nuevos clientes y cambios importantes',
                  icon: User,
                  color: 'text-orange-500'
                },
                { 
                  key: 'systemAlerts', 
                  label: 'Alertas del Sistema', 
                  description: 'Mantenimiento, errores y alertas importantes',
                  icon: AlertTriangle,
                  color: 'text-red-500'
                }
              ].map((type) => {
                const IconComponent = type.icon;
                return (
                  <div key={type.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${type.color}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{type.label}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationTypes[type.key as keyof typeof settings.notificationTypes]}
                        onChange={(e) => handleInputChange('notificationTypes', { [type.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aw-primary peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aw-primary"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuración de WhatsApp */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Integración con WhatsApp</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-green-500">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones por WhatsApp</h4>
                    <p className="text-sm text-gray-600">Recibe notificaciones importantes en WhatsApp</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                  onClick={() => {
                    // TODO: Implementar configuración de WhatsApp
                    alert('Configuración de WhatsApp próximamente');
                  }}
                >
                  Configurar
                </button>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-green-900">WhatsApp Business API</h5>
                    <p className="text-sm text-green-700 mt-1">
                      Integración con WhatsApp Business API para envío automático de notificaciones importantes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-aw-primary rounded-lg hover:bg-aw-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default NotificationSettingsModal;
