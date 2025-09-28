import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Account {
  id: string;
  account_number: string | null;
  name: string;
  account_type: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_country: string | null;
  billing_postal_code: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_country: string | null;
  shipping_postal_code: string | null;
  credit_limit: number;
  payment_terms: number;
  is_active: boolean;
  notes: string | null;
  tax_id: string | null;
}

export const AccountManagement = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    account_type: "business",
    email: "",
    phone: "",
    website: "",
    billing_address: "",
    billing_city: "",
    billing_state: "",
    billing_country: "",
    billing_postal_code: "",
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_country: "",
    shipping_postal_code: "",
    credit_limit: "",
    payment_terms: "30",
    notes: "",
    tax_id: "",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      account_type: "business",
      email: "",
      phone: "",
      website: "",
      billing_address: "",
      billing_city: "",
      billing_state: "",
      billing_country: "",
      billing_postal_code: "",
      shipping_address: "",
      shipping_city: "",
      shipping_state: "",
      shipping_country: "",
      shipping_postal_code: "",
      credit_limit: "",
      payment_terms: "30",
      notes: "",
      tax_id: "",
    });
    setEditingAccount(null);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      account_type: account.account_type,
      email: account.email || "",
      phone: account.phone || "",
      website: account.website || "",
      billing_address: account.billing_address || "",
      billing_city: account.billing_city || "",
      billing_state: account.billing_state || "",
      billing_country: account.billing_country || "",
      billing_postal_code: account.billing_postal_code || "",
      shipping_address: account.shipping_address || "",
      shipping_city: account.shipping_city || "",
      shipping_state: account.shipping_state || "",
      shipping_country: account.shipping_country || "",
      shipping_postal_code: account.shipping_postal_code || "",
      credit_limit: account.credit_limit.toString(),
      payment_terms: account.payment_terms.toString(),
      notes: account.notes || "",
      tax_id: account.tax_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const accountData = {
        name: formData.name,
        account_type: formData.account_type,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
        billing_address: formData.billing_address || null,
        billing_city: formData.billing_city || null,
        billing_state: formData.billing_state || null,
        billing_country: formData.billing_country || null,
        billing_postal_code: formData.billing_postal_code || null,
        shipping_address: formData.shipping_address || null,
        shipping_city: formData.shipping_city || null,
        shipping_state: formData.shipping_state || null,
        shipping_country: formData.shipping_country || null,
        shipping_postal_code: formData.shipping_postal_code || null,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        payment_terms: parseInt(formData.payment_terms),
        notes: formData.notes || null,
        tax_id: formData.tax_id || null,
      };

      let error;
      if (editingAccount) {
        ({ error } = await supabase
          .from("accounts")
          .update(accountData)
          .eq("id", editingAccount.id));
      } else {
        ({ error } = await supabase
          .from("accounts")
          .insert(accountData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Account ${editingAccount ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error("Error saving account:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingAccount ? 'update' : 'create'} account`,
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (accountId: string) => {
    if (!confirm("Are you sure you want to deactivate this account?")) return;

    try {
      const { error } = await supabase
        .from("accounts")
        .update({ is_active: false })
        .eq("id", accountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account deactivated successfully",
      });

      fetchAccounts();
    } catch (error) {
      console.error("Error deactivating account:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate account",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Account Management</h2>
          <p className="text-muted-foreground">
            Manage your business accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAccounts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? "Edit Account" : "Add New Account"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the account details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Account Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select 
                      value={formData.account_type} 
                      onValueChange={(value) => setFormData({ ...formData, account_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tax_id">Tax ID</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <h4 className="font-semibold mb-3">Billing Address</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="billing_address">Address</Label>
                      <Input
                        id="billing_address"
                        value={formData.billing_address}
                        onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_city">City</Label>
                      <Input
                        id="billing_city"
                        value={formData.billing_city}
                        onChange={(e) => setFormData({ ...formData, billing_city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_state">State</Label>
                      <Input
                        id="billing_state"
                        value={formData.billing_state}
                        onChange={(e) => setFormData({ ...formData, billing_state: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_country">Country</Label>
                      <Input
                        id="billing_country"
                        value={formData.billing_country}
                        onChange={(e) => setFormData({ ...formData, billing_country: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_postal_code">Postal Code</Label>
                      <Input
                        id="billing_postal_code"
                        value={formData.billing_postal_code}
                        onChange={(e) => setFormData({ ...formData, billing_postal_code: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="credit_limit">Credit Limit</Label>
                    <Input
                      id="credit_limit"
                      type="number"
                      step="0.01"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_terms">Payment Terms (days)</Label>
                    <Input
                      id="payment_terms"
                      type="number"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAccount ? "Update Account" : "Create Account"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.account_number || "N/A"}
                  </TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell className="capitalize">{account.account_type}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>${account.credit_limit.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {account.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {accounts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No accounts found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};