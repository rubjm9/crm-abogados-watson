import { supabase } from './supabase';
import { User } from '../types';

export const userService = {
  // Obtener todos los usuarios/abogados
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      avatarUrl: u.avatar_url || undefined,
      isActive: Boolean(u.is_active),
      billingType: u.billing_type || 'salario',
      commissionPercentage: u.commission_percentage || undefined,
      hourlyRate: u.hourly_rate || undefined,
      monthlySalary: u.monthly_salary || undefined,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    } as User));
  },

  // Obtener usuario por ID
  async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      avatarUrl: data.avatar_url || undefined,
      isActive: Boolean(data.is_active),
      billingType: data.billing_type || 'salario',
      commissionPercentage: data.commission_percentage || undefined,
      hourlyRate: data.hourly_rate || undefined,
      monthlySalary: data.monthly_salary || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as User;
  },

  // Crear un nuevo usuario
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        first_name: (userData as any).firstName,
        last_name: (userData as any).lastName,
        role: (userData as any).role,
        avatar_url: (userData as any).avatarUrl || null,
        is_active: (userData as any).isActive ?? true,
        billing_type: (userData as any).billingType || 'salario',
        commission_percentage: (userData as any).commissionPercentage || null,
        hourly_rate: (userData as any).hourlyRate || null,
        monthly_salary: (userData as any).monthlySalary || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      avatarUrl: data.avatar_url || undefined,
      isActive: Boolean(data.is_active),
      billingType: data.billing_type || 'salario',
      commissionPercentage: data.commission_percentage || undefined,
      hourlyRate: data.hourly_rate || undefined,
      monthlySalary: data.monthly_salary || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as User;
  },

  // Actualizar usuario
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const updateData: any = {};
    if (updates.email !== undefined) updateData.email = updates.email;
    if ((updates as any).firstName !== undefined) updateData.first_name = (updates as any).firstName;
    if ((updates as any).lastName !== undefined) updateData.last_name = (updates as any).lastName;
    if ((updates as any).role !== undefined) updateData.role = (updates as any).role;
    if ((updates as any).avatarUrl !== undefined) updateData.avatar_url = (updates as any).avatarUrl;
    if ((updates as any).isActive !== undefined) updateData.is_active = (updates as any).isActive;
    if ((updates as any).billingType !== undefined) updateData.billing_type = (updates as any).billingType;
    if ((updates as any).commissionPercentage !== undefined) updateData.commission_percentage = (updates as any).commissionPercentage;
    if ((updates as any).hourlyRate !== undefined) updateData.hourly_rate = (updates as any).hourlyRate;
    if ((updates as any).monthlySalary !== undefined) updateData.monthly_salary = (updates as any).monthlySalary;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      avatarUrl: data.avatar_url || undefined,
      isActive: Boolean(data.is_active),
      billingType: data.billing_type || 'salario',
      commissionPercentage: data.commission_percentage || undefined,
      hourlyRate: data.hourly_rate || undefined,
      monthlySalary: data.monthly_salary || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as User;
  },

  // Obtener usuarios por rol
  async getUsersByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }

    return (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      avatarUrl: u.avatar_url || undefined,
      isActive: Boolean(u.is_active),
      billingType: u.billing_type || 'salario',
      commissionPercentage: u.commission_percentage || undefined,
      hourlyRate: u.hourly_rate || undefined,
      monthlySalary: u.monthly_salary || undefined,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    } as User));
  }
};
