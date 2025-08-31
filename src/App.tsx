import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ServicesPage from './pages/ServicesPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header onMenuToggle={toggleSidebar} />
          
          {/* Contenido de la página */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/cases" element={<div className="p-8 text-center text-gray-500">Página de Casos - En desarrollo</div>} />
              <Route path="/tasks" element={<div className="p-8 text-center text-gray-500">Página de Tareas - En desarrollo</div>} />
              <Route path="/documents" element={<div className="p-8 text-center text-gray-500">Página de Documentos - En desarrollo</div>} />
              <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Página de Configuración - En desarrollo</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
