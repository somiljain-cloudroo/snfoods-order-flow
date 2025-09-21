import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

type Account = {
  id: string;
  name: string;
  account_number: string;
  account_type: 'business' | 'individual' | 'government';
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_id?: string;
  payment_terms: number;
  credit_limit: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
};

type ContactAccountRelationship = {
  id: string;
  contact_id: string;
  account_id: string;
  relationship_type: 'owner' | 'admin' | 'member' | 'viewer';
  can_place_orders: boolean;
  can_view_orders: boolean;
  can_manage_account: boolean;
  is_primary_contact: boolean;
  created_at: string;
  account: Account;
};

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [relationships, setRelationships] = useState<ContactAccountRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserAccounts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch contact-account relationships with account details
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('contact_account_relationships')
        .select(`
          *,
          account:accounts(*)
        `)
        .eq('contact_id', user.id);

      if (relationshipsError) throw relationshipsError;

      const typedRelationships = relationshipsData as ContactAccountRelationship[];
      setRelationships(typedRelationships);

      // Extract accounts from relationships
      const accountsData = typedRelationships.map(rel => rel.account);
      setAccounts(accountsData);

    } catch (err) {
      console.error('Error fetching user accounts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getAccountsWhereCanPlaceOrders = () => {
    return relationships
      .filter(rel => rel.can_place_orders)
      .map(rel => rel.account);
  };

  const getAccountRelationship = (accountId: string) => {
    return relationships.find(rel => rel.account_id === accountId);
  };

  const canPlaceOrdersForAccount = (accountId: string) => {
    const relationship = getAccountRelationship(accountId);
    return relationship?.can_place_orders || false;
  };

  const canViewOrdersForAccount = (accountId: string) => {
    const relationship = getAccountRelationship(accountId);
    return relationship?.can_view_orders || false;
  };

  const canManageAccount = (accountId: string) => {
    const relationship = getAccountRelationship(accountId);
    return relationship?.can_manage_account || 
           ['owner', 'admin'].includes(relationship?.relationship_type || '');
  };

  return {
    accounts,
    relationships,
    loading,
    error,
    refetch: fetchUserAccounts,
    getAccountsWhereCanPlaceOrders,
    getAccountRelationship,
    canPlaceOrdersForAccount,
    canViewOrdersForAccount,
    canManageAccount,
  };
}