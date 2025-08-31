-- Tabla de servicios (plantillas de servicios)
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Nacionalidad', 'Residencia', 'Visado', 'Otros')),
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  complexity TEXT NOT NULL DEFAULT 'Media' CHECK (complexity IN ('Baja', 'Media', 'Alta')),
  required_documents TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de hitos de servicios
CREATE TABLE service_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  is_payment_required BOOLEAN DEFAULT false,
  default_payment_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, order_number)
);

-- Tabla de servicios asignados a clientes
CREATE TABLE client_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  assigned_lawyer_id UUID REFERENCES users(id),
  custom_price DECIMAL(10,2), -- precio modificado para este cliente específico
  status TEXT NOT NULL DEFAULT 'Abierto' CHECK (status IN ('Abierto', 'En Progreso', 'Completado', 'Cancelado')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de hitos completados por cliente
CREATE TABLE client_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_service_id UUID NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES service_milestones(id),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  payment_amount DECIMAL(10,2), -- cantidad acordada para este hito específico
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_service_id, milestone_id)
);

-- Tabla de gastos suplidos
CREATE TABLE client_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_service_id UUID NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos requeridos por cliente
CREATE TABLE client_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_service_id UUID NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  is_obtained BOOLEAN DEFAULT false,
  obtained_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_milestones_updated_at BEFORE UPDATE ON service_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_services_updated_at BEFORE UPDATE ON client_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_milestones_updated_at BEFORE UPDATE ON client_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_expenses_updated_at BEFORE UPDATE ON client_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON client_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos servicios de ejemplo
INSERT INTO services (name, description, category, base_price, estimated_cost, complexity, required_documents) VALUES
('Residencia por Arraigo Social', 'Procedimiento para obtener residencia por arraigo social', 'Residencia', 1500.00, 300.00, 'Alta', ARRAY['Pasaporte', 'Certificado de empadronamiento', 'Certificado de antecedentes penales', 'Certificado médico']),
('Nacionalidad Española', 'Procedimiento para obtener la nacionalidad española', 'Nacionalidad', 2000.00, 400.00, 'Alta', ARRAY['Pasaporte', 'Certificado de nacimiento', 'Certificado de matrimonio', 'Certificado de antecedentes penales']),
('Visado de Trabajo', 'Visado para trabajar en España', 'Visado', 1200.00, 200.00, 'Media', ARRAY['Pasaporte', 'Contrato de trabajo', 'Certificado médico', 'Certificado de antecedentes penales']),
('Renovación de Residencia', 'Renovación de tarjeta de residencia', 'Residencia', 800.00, 150.00, 'Baja', ARRAY['Pasaporte', 'Tarjeta de residencia actual', 'Certificado de empadronamiento']);

-- Insertar hitos para el servicio de Residencia por Arraigo Social
INSERT INTO service_milestones (service_id, name, description, order_number, is_payment_required, default_payment_amount) VALUES
((SELECT id FROM services WHERE name = 'Residencia por Arraigo Social'), 'Entrevista inicial', 'Primera reunión con el cliente para evaluar el caso', 1, true, 300.00),
((SELECT id FROM services WHERE name = 'Residencia por Arraigo Social'), 'Preparación de documentación', 'Recopilación y preparación de toda la documentación necesaria', 2, false, NULL),
((SELECT id FROM services WHERE name = 'Residencia por Arraigo Social'), 'Presentación de solicitud', 'Presentación oficial de la solicitud ante la administración', 3, true, 600.00),
((SELECT id FROM services WHERE name = 'Residencia por Arraigo Social'), 'Seguimiento administrativo', 'Seguimiento del expediente y comunicación con la administración', 4, false, NULL),
((SELECT id FROM services WHERE name = 'Residencia por Arraigo Social'), 'Resolución favorable', 'Obtención de la resolución favorable', 5, true, 600.00);

-- Insertar hitos para el servicio de Nacionalidad Española
INSERT INTO service_milestones (service_id, name, description, order_number, is_payment_required, default_payment_amount) VALUES
((SELECT id FROM services WHERE name = 'Nacionalidad Española'), 'Evaluación inicial', 'Evaluación de requisitos y documentación necesaria', 1, true, 400.00),
((SELECT id FROM services WHERE name = 'Nacionalidad Española'), 'Preparación de expediente', 'Preparación completa del expediente de nacionalidad', 2, false, NULL),
((SELECT id FROM services WHERE name = 'Nacionalidad Española'), 'Presentación de solicitud', 'Presentación oficial ante el Ministerio de Justicia', 3, true, 800.00),
((SELECT id FROM services WHERE name = 'Nacionalidad Española'), 'Seguimiento del expediente', 'Seguimiento y comunicación con el Ministerio', 4, false, NULL),
((SELECT id FROM services WHERE name = 'Nacionalidad Española'), 'Resolución y juramento', 'Resolución favorable y juramento de la Constitución', 5, true, 800.00);
