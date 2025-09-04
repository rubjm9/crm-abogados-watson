import { supabase } from './supabase';
import { 
  LawyerPayment, 
  GeneralExpense, 
  MonthlySummary, 
  WorkHours,
  CreateLawyerPaymentForm,
  CreateGeneralExpenseForm,
  CreateWorkHoursForm
} from '../types';

export const accountingService = {
  // ===== PAGOS A ABOGADOS =====
  
  // Obtener pagos de un abogado
  async getLawyerPayments(lawyerId?: string, month?: string): Promise<LawyerPayment[]> {
    let query = supabase
      .from('lawyer_payments')
      .select(`
        *,
        lawyer:users(firstName, lastName, email)
      `)
      .order('month', { ascending: false });

    if (lawyerId) {
      query = query.eq('lawyerId', lawyerId);
    }
    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lawyer payments:', error);
      throw new Error('Error al obtener pagos de abogados');
    }

    return data || [];
  },

  // Crear pago a abogado
  async createLawyerPayment(paymentData: CreateLawyerPaymentForm): Promise<LawyerPayment> {
    const { data, error } = await supabase
      .from('lawyer_payments')
      .insert([{
        ...paymentData,
        isPaid: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select(`
        *,
        lawyer:users(firstName, lastName, email)
      `)
      .single();

    if (error) {
      console.error('Error creating lawyer payment:', error);
      throw new Error('Error al crear pago de abogado');
    }

    return data;
  },

  // Marcar pago como realizado
  async markPaymentAsPaid(paymentId: string): Promise<LawyerPayment> {
    const { data, error } = await supabase
      .from('lawyer_payments')
      .update({
        isPaid: true,
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select(`
        *,
        lawyer:users(firstName, lastName, email)
      `)
      .single();

    if (error) {
      console.error('Error marking payment as paid:', error);
      throw new Error('Error al marcar pago como realizado');
    }

    return data;
  },

  // Calcular pago por comisión
  async calculateCommissionPayment(lawyerId: string, month: string): Promise<number> {
    const { data: cases, error } = await supabase
      .from('cases')
      .select('totalPrice, pricePaid')
      .eq('assignedLawyerId', lawyerId)
      .eq('status', 'cerrado')
      .gte('endDate', `${month}-01`)
      .lt('endDate', `${month}-32`);

    if (error) {
      console.error('Error calculating commission:', error);
      throw new Error('Error al calcular comisión');
    }

    const totalEarned = cases?.reduce((sum, caseItem) => sum + (caseItem.pricePaid || 0), 0) || 0;
    
    // Obtener porcentaje de comisión del abogado
    const { data: lawyer } = await supabase
      .from('users')
      .select('commissionPercentage')
      .eq('id', lawyerId)
      .single();

    const commissionPercentage = lawyer?.commissionPercentage || 0;
    return (totalEarned * commissionPercentage) / 100;
  },

  // ===== GASTOS GENERALES =====

  // Obtener gastos generales
  async getGeneralExpenses(month?: string): Promise<GeneralExpense[]> {
    let query = supabase
      .from('general_expenses')
      .select('*')
      .order('month', { ascending: false });

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching general expenses:', error);
      throw new Error('Error al obtener gastos generales');
    }

    return data || [];
  },

  // Crear gasto general
  async createGeneralExpense(expenseData: CreateGeneralExpenseForm): Promise<GeneralExpense> {
    const { data, error } = await supabase
      .from('general_expenses')
      .insert([{
        ...expenseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating general expense:', error);
      throw new Error('Error al crear gasto general');
    }

    return data;
  },

  // ===== HORAS TRABAJADAS =====

  // Obtener horas trabajadas
  async getWorkHours(lawyerId?: string, caseId?: string, month?: string): Promise<WorkHours[]> {
    let query = supabase
      .from('work_hours')
      .select(`
        *,
        lawyer:users(firstName, lastName),
        case:cases(caseNumber, title)
      `)
      .order('date', { ascending: false });

    if (lawyerId) {
      query = query.eq('lawyerId', lawyerId);
    }
    if (caseId) {
      query = query.eq('caseId', caseId);
    }
    if (month) {
      query = query.gte('date', `${month}-01`).lt('date', `${month}-32`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching work hours:', error);
      throw new Error('Error al obtener horas trabajadas');
    }

    return data || [];
  },

  // Registrar horas trabajadas
  async createWorkHours(hoursData: CreateWorkHoursForm): Promise<WorkHours> {
    const { data, error } = await supabase
      .from('work_hours')
      .insert([{
        ...hoursData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select(`
        *,
        lawyer:users(firstName, lastName),
        case:cases(caseNumber, title)
      `)
      .single();

    if (error) {
      console.error('Error creating work hours:', error);
      throw new Error('Error al registrar horas trabajadas');
    }

    return data;
  },

  // Calcular pago por horas
  async calculateHourlyPayment(lawyerId: string, month: string): Promise<number> {
    const { data: hours, error } = await supabase
      .from('work_hours')
      .select('hours')
      .eq('lawyerId', lawyerId)
      .eq('isBillable', true)
      .gte('date', `${month}-01`)
      .lt('date', `${month}-32`);

    if (error) {
      console.error('Error calculating hourly payment:', error);
      throw new Error('Error al calcular pago por horas');
    }

    const totalHours = hours?.reduce((sum, hour) => sum + hour.hours, 0) || 0;
    
    // Obtener tarifa por hora del abogado
    const { data: lawyer } = await supabase
      .from('users')
      .select('hourlyRate')
      .eq('id', lawyerId)
      .single();

    const hourlyRate = lawyer?.hourlyRate || 0;
    return totalHours * hourlyRate;
  },

  // ===== RESUMEN MENSUAL =====

  // Generar resumen mensual
  async generateMonthlySummary(month: string): Promise<MonthlySummary> {
    const year = parseInt(month.split('-')[0]);
    const monthNumber = parseInt(month.split('-')[1]);

    // Calcular ingresos totales
    const { data: cases } = await supabase
      .from('cases')
      .select('totalPrice, pricePaid')
      .gte('startDate', `${month}-01`)
      .lt('startDate', `${month}-32`);

    const totalIncome = cases?.reduce((sum, caseItem) => sum + (caseItem.pricePaid || 0), 0) || 0;

    // Calcular pagos a abogados
    const lawyerPayments = await this.getLawyerPayments(undefined, month);
    const totalLawyerPayments = lawyerPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calcular gastos generales
    const generalExpenses = await this.getGeneralExpenses(month);
    const totalGeneralExpenses = generalExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const totalExpenses = totalLawyerPayments + totalGeneralExpenses;
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Contar casos completados y nuevos
    const { data: completedCases } = await supabase
      .from('cases')
      .select('id')
      .eq('status', 'cerrado')
      .gte('endDate', `${month}-01`)
      .lt('endDate', `${month}-32`);

    const { data: newCases } = await supabase
      .from('cases')
      .select('id')
      .gte('startDate', `${month}-01`)
      .lt('startDate', `${month}-32`);

    const summaryData = {
      month,
      year,
      monthNumber,
      totalIncome,
      totalExpenses,
      lawyerPayments: totalLawyerPayments,
      generalExpenses: totalGeneralExpenses,
      netProfit,
      profitMargin,
      casesCompleted: completedCases?.length || 0,
      newCases: newCases?.length || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('monthly_summaries')
      .upsert([summaryData])
      .select()
      .single();

    if (error) {
      console.error('Error generating monthly summary:', error);
      throw new Error('Error al generar resumen mensual');
    }

    return data;
  },

  // Obtener resúmenes mensuales
  async getMonthlySummaries(year?: number): Promise<MonthlySummary[]> {
    let query = supabase
      .from('monthly_summaries')
      .select('*')
      .order('month', { ascending: false });

    if (year) {
      query = query.eq('year', year);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching monthly summaries:', error);
      throw new Error('Error al obtener resúmenes mensuales');
    }

    return data || [];
  },

  // ===== ESTADÍSTICAS Y REPORTES =====

  // Obtener estadísticas de ingresos por servicio
  async getIncomeByService(month?: string): Promise<{
    serviceName: string;
    totalIncome: number;
    caseCount: number;
  }[]> {
    let query = supabase
      .from('cases')
      .select(`
        pricePaid,
        service:services(name)
      `)
      .not('pricePaid', 'is', null);

    if (month) {
      query = query.gte('startDate', `${month}-01`).lt('startDate', `${month}-32`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching income by service:', error);
      throw new Error('Error al obtener ingresos por servicio');
    }

    const serviceStats = new Map<string, { totalIncome: number; caseCount: number }>();

    data?.forEach(caseItem => {
      const serviceName = caseItem.service?.name || 'Sin servicio';
      const current = serviceStats.get(serviceName) || { totalIncome: 0, caseCount: 0 };
      
      serviceStats.set(serviceName, {
        totalIncome: current.totalIncome + (caseItem.pricePaid || 0),
        caseCount: current.caseCount + 1
      });
    });

    return Array.from(serviceStats.entries()).map(([serviceName, stats]) => ({
      serviceName,
      totalIncome: stats.totalIncome,
      caseCount: stats.caseCount
    }));
  },

  // Obtener estadísticas de rendimiento por abogado
  async getLawyerPerformance(month?: string): Promise<{
    lawyerName: string;
    totalIncome: number;
    caseCount: number;
    averageCaseValue: number;
  }[]> {
    let query = supabase
      .from('cases')
      .select(`
        totalPrice,
        pricePaid,
        assignedLawyer:users(firstName, lastName)
      `)
      .not('assignedLawyerId', 'is', null);

    if (month) {
      query = query.gte('startDate', `${month}-01`).lt('startDate', `${month}-32`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lawyer performance:', error);
      throw new Error('Error al obtener rendimiento de abogados');
    }

    const lawyerStats = new Map<string, { totalIncome: number; caseCount: number; totalValue: number }>();

    data?.forEach(caseItem => {
      const lawyerName = caseItem.assignedLawyer ? 
        `${caseItem.assignedLawyer.firstName} ${caseItem.assignedLawyer.lastName}` : 'Sin asignar';
      
      const current = lawyerStats.get(lawyerName) || { totalIncome: 0, caseCount: 0, totalValue: 0 };
      
      lawyerStats.set(lawyerName, {
        totalIncome: current.totalIncome + (caseItem.pricePaid || 0),
        caseCount: current.caseCount + 1,
        totalValue: current.totalValue + (caseItem.totalPrice || 0)
      });
    });

    return Array.from(lawyerStats.entries()).map(([lawyerName, stats]) => ({
      lawyerName,
      totalIncome: stats.totalIncome,
      caseCount: stats.caseCount,
      averageCaseValue: stats.caseCount > 0 ? stats.totalValue / stats.caseCount : 0
    }));
  },

  // Obtener datos para gráficos de ingresos mensuales
  async getMonthlyIncomeData(year: number): Promise<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }[]> {
    const summaries = await this.getMonthlySummaries(year);
    
    return summaries.map(summary => ({
      month: summary.month,
      income: summary.totalIncome,
      expenses: summary.totalExpenses,
      profit: summary.netProfit
    }));
  }
};
