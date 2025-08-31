# CRM Abogados Watson

Un sistema de gestión de relaciones con clientes (CRM) moderno y elegante diseñado específicamente para firmas de abogados especializadas en extranjería en España.

## 🚀 Características

- **Diseño Moderno**: Interfaz elegante y profesional con atención especial al UX/UI
- **Responsive**: Optimizado para dispositivos móviles y de escritorio
- **Gestión de Clientes**: Sistema completo de gestión de cartera de clientes
- **Dashboard Intuitivo**: Resumen visual de la actividad y estadísticas
- **Filtros Avanzados**: Búsqueda y filtrado eficiente de información
- **Navegación Intuitiva**: Sidebar responsive con navegación clara
- **Base de Datos en Tiempo Real**: Integración con Supabase para persistencia de datos
- **Números de Expediente Automáticos**: Sistema de numeración secuencial desde 300

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
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
   git clone https://github.com/rubjm9/crm-abogados-watson.git
   cd crm-abogados-watson
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

4. **Configurar la base de datos**
   - Ve a tu [dashboard de Supabase](https://supabase.com/dashboard)
   - Crea un nuevo proyecto
   - Ve al SQL Editor y ejecuta el script de configuración de la base de datos
   - (El script se encuentra en la documentación de configuración)

5. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Sidebar.tsx     # Barra lateral de navegación
│   ├── Header.tsx      # Header principal
│   ├── ClientCard.tsx  # Tarjeta de cliente
│   └── CreateClientModal.tsx # Modal de creación de clientes
├── pages/              # Páginas de la aplicación
│   ├── DashboardPage.tsx  # Página principal
│   └── ClientsPage.tsx    # Listado de clientes
├── services/           # Servicios y API calls
│   ├── supabase.ts     # Configuración de Supabase
│   └── clientService.ts # Servicios para clientes
├── hooks/              # Hooks personalizados
│   └── useSupabase.ts  # Hook para conexión con Supabase
├── types/              # Definiciones de tipos TypeScript
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
- Información de contacto y expediente

### CreateClientModal
- Formulario completo para crear nuevos clientes
- Validación en tiempo real
- Campos obligatorios y opcionales
- Asignación automática de número de expediente

### Dashboard
- Estadísticas en tiempo real
- Actividad reciente
- Resumen de casos por tipo

## 🔧 Configuración de Supabase

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL y la anon key

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 3. Ejecutar Script de Base de Datos
Ve al SQL Editor de Supabase y ejecuta el script de configuración que incluye:
- Tabla de usuarios/abogados
- Tabla de clientes con todos los campos
- Tabla de servicios para gestionar casos
- Tabla de gastos asociados a servicios
- Tabla de actividades para el feed
- Triggers para cálculos automáticos

## 📱 Características Responsive

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Sidebar Colapsable**: Se oculta automáticamente en pantallas pequeñas
- **Grid Adaptativo**: Las tarjetas se ajustan según el tamaño de pantalla
- **Touch Friendly**: Botones y controles optimizados para pantallas táctiles

## 🎯 Funcionalidades Implementadas

### ✅ Completadas
- [x] Dashboard con estadísticas
- [x] Gestión completa de clientes (CRUD)
- [x] Formulario de creación de clientes
- [x] Filtros y búsqueda de clientes
- [x] Números de expediente automáticos
- [x] Conexión con Supabase
- [x] Diseño responsive
- [x] Validación de formularios

### 🔄 En Desarrollo
- [ ] Gestión de servicios/casos
- [ ] Sistema de gastos
- [ ] Feed de actividades
- [ ] Gestión de documentos
- [ ] Sistema de tareas
- [ ] Autenticación de usuarios

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
- **Repositorio**: [https://github.com/rubjm9/crm-abogados-watson.git](https://github.com/rubjm9/crm-abogados-watson.git)

## 🆘 Soporte

Si tienes alguna pregunta o necesitas ayuda, por favor:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**Nota**: Este CRM está diseñado específicamente para las necesidades de Abogados Watson, pero puede ser adaptado para otras firmas legales con modificaciones menores.
