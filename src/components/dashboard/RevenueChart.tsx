import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos Mensuales</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No hay datos de ingresos disponibles</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = totalRevenue / data.length;

  // Calcular tendencia
  const recentMonths = data.slice(-2);
  const trend = recentMonths.length >= 2 
    ? recentMonths[1].revenue - recentMonths[0].revenue 
    : 0;
  const trendPercentage = recentMonths[0].revenue > 0 
    ? Math.round((trend / recentMonths[0].revenue) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Ingresos Mensuales</h3>
        <div className="flex items-center space-x-2">
          {trend !== 0 && (
            <>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trendPercentage}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="space-y-4">
        {data.map((item, index) => {
          const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
          
          return (
            <div key={index} className="flex items-end space-x-2">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.revenue.toLocaleString('es-ES')}€
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-aw-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${height}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalRevenue.toLocaleString('es-ES')}€
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Promedio</p>
            <p className="text-lg font-semibold text-gray-900">
              {avgRevenue.toLocaleString('es-ES')}€
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
