import { supabase } from './supabase';
import { Client, CreateClientForm } from '../types';

export const clientService = {
  // Obtener todos los clientes
  async getAllClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar los datos de Supabase al formato de nuestro tipo Client
      return data?.map(client => ({
        id: client.id,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone || '',
        nationality: client.nationality,
        status: client.status,
        expedientNumber: client.expedient_number,
        birthDate: client.birth_date,
        preferredLanguage: client.preferred_language || 'Español',
        countryOfOrigin: client.country_of_origin,
        cityOfResidence: client.city_of_residence || '',
        createdAt: client.created_at,
        updatedAt: client.updated_at,
        notes: client.notes || '',
        address: client.address || '',
        passportNumber: client.passport_number || ''
      })) || [];
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Obtener un cliente por ID
  async getClientById(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone || '',
        nationality: data.nationality,
        status: data.status,
        expedientNumber: data.expedient_number,
        birthDate: data.birth_date,
        preferredLanguage: data.preferred_language || 'Español',
        countryOfOrigin: data.country_of_origin,
        cityOfResidence: data.city_of_residence || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        notes: data.notes || '',
        address: data.address || '',
        passportNumber: data.passport_number || ''
      };
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw error;
    }
  },

  // Crear un nuevo cliente
  async createClient(clientData: CreateClientForm): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          first_name: clientData.firstName,
          last_name: clientData.lastName,
          email: clientData.email,
          phone: clientData.phone || null,
          nationality: clientData.nationality,
          status: clientData.status,
          birth_date: clientData.birthDate || null,
          preferred_language: clientData.preferredLanguage,
          country_of_origin: clientData.countryOfOrigin,
          city_of_residence: clientData.cityOfResidence || null,
          address: clientData.address || null,
          passport_number: clientData.passportNumber || null,
          notes: clientData.notes || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone || '',
        nationality: data.nationality,
        status: data.status,
        expedientNumber: data.expedient_number,
        birthDate: data.birth_date,
        preferredLanguage: data.preferred_language || 'Español',
        countryOfOrigin: data.country_of_origin,
        cityOfResidence: data.city_of_residence || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        notes: data.notes || '',
        address: data.address || '',
        passportNumber: data.passport_number || ''
      };
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  // Actualizar un cliente
  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    try {
      const updateData: any = {};
      
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.nationality) updateData.nationality = updates.nationality;
      if (updates.status) updateData.status = updates.status;
      if (updates.birthDate !== undefined) updateData.birth_date = updates.birthDate;
      if (updates.preferredLanguage) updateData.preferred_language = updates.preferredLanguage;
      if (updates.countryOfOrigin) updateData.country_of_origin = updates.countryOfOrigin;
      if (updates.cityOfResidence !== undefined) updateData.city_of_residence = updates.cityOfResidence;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.passportNumber !== undefined) updateData.passport_number = updates.passportNumber;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone || '',
        nationality: data.nationality,
        status: data.status,
        expedientNumber: data.expedient_number,
        birthDate: data.birth_date,
        preferredLanguage: data.preferred_language || 'Español',
        countryOfOrigin: data.country_of_origin,
        cityOfResidence: data.city_of_residence || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        notes: data.notes || '',
        address: data.address || '',
        passportNumber: data.passport_number || ''
      };
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  },

  // Eliminar un cliente
  async deleteClient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
  }
};
