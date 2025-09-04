import { supabase } from './supabase';
import { 
  WooCommerceOrder, 
  WooCommerceProduct, 
  WooCommerceIntegration,
  CreateWooCommerceIntegrationForm,
  WooCommerceSyncSettings,
  UpdateWooCommerceSyncSettingsForm,
  Client,
  Case,
  CreateClientForm,
  CreateCaseForm
} from '../types';
import { clientService } from './clientService';
import { caseService } from './caseService';
import { notificationService } from './notificationService';

export const woocommerceService = {
  // Configuración de la API de WooCommerce
  apiKey: '',
  apiSecret: '',
  storeUrl: '',

  // Configurar credenciales de WooCommerce
  setCredentials(apiKey: string, apiSecret: string, storeUrl: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.storeUrl = storeUrl;
  },

  // Obtener configuración de sincronización
  async getSyncSettings(): Promise<WooCommerceSyncSettings | null> {
    const { data, error } = await supabase
      .from('woocommerce_sync_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching WooCommerce sync settings:', error);
      throw new Error('Error al obtener la configuración de sincronización');
    }

    return data;
  },

  // Actualizar configuración de sincronización
  async updateSyncSettings(settings: UpdateWooCommerceSyncSettingsForm): Promise<WooCommerceSyncSettings> {
    const existingSettings = await this.getSyncSettings();

    if (existingSettings) {
      const { data, error } = await supabase
        .from('woocommerce_sync_settings')
        .update({
          ...settings,
          updatedAt: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error updating WooCommerce sync settings:', error);
        throw new Error('Error al actualizar la configuración de sincronización');
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('woocommerce_sync_settings')
        .insert([{
          id: 'default',
          enabled: true,
          autoCreateClients: true,
          autoCreateCases: true,
          ...settings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating WooCommerce sync settings:', error);
        throw new Error('Error al crear la configuración de sincronización');
      }

      return data;
    }
  },

  // Obtener pedidos de WooCommerce
  async getWooCommerceOrders(status?: string, limit = 50): Promise<WooCommerceOrder[]> {
    try {
      const url = `${this.storeUrl}/wp-json/wc/v3/orders`;
      const params = new URLSearchParams({
        consumer_key: this.apiKey,
        consumer_secret: this.apiSecret,
        per_page: limit.toString()
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching WooCommerce orders: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching WooCommerce orders:', error);
      throw new Error('Error al obtener pedidos de WooCommerce');
    }
  },

  // Obtener un pedido específico de WooCommerce
  async getWooCommerceOrder(orderId: number): Promise<WooCommerceOrder> {
    try {
      const url = `${this.storeUrl}/wp-json/wc/v3/orders/${orderId}`;
      const params = new URLSearchParams({
        consumer_key: this.apiKey,
        consumer_secret: this.apiSecret
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching WooCommerce order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching WooCommerce order:', error);
      throw new Error('Error al obtener pedido de WooCommerce');
    }
  },

  // Obtener productos de WooCommerce
  async getWooCommerceProducts(category?: string): Promise<WooCommerceProduct[]> {
    try {
      const url = `${this.storeUrl}/wp-json/wc/v3/products`;
      const params = new URLSearchParams({
        consumer_key: this.apiKey,
        consumer_secret: this.apiSecret,
        per_page: '100'
      });

      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching WooCommerce products: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching WooCommerce products:', error);
      throw new Error('Error al obtener productos de WooCommerce');
    }
  },

  // Buscar cliente por email
  async findClientByEmail(email: string): Promise<Client | null> {
    try {
      const clients = await clientService.getAllClients();
      return clients.find(client => client.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Error finding client by email:', error);
      return null;
    }
  },

  // Crear cliente desde pedido de WooCommerce
  async createClientFromOrder(order: WooCommerceOrder): Promise<Client> {
    try {
      const clientData: CreateClientForm = {
        firstName: order.customer_first_name,
        lastName: order.customer_last_name,
        email: order.customer_email,
        phone: order.customer_phone || '',
        nationality: 'España', // Por defecto, se puede mejorar
        status: 'active',
        preferredLanguage: 'Español',
        countryOfOrigin: order.billing.country,
        cityOfResidence: order.billing.city,
        address: order.billing.address_1,
        notes: `Cliente creado automáticamente desde WooCommerce. Pedido: ${order.order_number}`
      };

      return await clientService.createClient(clientData);
    } catch (error) {
      console.error('Error creating client from order:', error);
      throw error;
    }
  },

  // Crear caso desde pedido de WooCommerce
  async createCaseFromOrder(order: WooCommerceOrder, clientId: string, settings: WooCommerceSyncSettings): Promise<Case> {
    // Mapear productos de WooCommerce a servicios del CRM
    const serviceMapping = await this.getServiceMapping();
    
    const firstProduct = order.line_items[0];
    const serviceId = serviceMapping[firstProduct.product_id] || settings.defaultServiceId;

    if (!serviceId) {
      throw new Error('No se pudo mapear el producto de WooCommerce a un servicio del CRM');
    }

    const caseData: CreateCaseForm = {
      clientId,
      serviceId,
      assignedLawyerId: settings.defaultLawyerId,
      totalPrice: parseFloat(order.total),
      initialPayment: parseFloat(order.total), // Asumimos pago completo
      startDate: new Date().toISOString().split('T')[0],
      notes: `Caso creado automáticamente desde WooCommerce. Pedido: ${order.order_number}. Productos: ${order.line_items.map(item => item.name).join(', ')}`
    };

    return await caseService.createCase(caseData);
  },

  // Obtener mapeo de productos a servicios
  async getServiceMapping(): Promise<Record<number, string>> {
    // Esto se puede configurar en la base de datos
    // Por ahora retornamos un mapeo básico
    return {
      // Ejemplo: product_id: service_id
      // 123: 'service-uuid-1',
      // 456: 'service-uuid-2'
    };
  },

  // Procesar pedido de WooCommerce
  async processWooCommerceOrder(orderId: number): Promise<WooCommerceIntegration> {
    try {
      // Obtener configuración
      const settings = await this.getSyncSettings();
      if (!settings || !settings.enabled) {
        throw new Error('La sincronización con WooCommerce no está habilitada');
      }

      // Obtener pedido de WooCommerce
      const order = await this.getWooCommerceOrder(orderId);

      // Buscar cliente existente por email
      let client = await this.findClientByEmail(order.customer_email);

      // Crear cliente si no existe y está habilitado
      if (!client && settings.autoCreateClients) {
        client = await this.createClientFromOrder(order);
      }

      if (!client) {
        throw new Error('No se pudo encontrar o crear el cliente');
      }

      // Crear caso si está habilitado
      let caseId: string | undefined;
      if (settings.autoCreateCases) {
        const caseData = await this.createCaseFromOrder(order, client.id, settings);
        caseId = caseData.id;
      }

      // Crear registro de integración
      const integrationData: CreateWooCommerceIntegrationForm = {
        orderId: order.id,
        clientId: client.id,
        caseId
      };

      const { data, error } = await supabase
        .from('woocommerce_integrations')
        .insert([{
          ...integrationData,
          status: 'processed',
          processedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select(`
          *,
          client:clients(*),
          case:cases(*)
        `)
        .single();

      if (error) {
        console.error('Error creating WooCommerce integration:', error);
        throw new Error('Error al crear la integración con WooCommerce');
      }

      // Crear notificación
      if (settings.notificationEmail) {
        await notificationService.createNotification({
          userId: settings.notificationEmail,
          title: 'Nuevo Pedido WooCommerce Procesado',
          message: `Se ha procesado el pedido ${order.order_number} de ${order.customer_first_name} ${order.customer_last_name}`,
          type: 'success',
          category: 'system',
          metadata: { orderId: order.id, orderNumber: order.order_number }
        });
      }

      return data;
    } catch (error) {
      console.error('Error processing WooCommerce order:', error);
      
      // Crear registro de error
      const { data } = await supabase
        .from('woocommerce_integrations')
        .insert([{
          orderId,
          clientId: '',
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Error desconocido',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select('*')
        .single();

      throw error;
    }
  },

  // Obtener integraciones
  async getIntegrations(limit = 50): Promise<WooCommerceIntegration[]> {
    const { data, error } = await supabase
      .from('woocommerce_integrations')
      .select(`
        *,
        client:clients(*),
        case:cases(*)
      `)
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching WooCommerce integrations:', error);
      throw new Error('Error al obtener integraciones con WooCommerce');
    }

    return data || [];
  },

  // Obtener estadísticas de integración
  async getIntegrationStats(): Promise<{
    total: number;
    processed: number;
    pending: number;
    errors: number;
    todayProcessed: number;
  }> {
    const integrations = await this.getIntegrations(1000);
    const today = new Date().toDateString();

    const stats = {
      total: integrations.length,
      processed: integrations.filter(i => i.status === 'processed').length,
      pending: integrations.filter(i => i.status === 'pending').length,
      errors: integrations.filter(i => i.status === 'error').length,
      todayProcessed: integrations.filter(i => 
        i.status === 'processed' && 
        new Date(i.processedAt || '').toDateString() === today
      ).length
    };

    return stats;
  },

  // Sincronizar pedidos pendientes
  async syncPendingOrders(): Promise<{
    processed: number;
    errors: number;
    details: string[];
  }> {
    const settings = await this.getSyncSettings();
    if (!settings || !settings.enabled) {
      throw new Error('La sincronización no está habilitada');
    }

    // Obtener pedidos pendientes de WooCommerce
    const pendingOrders = await this.getWooCommerceOrders('processing');
    
    let processed = 0;
    let errors = 0;
    const details: string[] = [];

    for (const order of pendingOrders) {
      try {
        await this.processWooCommerceOrder(order.id);
        processed++;
        details.push(`Pedido ${order.order_number} procesado correctamente`);
      } catch (error) {
        errors++;
        details.push(`Error procesando pedido ${order.order_number}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return { processed, errors, details };
  }
};
