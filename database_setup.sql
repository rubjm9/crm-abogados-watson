-- Script completo para crear todas las tablas del CRM
-- Ejecutar este script en Supabase SQL Editor

-- 1. Tabla de usuarios (abogados y personal)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ceo', 'cmo', 'abogado', 'administrativo', 'marketing')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    -- Contabilidad
    billing_type VARCHAR(20) DEFAULT 'salario' CHECK (billing_type IN ('comision', 'horas', 'salario')),
    commission_percentage DECIMAL(5,2), -- Solo para tipo comisión
    hourly_rate DECIMAL(10,2), -- Solo para tipo horas
    monthly_salary DECIMAL(10,2), -- Solo para tipo salario
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    country_of_origin VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    status VARCHAR(20) DEFAULT 'potential' CHECK (status IN ('potential', 'active', 'inactive')),
    expedient_number VARCHAR(50) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de servicios (plantillas de servicios)
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de hitos de servicios
CREATE TABLE IF NOT EXISTS service_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    order_number INTEGER NOT NULL,
    is_payment_required BOOLEAN DEFAULT false,
    default_payment_amount DECIMAL(10,2),
    payment_percentage DECIMAL(5,2), -- Porcentaje del total del servicio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de servicios asignados a clientes
CREATE TABLE IF NOT EXISTS client_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    assigned_lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    custom_price DECIMAL(10,2) NOT NULL,
    person_count INTEGER DEFAULT 1,
    initial_payment DECIMAL(10,2) DEFAULT 0,
    amount_owed DECIMAL(10,2) GENERATED ALWAYS AS (custom_price - initial_payment) STORED,
    status VARCHAR(20) DEFAULT 'Abierto' CHECK (status IN ('Abierto', 'En Proceso', 'Cerrado', 'Cancelado')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de hitos de clientes
CREATE TABLE IF NOT EXISTS client_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_service_id UUID REFERENCES client_services(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES service_milestones(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    payment_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de gastos de clientes
CREATE TABLE IF NOT EXISTS client_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_service_id UUID REFERENCES client_services(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(100),
    is_billable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabla de documentos
CREATE TABLE IF NOT EXISTS client_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    client_service_id UUID REFERENCES client_services(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    category VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabla de actividades/notas
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    client_service_id UUID REFERENCES client_services(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'document', 'milestone')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('payment_due', 'milestone_due', 'client_created', 'service_assigned', 'milestone_completed', 'document_required', 'system')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    related_id UUID, -- ID del cliente, servicio, etc.
    related_type VARCHAR(50), -- Tipo de relación: 'client', 'service', 'milestone', 'document'
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers a todas las tablas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_milestones_updated_at BEFORE UPDATE ON service_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_services_updated_at BEFORE UPDATE ON client_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_milestones_updated_at BEFORE UPDATE ON client_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_expenses_updated_at BEFORE UPDATE ON client_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON client_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar expedient_number automáticamente
CREATE OR REPLACE FUNCTION generate_expedient_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expedient_number IS NULL THEN
        NEW.expedient_number := 'EXP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(CAST(nextval('expedient_seq') AS TEXT), 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Secuencia para expedient_number
CREATE SEQUENCE IF NOT EXISTS expedient_seq START 1;

-- Trigger para expedient_number
CREATE TRIGGER generate_expedient_number_trigger 
    BEFORE INSERT ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION generate_expedient_number();

-- Insertar datos de ejemplo
INSERT INTO users (email, first_name, last_name, role, billing_type, monthly_salary) VALUES
('ceo@abogadoswatson.com', 'María', 'García', 'ceo', 'salario', 5000),
('abogado1@abogadoswatson.com', 'Ana', 'López', 'abogado', 'comision', 15),
('abogado2@abogadoswatson.com', 'Carlos', 'Martínez', 'abogado', 'horas', 50),
('admin@abogadoswatson.com', 'Laura', 'Fernández', 'administrativo', 'salario', 2500),
('marketing@abogadoswatson.com', 'David', 'Rodríguez', 'marketing', 'salario', 3000)
ON CONFLICT (email) DO NOTHING;

INSERT INTO services (name, description, category, base_price) VALUES
('Residencia por Trabajo', 'Tramitación de residencia por cuenta ajena', 'Extranjería', 1500),
('Residencia por Cuenta Propia', 'Tramitación de residencia por cuenta propia', 'Extranjería', 2000),
('Nacionalidad Española', 'Tramitación de nacionalidad por residencia', 'Extranjería', 2500),
('Reagrupación Familiar', 'Tramitación de reagrupación familiar', 'Extranjería', 1800),
('Contrato de Trabajo', 'Elaboración y revisión de contratos laborales', 'Laboral', 800),
('Despido Improcedente', 'Asesoramiento en casos de despido', 'Laboral', 1200),
('Divorcio Mutuo Acuerdo', 'Tramitación de divorcio de mutuo acuerdo', 'Civil', 1000),
('Herencia', 'Tramitación de herencias y testamentos', 'Civil', 1500)
ON CONFLICT DO NOTHING;

-- Insertar hitos para los servicios
INSERT INTO service_milestones (service_id, name, description, order_number, is_payment_required, default_payment_amount, payment_percentage) VALUES
-- Residencia por Trabajo
((SELECT id FROM services WHERE name = 'Residencia por Trabajo'), 'Primera Consulta', 'Evaluación inicial del caso', 1, true, 300, 20),
((SELECT id FROM services WHERE name = 'Residencia por Trabajo'), 'Preparación Documentación', 'Recopilación y preparación de documentos', 2, false, 0, 0),
((SELECT id FROM services WHERE name = 'Residencia por Trabajo'), 'Presentación Solicitud', 'Presentación de la solicitud oficial', 3, true, 600, 40),
((SELECT id FROM services WHERE name = 'Residencia por Trabajo'), 'Seguimiento', 'Seguimiento del expediente', 4, false, 0, 0),
((SELECT id FROM services WHERE name = 'Residencia por Trabajo'), 'Resolución', 'Resolución final del expediente', 5, true, 600, 40),

-- Nacionalidad Española
((SELECT id FROM services WHERE name = 'Nacionalidad Española'), 'Evaluación Elegibilidad', 'Verificación de requisitos', 1, true, 500, 20),
((SELECT id FROM services WHERE name = 'Nacionalidad Española'), 'Preparación Documentación', 'Recopilación de documentos necesarios', 2, true, 750, 30),
((SELECT id FROM services WHERE name = 'Nacionalidad Española'), 'Presentación Solicitud', 'Presentación oficial de la solicitud', 3, true, 750, 30),
((SELECT id FROM services WHERE name = 'Nacionalidad Española'), 'Seguimiento Expediente', 'Seguimiento hasta resolución', 4, true, 500, 20)
ON CONFLICT DO NOTHING;

-- Insertar algunos clientes de ejemplo
INSERT INTO clients (first_name, last_name, email, phone, country_of_origin, city, status) VALUES
('Juan', 'Pérez', 'juan.perez@email.com', '+34612345678', 'Colombia', 'Madrid', 'active'),
('María', 'González', 'maria.gonzalez@email.com', '+34623456789', 'Venezuela', 'Barcelona', 'potential'),
('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '+34634567890', 'Argentina', 'Valencia', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insertar algunos servicios asignados de ejemplo
INSERT INTO client_services (client_id, service_id, assigned_lawyer_id, custom_price, status) VALUES
((SELECT id FROM clients WHERE email = 'juan.perez@email.com'), 
 (SELECT id FROM services WHERE name = 'Residencia por Trabajo'),
 (SELECT id FROM users WHERE email = 'abogado1@abogadoswatson.com'),
 1500, 'Abierto'),
 
((SELECT id FROM clients WHERE email = 'maria.gonzalez@email.com'), 
 (SELECT id FROM services WHERE name = 'Nacionalidad Española'),
 (SELECT id FROM users WHERE email = 'abogado2@abogadoswatson.com'),
 2500, 'En Proceso')
ON CONFLICT DO NOTHING;

-- Insertar algunos hitos completados de ejemplo
INSERT INTO client_milestones (client_service_id, milestone_id, is_completed, completed_at, payment_amount) VALUES
((SELECT cs.id FROM client_services cs 
  JOIN clients c ON cs.client_id = c.id 
  WHERE c.email = 'juan.perez@email.com' LIMIT 1),
 (SELECT sm.id FROM service_milestones sm 
  JOIN services s ON sm.service_id = s.id 
  WHERE s.name = 'Residencia por Trabajo' AND sm.order_number = 1 LIMIT 1),
   true, NOW() - INTERVAL '5 days', 300)
ON CONFLICT DO NOTHING;

-- Insertar algunas notificaciones de ejemplo
INSERT INTO notifications (user_id, type, title, message, priority, related_id, related_type) VALUES
((SELECT id FROM users WHERE email = 'abogado1@abogadoswatson.com'), 
 'payment_due', 'Pago Pendiente', 'El cliente Juan Pérez tiene un pago pendiente de 1200€', 'high',
 (SELECT id FROM clients WHERE email = 'juan.perez@email.com'), 'client'),

((SELECT id FROM users WHERE email = 'abogado2@abogadoswatson.com'), 
 'milestone_due', 'Hito Pendiente', 'El hito "Evaluación Elegibilidad" del cliente María González está pendiente', 'medium',
 (SELECT id FROM clients WHERE email = 'maria.gonzalez@email.com'), 'client'),

((SELECT id FROM users WHERE email = 'abogado1@abogadoswatson.com'), 
 'client_created', 'Nuevo Cliente', 'Se ha registrado un nuevo cliente: Carlos Rodríguez', 'low',
 (SELECT id FROM clients WHERE email = 'carlos.rodriguez@email.com'), 'client')
ON CONFLICT DO NOTHING;
