# CRM Abogados Watson

Un sistema de gestión de relaciones con clientes (CRM) moderno y elegante diseñado específicamente para firmas de abogados especializadas en extranjería en España.

## 🚀 Características

- **Diseño Moderno**: Interfaz elegante y profesional con atención especial al UX/UI
- **Responsive**: Optimizado para dispositivos móviles y de escritorio
- **Gestión de Clientes**: Sistema completo de gestión de cartera de clientes
- **Dashboard Intuitivo**: Resumen visual de la actividad y estadísticas
- **Filtros Avanzados**: Búsqueda y filtrado eficiente de información
- **Navegación Intuitiva**: Sidebar responsive con navegación clara

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Iconos**: Lucide React
- **Routing**: React Router DOM
- **Base de Datos**: Supabase (PostgreSQL)
- **Utilidades**: date-fns

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase (para la base de datos)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd crm-aw
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Tailwind CSS**
   ```bash
   npx tailwindcss init -p
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Sidebar.tsx     # Barra lateral de navegación
│   ├── Header.tsx      # Header principal
│   └── ClientCard.tsx  # Tarjeta de cliente
├── pages/              # Páginas de la aplicación
│   ├── DashboardPage.tsx  # Página principal
│   └── ClientsPage.tsx    # Listado de clientes
├── types/              # Definiciones de tipos TypeScript
├── hooks/              # Hooks personalizados
├── utils/              # Utilidades y helpers
├── services/           # Servicios y API calls
└── App.tsx             # Componente principal
```

## 🎨 Componentes Principales

### Sidebar
- Navegación principal con iconos intuitivos
- Responsive para dispositivos móviles
- Indicadores de estado activo

### Header
- Barra de búsqueda global
- Notificaciones y perfil de usuario
- Botón de menú para móvil

### ClientCard
- Tarjeta elegante para mostrar información del cliente
- Estados visuales claros (activo, inactivo, pendiente)
- Información de contacto y casos asociados

### Dashboard
- Estadísticas en tiempo real
- Actividad reciente
- Tareas próximas
- Resumen de casos por tipo

## 🔧 Configuración de Supabase

1. Crear una cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. Configurar las variables de entorno:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

4. Crear las tablas necesarias en la base de datos:

```sql
-- Tabla de clientes
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  nationality TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  address TEXT,
  passport_number TEXT,
  assigned_lawyer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tipos de casos
CREATE TABLE case_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  estimated_duration INTEGER,
  complexity TEXT DEFAULT 'media'
);

-- Tabla de casos
CREATE TABLE cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  case_type_id UUID REFERENCES case_types(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'abierto',
  priority TEXT DEFAULT 'media',
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  assigned_lawyer TEXT,
  estimated_completion DATE
);
```

## 📱 Características Responsive

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Sidebar Colapsable**: Se oculta automáticamente en pantallas pequeñas
- **Grid Adaptativo**: Las tarjetas se ajustan según el tamaño de pantalla
- **Touch Friendly**: Botones y controles optimizados para pantallas táctiles

## 🎯 Próximas Funcionalidades

- [ ] Sistema de autenticación de usuarios
- [ ] Gestión completa de casos
- [ ] Sistema de tareas y recordatorios
- [ ] Subida y gestión de documentos
- [ ] Reportes y analytics
- [ ] Integración con calendario
- [ ] Notificaciones en tiempo real
- [ ] API REST completa

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollado para**: Abogados Watson
- **Especialización**: Firma de extranjería en España
- **Contacto**: [Información de contacto]

## 🆘 Soporte

Si tienes alguna pregunta o necesitas ayuda, por favor:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**Nota**: Este CRM está diseñado específicamente para las necesidades de Abogados Watson, pero puede ser adaptado para otras firmas legales con modificaciones menores.
