export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ceo' | 'cmo' | 'abogado' | 'administrativo' | 'marketing';
  avatarUrl?: string;
  isActive: boolean;
  // Contabilidad
  billingType: 'comision' | 'horas' | 'salario';
  commissionPercentage?: number; // Solo para tipo comisión
  hourlyRate?: number; // Solo para tipo horas
  monthlySalary?: number; // Solo para tipo salario
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  status: 'potential' | 'active' | 'inactive';
  expedientNumber: number;
  birthDate?: string;
  preferredLanguage: string;
  countryOfOrigin: string;
  cityOfResidence?: string;
  address?: string;
  passportNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseType {
  id: string;
  name: string;
  description: string;
  category: 'extranjeria' | 'civil' | 'penal' | 'laboral' | 'mercantil' | 'otros';
  estimatedDuration: number; // en meses
  complexity: 'baja' | 'media' | 'alta';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'Nacionalidad' | 'Residencia' | 'Visado' | 'Otros';
  basePrice: number;
  estimatedCost: number;
  complexity: 'Baja' | 'Media' | 'Alta';
  requiredDocuments: string[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceMilestone {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  orderNumber: number;
  isPaymentRequired: boolean;
  defaultPaymentAmount?: number;
  paymentPercentage?: number; // Porcentaje del total del servicio
  createdAt: string;
  updatedAt: string;
}

export interface ClientService {
  id: string;
  clientId: string;
  serviceId: string;
  assignedLawyerId?: string;
  customPrice: number;
  personCount: number;
  initialPayment: number;
  amountOwed: number;
  status: 'Activo' | 'Pausado' | 'Completado' | 'Cancelado';
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  service?: Service;
  client?: Client;
  assignedLawyer?: User;
}

export interface CaseMilestone {
  id: string;
  caseId: string;
  milestoneId: string;
  isCompleted: boolean;
  completedAt?: string;
  paymentAmount?: number;
  paymentPercentage?: number;
  isPaymentCollected: boolean;
  paymentCollectedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  milestone?: ServiceMilestone;
}

export interface ClientExpense {
  id: string;
  clientServiceId: string;
  description: string;
  amount: number;
  expenseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDocument {
  id: string;
  clientServiceId: string;
  documentName: string;
  isObtained: boolean;
  obtainedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  serviceId: string;
  description: string;
  amount: number;
  date: string;
  category: 'tramites' | 'documentos' | 'traducciones' | 'notarios' | 'otros';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  // Relaciones
  service?: Service;
  createdByUser?: User;
}

export interface Activity {
  id: string;
  clientId: string;
  serviceId?: string;
  type: 'nota' | 'documento' | 'cambio_estado' | 'gasto' | 'pago' | 'otro';
  title: string;
  description?: string;
  metadata?: Record<string, any>; // Para información adicional según el tipo
  createdBy: string;
  createdAt: string;
  // Relaciones
  client?: Client;
  service?: Service;
  createdByUser?: User;
}

export interface Document {
  id: string;
  name: string;
  type: 'contrato' | 'expediente' | 'documento_identidad' | 'otros';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  clientId: string;
  serviceId: string;
  assignedLawyerId?: string;
  status: 'abierto' | 'en_proceso' | 'cerrado' | 'cancelado';
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  totalPrice: number;
  pricePaid: number;
  priceRemaining: number;
  estimatedDuration?: number; // en meses
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  client?: Client;
  service?: Service;
  assignedLawyer?: User;
  activities?: Activity[];
  documents?: ClientDocument[];
  milestones?: CaseMilestone[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  serviceId?: string;
  caseId?: string;
  assignedTo: string;
  dueDate: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  createdAt: string;
  completedAt?: string;
}

// Tipos para formularios
export interface CreateClientForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  status: 'potential' | 'active' | 'inactive';
  birthDate?: string;
  preferredLanguage: string;
  countryOfOrigin: string;
  cityOfResidence?: string;
  address?: string;
  passportNumber?: string;
  notes?: string;
}

export interface CreateServiceForm {
  name: string;
  description: string;
  category: 'Nacionalidad' | 'Residencia' | 'Visado' | 'Otros';
  basePrice: number;
  estimatedCost: number;
  complexity: 'Baja' | 'Media' | 'Alta';
  requiredDocuments: string[];
  notes?: string;
  milestones: CreateMilestoneForm[];
}

export interface CreateMilestoneForm {
  name: string;
  description: string;
  orderNumber: number;
  isPaymentRequired: boolean;
  defaultPaymentAmount?: number;
}

export interface CreateClientServiceForm {
  clientId: string;
  serviceId: string;
  assignedLawyerId?: string;
  customPrice: number;
  personCount: number;
  initialPayment: number;
  notes?: string;
  milestones?: CreateMilestoneForm[];
}

export interface CreateCaseMilestoneForm {
  milestoneId: string;
  paymentAmount?: number;
  paymentPercentage?: number;
  notes?: string;
}

// Contabilidad - Formularios
export interface CreateLawyerPaymentForm {
  lawyerId: string;
  month: string;
  year: number;
  monthNumber: number;
  paymentType: 'comision' | 'horas' | 'salario';
  amount: number;
  hoursWorked?: number;
  commissionCases?: string[];
  notes?: string;
}

export interface CreateGeneralExpenseForm {
  month: string;
  year: number;
  monthNumber: number;
  category: 'oficina' | 'marketing' | 'tecnologia' | 'servicios' | 'otros';
  description: string;
  amount: number;
  notes?: string;
}

export interface CreateWorkHoursForm {
  lawyerId: string;
  caseId: string;
  date: string;
  hours: number;
  description: string;
  isBillable: boolean;
}

export interface UpdateUserBillingForm {
  billingType: 'comision' | 'horas' | 'salario';
  commissionPercentage?: number;
  hourlyRate?: number;
  monthlySalary?: number;
}

export interface CreateExpenseForm {
  clientServiceId: string;
  description: string;
  amount: number;
  expenseDate: string;
  notes?: string;
}

export interface CreateCaseForm {
  caseNumber: string;
  title: string;
  description: string;
  clientId: string;
  serviceId: string;
  assignedLawyerId?: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  totalPrice: number;
  initialPayment?: number;
  estimatedDuration?: number;
  startDate: string;
  notes?: string;
}

export interface UpdateCaseForm {
  clientId: string;
  serviceId: string;
  assignedLawyerId?: string;
  totalPrice: number;
  status: 'abierto' | 'en_proceso' | 'cerrado' | 'cancelado';
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Contabilidad - Pagos a Abogados
export interface LawyerPayment {
  id: string;
  lawyerId: string;
  month: string; // YYYY-MM
  year: number;
  monthNumber: number;
  paymentType: 'comision' | 'horas' | 'salario';
  amount: number;
  hoursWorked?: number; // Solo para tipo horas
  commissionCases?: string[]; // IDs de casos para comisión
  notes?: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  lawyer?: User;
}

// Contabilidad - Gastos Generales
export interface GeneralExpense {
  id: string;
  month: string; // YYYY-MM
  year: number;
  monthNumber: number;
  category: 'oficina' | 'marketing' | 'tecnologia' | 'servicios' | 'otros';
  description: string;
  amount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Contabilidad - Resumen Mensual
export interface MonthlySummary {
  id: string;
  month: string; // YYYY-MM
  year: number;
  monthNumber: number;
  totalIncome: number;
  totalExpenses: number;
  lawyerPayments: number;
  generalExpenses: number;
  netProfit: number;
  profitMargin: number; // Porcentaje
  casesCompleted: number;
  newCases: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Contabilidad - Horas Trabajadas
export interface WorkHours {
  id: string;
  lawyerId: string;
  caseId: string;
  date: string;
  hours: number;
  description: string;
  isBillable: boolean;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  lawyer?: User;
  case?: Case;
}

export interface CreateActivityForm {
  clientId: string;
  serviceId?: string;
  caseId?: string;
  type: 'nota' | 'documento' | 'cambio_estado' | 'gasto' | 'pago' | 'otro';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Sistema de Notificaciones
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'milestone';
  category: 'case' | 'payment' | 'milestone' | 'client' | 'system';
  isRead: boolean;
  isEmailSent: boolean;
  metadata?: Record<string, any>; // Datos adicionales como caseId, milestoneId, etc.
  createdAt: string;
  readAt?: string;
  emailSentAt?: string;
  // Relaciones
  user?: User;
  case?: Case;
  client?: Client;
}

export interface CreateNotificationForm {
  userId: string;
  title: string;
  message: string;
  type: Notification['type'];
  category: Notification['category'];
  metadata?: Record<string, any>;
}

export interface UpdateNotificationForm {
  isRead?: boolean;
  isEmailSent?: boolean;
}

// Configuración de notificaciones por usuario
export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationTypes: {
    caseUpdates: boolean;
    paymentReminders: boolean;
    milestoneCompletions: boolean;
    clientUpdates: boolean;
    systemAlerts: boolean;
  };
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationSettingsForm {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  notificationTypes?: {
    caseUpdates?: boolean;
    paymentReminders?: boolean;
    milestoneCompletions?: boolean;
    clientUpdates?: boolean;
    systemAlerts?: boolean;
  };
  emailFrequency?: 'immediate' | 'daily' | 'weekly';
}

// Integración con WooCommerce
export interface WooCommerceOrder {
  id: number;
  order_number: string;
  status: string;
  total: string;
  currency: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone?: string;
  date_created: string;
  date_modified: string;
  line_items: WooCommerceLineItem[];
  billing: WooCommerceBilling;
  shipping?: WooCommerceShipping;
  payment_method: string;
  payment_method_title: string;
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  total: string;
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceBilling {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface WooCommerceShipping {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface WooCommerceMetaData {
  id: number;
  key: string;
  value: any;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  categories: WooCommerceCategory[];
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WooCommerceIntegration {
  id: string;
  orderId: number;
  clientId: string;
  caseId?: string;
  status: 'pending' | 'processed' | 'error';
  processedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  order?: WooCommerceOrder;
  client?: Client;
  case?: Case;
}

export interface CreateWooCommerceIntegrationForm {
  orderId: number;
  clientId: string;
  caseId?: string;
}

export interface WooCommerceSyncSettings {
  id: string;
  enabled: boolean;
  autoCreateClients: boolean;
  autoCreateCases: boolean;
  defaultServiceId?: string;
  defaultLawyerId?: string;
  notificationEmail?: string;
  webhookUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  storeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateWooCommerceSyncSettingsForm {
  enabled?: boolean;
  autoCreateClients?: boolean;
  autoCreateCases?: boolean;
  defaultServiceId?: string;
  defaultLawyerId?: string;
  notificationEmail?: string;
  webhookUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  storeUrl?: string;
}
