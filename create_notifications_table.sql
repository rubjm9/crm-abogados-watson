-- Script para crear solo la tabla de notificaciones
-- Ejecutar este script en Supabase SQL Editor

-- Tabla de notificaciones
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

-- Función para updated_at (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_updated_at') THEN
        CREATE TRIGGER update_notifications_updated_at 
            BEFORE UPDATE ON notifications 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insertar algunas notificaciones de ejemplo
INSERT INTO notifications (user_id, type, title, message, priority, related_id, related_type) VALUES
((SELECT id FROM users WHERE email = 'abogado1@abogadoswatson.com' LIMIT 1), 
 'payment_due', 'Pago Pendiente', 'El cliente Juan Pérez tiene un pago pendiente de 1200€', 'high',
 (SELECT id FROM clients WHERE email = 'juan.perez@email.com' LIMIT 1), 'client'),

((SELECT id FROM users WHERE email = 'abogado2@abogadoswatson.com' LIMIT 1), 
 'milestone_due', 'Hito Pendiente', 'El hito "Evaluación Elegibilidad" del cliente María González está pendiente', 'medium',
 (SELECT id FROM clients WHERE email = 'maria.gonzalez@email.com' LIMIT 1), 'client'),

((SELECT id FROM users WHERE email = 'abogado1@abogadoswatson.com' LIMIT 1), 
 'client_created', 'Nuevo Cliente', 'Se ha registrado un nuevo cliente: Carlos Rodríguez', 'low',
 (SELECT id FROM clients WHERE email = 'carlos.rodriguez@email.com' LIMIT 1), 'client')
ON CONFLICT DO NOTHING;
