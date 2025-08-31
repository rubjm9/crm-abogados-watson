export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ceo' | 'cmo' | 'abogado' | 'administrativo' | 'marketing';
  avatarUrl?: string;
  isActive: boolean;
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
  status: 'active' | 'inactive' | 'pending';
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
  clientId: string;
  caseTypeId: string;
  title: string;
  description?: string;
  totalPrice: number;
  initialPayment: number;
  amountOwed: number;
  status: 'activo' | 'finalizado' | 'cancelado' | 'pausado';
  startDate: string;
  endDate?: string;
  assignedLawyer?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  client?: Client;
  caseType?: CaseType;
  assignedLawyerUser?: User;
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

export interface Task {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  serviceId?: string;
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
  status: 'active' | 'inactive' | 'pending';
  birthDate?: string;
  preferredLanguage: string;
  countryOfOrigin: string;
  cityOfResidence?: string;
  address?: string;
  passportNumber?: string;
  notes?: string;
}

export interface CreateServiceForm {
  clientId: string;
  caseTypeId: string;
  title: string;
  description?: string;
  totalPrice: number;
  initialPayment: number;
  startDate: string;
  endDate?: string;
  assignedLawyer?: string;
}

export interface CreateExpenseForm {
  serviceId: string;
  description: string;
  amount: number;
  date: string;
  category: 'tramites' | 'documentos' | 'traducciones' | 'notarios' | 'otros';
  notes?: string;
}

export interface CreateActivityForm {
  clientId: string;
  serviceId?: string;
  type: 'nota' | 'documento' | 'cambio_estado' | 'gasto' | 'pago' | 'otro';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}
