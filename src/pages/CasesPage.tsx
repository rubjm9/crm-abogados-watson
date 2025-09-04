import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  User,
  BarChart3
} from 'lucide-react';
import { Case, CreateCaseForm, UpdateCaseForm } from '../types';
import { caseService } from '../services/caseService';
import CaseCard from '../components/CaseCard';
import CreateCaseModal from '../components/CreateCaseModal';
import ViewCaseModal from '../components/ViewCaseModal';
import EditCaseModal from '../components/EditCaseModal';

const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    urgent: 0
  });

  useEffect(() => {
    loadCases();
    loadStats();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchQuery, statusFilter, priorityFilter]);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const casesData = await caseService.getAllCases();
      setCases(casesData);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await caseService.getCaseStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterCases = () => {
    let filtered = cases;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(caseItem =>
        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.client?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.client?.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(caseItem => caseItem.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(caseItem => caseItem.priority === priorityFilter);
    }

    setFilteredCases(filtered);
  };

  const handleCreateCase = async (caseData: CreateCaseForm) => {
    try {
      await caseService.createCase(caseData);
      setIsCreateModalOpen(false);
      await loadCases();
      await loadStats();
    } catch (error) {
      console.error('Error creating case:', error);
    }
  };

  const handleUpdateCase = async (caseId: string, caseData: UpdateCaseForm) => {
    try {
      await caseService.updateCase(caseId, caseData);
      setIsEditModalOpen(false);
      setSelectedCaseId(null);
      await loadCases();
      await loadStats();
    } catch (error) {
      console.error('Error updating case:', error);
    }
  };

  const handleViewCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setIsViewModalOpen(true);
  };

  const handleEditCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setIsEditModalOpen(true);
  };

  const handleDeleteCase = async (caseId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este caso?')) {
      try {
        await caseService.deleteCase(caseId);
        await loadCases();
        await loadStats();
      } catch (error) {
        console.error('Error deleting case:', error);
      }
    }
  };

  const handleStatusChange = async (caseId: string, status: Case['status']) => {
    try {
      await caseService.updateCaseStatus(caseId, status);
      await loadCases();
      await loadStats();
    } catch (error) {
      console.error('Error updating case status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abierto':
        return 'bg-blue-100 text-blue-800';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'cerrado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de casos</h1>
          <p className="text-gray-600">Administra y da seguimiento a todos los casos legales</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
                        Nuevo caso
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Abiertos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Proceso</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cerrados</p>
              <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgentes</p>
              <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar casos por número, título o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en_proceso">En Proceso</option>
              <option value="cerrado">Cerrado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="w-full md:w-48">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando casos...</span>
          </div>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron casos</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primer caso'}
          </p>
          {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
                          <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-aw-primary text-white rounded-lg hover:bg-aw-primary-dark transition-colors"
              >
                Crear primer caso
              </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseData={caseItem}
              onView={handleViewCase}
              onEdit={handleEditCase}
              onDelete={handleDeleteCase}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      <CreateCaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCase}
        isLoading={isLoading}
      />

      {/* View Case Modal */}
      <ViewCaseModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCaseId(null);
        }}
        caseId={selectedCaseId}
        onEdit={handleEditCase}
        onDelete={handleDeleteCase}
      />

      {/* Edit Case Modal */}
      <EditCaseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCaseId(null);
        }}
        caseId={selectedCaseId}
        onSubmit={handleUpdateCase}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CasesPage;
