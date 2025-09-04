import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Calendar,
  BarChart3,
  PieChart,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { accountingService } from '../services/accountingService';
import { MonthlySummary } from '../types';

const AccountingPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [incomeByService, setIncomeByService] = useState<any[]>([]);
  const [lawyerPerformance, setLawyerPerformance] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAccountingData();
  }, [currentMonth, currentYear]);

  const loadAccountingData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar resumen mensual
      const summary = await accountingService.generateMonthlySummary(currentMonth);
      setMonthlySummary(summary);

      // Cargar estadísticas por servicio
      const serviceStats = await accountingService.getIncomeByService(currentMonth);
      setIncomeByService(serviceStats);

      // Cargar rendimiento de abogados
      const lawyerStats = await accountingService.getLawyerPerformance(currentMonth);
      setLawyerPerformance(lawyerStats);

      // Cargar datos mensuales para gráficos
      const monthlyStats = await accountingService.getMonthlyIncomeData(currentYear);
      setMonthlyData(monthlyStats);

    } catch (error) {
      console.error('Error loading accounting data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMonthName = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Cargando datos de contabilidad...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contabilidad</h1>
          <p className="text-gray-600">Gestión financiera y análisis de rentabilidad</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(currentYear, i);
              const monthStr = date.toISOString().slice(0, 7);
              return (
                <option key={monthStr} value={monthStr}>
                  {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </option>
              );
            })}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Resumen Mensual */}
      {monthlySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthlySummary.totalIncome)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gastos Totales</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(monthlySummary.totalExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Beneficio Neto</p>
                <p className={`text-2xl font-bold ${monthlySummary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(monthlySummary.netProfit)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Margen de Beneficio</p>
                <p className={`text-2xl font-bold ${monthlySummary.profitMargin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatPercentage(monthlySummary.profitMargin)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detalles del Mes */}
      {monthlySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Detalles del Mes - {getMonthName(currentMonth)}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Casos Completados:</span>
                <span className="font-medium">{monthlySummary.casesCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nuevos Casos:</span>
                <span className="font-medium">{monthlySummary.newCases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pagos a Abogados:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(monthlySummary.lawyerPayments)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gastos Generales:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(monthlySummary.generalExpenses)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-green-600" />
              Ingresos por Servicio
            </h3>
            <div className="space-y-3">
              {incomeByService.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{service.serviceName}</span>
                    <p className="text-xs text-gray-500">{service.caseCount} casos</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(service.totalIncome)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rendimiento de Abogados */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Rendimiento de Abogados
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Abogado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Casos</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Ingresos</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Valor Promedio</th>
              </tr>
            </thead>
            <tbody>
              {lawyerPerformance.map((lawyer, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{lawyer.lawyerName}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{lawyer.caseCount}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {formatCurrency(lawyer.totalIncome)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatCurrency(lawyer.averageCaseValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de Tendencias */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
          Tendencias Mensuales - {currentYear}
        </h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {monthlyData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t">
                <div 
                  className="bg-green-500 rounded-t"
                  style={{ 
                    height: `${Math.max((data.income / Math.max(...monthlyData.map(d => d.income))) * 100, 5)}%` 
                  }}
                ></div>
              </div>
              <div className="w-full bg-gray-200 rounded-t mt-1">
                <div 
                  className="bg-red-500 rounded-t"
                  style={{ 
                    height: `${Math.max((data.expenses / Math.max(...monthlyData.map(d => d.expenses))) * 100, 5)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                {new Date(data.month + '-01').toLocaleDateString('es-ES', { month: 'short' })}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Ingresos</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Gastos</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="p-6 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Registrar Horas</h3>
          </div>
          <p className="text-sm text-gray-600">Registrar horas trabajadas por abogados</p>
        </button>

        <button className="p-6 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Pagos Abogados</h3>
          </div>
          <p className="text-sm text-gray-600">Gestionar pagos mensuales a abogados</p>
        </button>

        <button className="p-6 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Gastos Generales</h3>
          </div>
          <p className="text-sm text-gray-600">Registrar gastos generales del mes</p>
        </button>
      </div>
    </div>
  );
};

export default AccountingPage;
