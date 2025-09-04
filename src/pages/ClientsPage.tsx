import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, DollarSign, Grid, List } from 'lucide-react';
import { Client } from '../types';
import { clientService } from '../services/clientService';
import { clientServiceService } from '../services/clientServiceService';
import { ClientsTable } from '../components/ClientsTable';
import { ClientCard } from '../components/ClientCard';
import CreateClientModal from '../components/CreateClientModal';
import { AssignServiceModal } from '../components/AssignServiceModal';
import { ClientMilestones } from '../components/ClientMilestones';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignServiceModal, setShowAssignServiceModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [selectedMilestoneClientId, setSelectedMilestoneClientId] = useState<string>('');
  const [selectedMilestoneClientName, setSelectedMilestoneClientName] = useState<string>('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
      setError('');
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.expedientNumber.toString().includes(searchTerm)
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  };

  const handleClientCreated = (client?: Client) => {
    loadClients();
    setShowCreateModal(false);
  };

  const handleAssignService = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
    setShowAssignServiceModal(true);
  };

  const handleServiceAssigned = () => {
    // Recargar clientes para mostrar los nuevos servicios
    loadClients();
  };

  const handleViewDetails = (clientId: string) => {
    // TODO: Implementar vista de detalles del cliente
    console.log('Ver detalles del cliente:', clientId);
  };

  const handleArchive = async (clientId: string) => {
    try {
      await clientService.updateClient(clientId, { status: 'inactive' as any });
      loadClients();
    } catch (e) {
      console.error('Error archivando cliente', e);
    }
  };

  const handleViewMilestones = (clientId: string, clientName: string) => {
    setSelectedMilestoneClientId(clientId);
    setSelectedMilestoneClientName(clientName);
    setShowMilestonesModal(true);
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'potential': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'potential': return 'Cliente potencial';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la cartera de clientes y sus servicios
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 btn-primary px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo cliente</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
          <div className="card">
           <div className="flex items-center">
             <div className="p-2 bg-blue-100 rounded-lg">
               <Filter className="h-6 w-6 text-blue-600" />
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-600">Potenciales</p>
               <p className="text-2xl font-bold text-gray-900">
                 {clients.filter(c => c.status === 'potential').length}
               </p>
             </div>
           </div>
         </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Servicios</p>
              <p className="text-2xl font-bold text-gray-900">
                {/* TODO: Implementar contador de servicios */}
                0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o número de expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="potential">Clientes potenciales</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-aw-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Vista de tabla"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-aw-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Vista de tarjetas"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Clients View */}
      {viewMode === 'table' ? (
        <ClientsTable
          clients={filteredClients}
          onAssignService={handleAssignService}
          onArchive={handleArchive}
          onViewDetails={handleViewDetails}
          onViewMilestones={handleViewMilestones}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onAssignService={() => handleAssignService(client.id, `${client.firstName} ${client.lastName}`)}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Modals */}
              <CreateClientModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onClientCreated={handleClientCreated}
        />

        <AssignServiceModal
          isOpen={showAssignServiceModal}
          onClose={() => setShowAssignServiceModal(false)}
          clientId={selectedClientId}
          clientName={selectedClientName}
          onServiceAssigned={handleServiceAssigned}
        />

        <ClientMilestones
          isOpen={showMilestonesModal}
          onClose={() => setShowMilestonesModal(false)}
          clientId={selectedMilestoneClientId}
          clientName={selectedMilestoneClientName}
        />
    </div>
  );
};

export default ClientsPage;
