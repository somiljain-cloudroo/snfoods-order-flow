import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Account {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  email: string;
}

interface Relationship {
  id: string;
  account_id: string;
  contact_id: string;
  accounts: { name: string };
  profiles: { email: string };
}

export const AccountContactRelationship: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedContact, setSelectedContact] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: accountsData, error: accountsError } = await supabase.from('accounts').select('id, name');
      if (accountsError) throw accountsError;
      setAccounts(accountsData || []);

      const { data: contactsData, error: contactsError } = await supabase.functions.invoke('get-all-contacts');
      if (contactsError) throw contactsError;
      setContacts(contactsData.map((user: any) => ({ id: user.id, email: user.email })) || []);

      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('contact_account_relationships')
        .select(`id, account_id, contact_id`);
      if (relationshipsError) throw relationshipsError;

      const hydratedRelationships = relationshipsData.map(rel => {
        const account = accountsData.find(acc => acc.id === rel.account_id);
        const contact = contactsData.find(con => con.id === rel.contact_id);
        return {
          ...rel,
          accounts: { name: account?.name || 'Unknown Account' },
          profiles: { email: contact?.email || 'Unknown Contact' },
        };
      });

      console.log('Accounts:', accountsData);
      console.log('Contacts:', contactsData);
      console.log('Relationships:', hydratedRelationships);
      setRelationships(hydratedRelationships || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Failed to fetch data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRelationship = async () => {
    if (!selectedAccount || !selectedContact) {
      toast({ title: "Error", description: "Please select an account and a contact.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from('contact_account_relationships').insert({
        account_id: selectedAccount,
        contact_id: selectedContact,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Relationship added successfully." });
      fetchData();
    } catch (error) {
      console.error('Error adding relationship:', error);
      toast({ title: "Error", description: "Failed to add relationship.", variant: "destructive" });
    }
  };

  const handleRemoveRelationship = async (id: string) => {
    try {
      const { error } = await supabase.from('contact_account_relationships').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Relationship removed successfully." });
      fetchData();
    } catch (error) {
      console.error('Error removing relationship:', error);
      toast({ title: "Error", description: "Failed to remove relationship.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Account-Contact Relationships</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Relationship</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Relationship</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(con => <SelectItem key={con.id} value={con.id}>{con.email}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleAddRelationship}>Add Relationship</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relationships.map((rel) => (
                <TableRow key={rel.id}>
                  <TableCell>{rel.accounts?.name}</TableCell>
                  <TableCell>{rel.profiles?.email}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveRelationship(rel.id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
