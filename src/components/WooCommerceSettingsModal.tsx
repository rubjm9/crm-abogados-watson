import React, { useState, useEffect } from 'react';
import { WooCommerceSyncSettings, UpdateWooCommerceSyncSettingsForm, Service, User } from '../types';
import { woocommerceService } from '../services/woocommerceService';
import { serviceService } from '../services/serviceService';
import { userService } from '../services/userService';
import Modal from './Modal';
import { 
  Settings, 
  Store, 
  Users, 
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  TestTube,
  Link,
  Key,
  Globe
} from 'lucide-react';

interface WooCommerceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WooCommerceSettingsModal: React.FC<WooCommerceSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<WooCommerceSyncSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [settingsData, servicesData, lawyersData] = await Promise.all([
        woocommerceService.getSyncSettings(),
        serviceService.getAllServices(),
        userService.getUsersByRole('lawyer')
      ]);
      
      setSettings(settingsData);
      setServices(servicesData);
      setLawyers(lawyersData);
    } catch (err) {
      setError('Error al cargar la configuración');
      console.error('Error loading WooCommerce settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateWooCommerceSyncSettingsForm, value: any) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
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
      const updateData: UpdateWooCommerceSyncSettingsForm = {
        enabled: settings.enabled,
        autoCreateClients: settings.autoCreateClients,
        autoCreateCases: settings.autoCreateCases,
        defaultServiceId: settings.defaultServiceId,
        defaultLawyerId: settings.defaultLawyerId,
        notificationEmail: settings.notificationEmail,
        webhookUrl: settings.webhookUrl,
        apiKey: settings.apiKey,
        apiSecret: settings.apiSecret,
        storeUrl: settings.storeUrl
      };

      await woocommerceService.updateSyncSettings(updateData);
      
      // Configurar credenciales en el servicio
      if (settings.apiKey && settings.apiSecret && settings.storeUrl) {
        woocommerceService.setCredentials(settings.apiKey, settings.apiSecret, settings.storeUrl);
      }
      
      onClose();
    } catch (err) {
      setError('Error al guardar la configuración');
      console.error('Error saving WooCommerce settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings?.apiKey || !settings?.apiSecret || !settings?.storeUrl) {
      setTestResult('Error: Faltan credenciales de API');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Configurar credenciales temporalmente
      woocommerceService.setCredentials(settings.apiKey, settings.apiSecret, settings.storeUrl);
      
      // Intentar obtener productos para probar la conexión
      const products = await woocommerceService.getWooCommerceProducts();
      
      setTestResult(`✅ Conexión exitosa. Se encontraron ${products.length} productos.`);
    } catch (error) {
      setTestResult(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncTest = async () => {
    if (!settings?.enabled) {
      setTestResult('Error: La sincronización no está habilitada');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await woocommerceService.syncPendingOrders();
      setTestResult(`✅ Sincronización completada. Procesados: ${result.processed}, Errores: ${result.errors}`);
    } catch (error) {
      setTestResult(`❌ Error en sincronización: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClose = () => {
    setSettings(null);
    setError(null);
    setTestResult(null);
    onClose();
  };

  if (!settings && !isLoading) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Configuración de WooCommerce" maxWidth="max-w-4xl">
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
          {/* Estado de la Integración */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de la Integración</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-900">Integración con WooCommerce</h4>
                  <p className="text-sm text-gray-600">Conecta tu tienda WooCommerce con el CRM</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleInputChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aw-primary peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aw-primary"></div>
              </label>
            </div>
          </div>

          {/* Configuración de API */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de API</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="storeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Tienda
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    id="storeUrl"
                    value={settings.storeUrl || ''}
                    onChange={(e) => handleInputChange('storeUrl', e.target.value)}
                    placeholder="https://tu-tienda.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Clave de API
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    id="apiKey"
                    value={settings.apiKey || ''}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700 mb-2">
                  Secreto de API
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    id="apiSecret"
                    value={settings.apiSecret || ''}
                    onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                    placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Webhook (Opcional)
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    id="webhookUrl"
                    value={settings.webhookUrl || ''}
                    onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                    placeholder="https://tu-crm.com/api/webhook/woocommerce"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                  />
                </div>
              </div>
            </div>

            {/* Botón de prueba de conexión */}
            <div className="mt-4">
              <button
                onClick={handleTestConnection}
                disabled={isTesting || !settings.storeUrl || !settings.apiKey || !settings.apiSecret}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Probando...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    Probar Conexión
                  </>
                )}
              </button>
            </div>

            {/* Resultado de la prueba */}
            {testResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                testResult.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {testResult}
              </div>
            )}
          </div>

          {/* Configuración de Automatización */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Automatización</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Crear Clientes Automáticamente</h4>
                    <p className="text-sm text-gray-600">Crear clientes en el CRM cuando se reciba un pedido</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoCreateClients}
                    onChange={(e) => handleInputChange('autoCreateClients', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aw-primary peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aw-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Crear Casos Automáticamente</h4>
                    <p className="text-sm text-gray-600">Crear casos en el CRM cuando se reciba un pedido</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoCreateCases}
                    onChange={(e) => handleInputChange('autoCreateCases', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aw-primary peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aw-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Configuración por Defecto */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración por Defecto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="defaultService" className="block text-sm font-medium text-gray-700 mb-2">
                  Servicio por Defecto
                </label>
                <select
                  id="defaultService"
                  value={settings.defaultServiceId || ''}
                  onChange={(e) => handleInputChange('defaultServiceId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="defaultLawyer" className="block text-sm font-medium text-gray-700 mb-2">
                  Abogado por Defecto
                </label>
                <select
                  id="defaultLawyer"
                  value={settings.defaultLawyerId || ''}
                  onChange={(e) => handleInputChange('defaultLawyerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
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
                <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Notificaciones
                </label>
                <input
                  type="email"
                  id="notificationEmail"
                  value={settings.notificationEmail || ''}
                  onChange={(e) => handleInputChange('notificationEmail', e.target.value)}
                  placeholder="admin@aw-legal.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aw-primary focus:border-aw-primary"
                />
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones</h3>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleSyncTest}
                disabled={isTesting || !settings.enabled}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sincronizar Pedidos
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  // TODO: Abrir página de integraciones
                  window.open('/integrations', '_blank');
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Link className="w-4 h-4" />
                Ver Integraciones
              </button>
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

export default WooCommerceSettingsModal;
