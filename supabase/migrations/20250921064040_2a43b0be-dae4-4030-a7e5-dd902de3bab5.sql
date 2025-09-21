-- Create accounts table for companies/organizations
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  account_number TEXT UNIQUE,
  account_type TEXT NOT NULL DEFAULT 'business' CHECK (account_type IN ('business', 'individual', 'government')),
  billing_address TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  payment_terms INTEGER DEFAULT 30,
  credit_limit NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Update profiles table to be contacts
ALTER TABLE public.profiles 
  ADD COLUMN contact_type TEXT DEFAULT 'primary' CHECK (contact_type IN ('primary', 'billing', 'shipping', 'ordering', 'technical')),
  ADD COLUMN job_title TEXT,
  ADD COLUMN department TEXT;

-- Create contact_account_relationships junction table
CREATE TABLE public.contact_account_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'member' CHECK (relationship_type IN ('owner', 'admin', 'member', 'viewer')),
  can_place_orders BOOLEAN NOT NULL DEFAULT true,
  can_view_orders BOOLEAN NOT NULL DEFAULT true,
  can_manage_account BOOLEAN NOT NULL DEFAULT false,
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, account_id)
);

-- Enable RLS on contact_account_relationships
ALTER TABLE public.contact_account_relationships ENABLE ROW LEVEL SECURITY;

-- Update orders table to support account-based ordering
ALTER TABLE public.orders 
  ADD COLUMN account_id UUID REFERENCES public.accounts(id),
  ADD COLUMN ordered_by_contact_id UUID REFERENCES public.profiles(id);

-- Update the existing customer_id to be the contact who placed the order
UPDATE public.orders SET ordered_by_contact_id = customer_id;

-- Add constraint to ensure either customer_id (individual) or account_id (business) is set
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_customer_or_account_check 
  CHECK ((customer_id IS NOT NULL AND account_id IS NULL) OR (customer_id IS NULL AND account_id IS NOT NULL));

-- Create RLS policies for accounts
CREATE POLICY "Contacts can view their linked accounts" 
ON public.accounts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.contact_account_relationships car 
    WHERE car.account_id = accounts.id 
    AND car.contact_id = auth.uid()
  )
);

CREATE POLICY "Account admins can update their accounts" 
ON public.accounts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.contact_account_relationships car 
    WHERE car.account_id = accounts.id 
    AND car.contact_id = auth.uid()
    AND (car.relationship_type = 'owner' OR car.relationship_type = 'admin' OR car.can_manage_account = true)
  )
);

CREATE POLICY "Sales admins can view all accounts" 
ON public.accounts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('sales_admin', 'admin')
  )
);

CREATE POLICY "Sales admins can manage all accounts" 
ON public.accounts 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('sales_admin', 'admin')
  )
);

-- Create RLS policies for contact_account_relationships
CREATE POLICY "Contacts can view their own relationships" 
ON public.contact_account_relationships 
FOR SELECT 
USING (contact_id = auth.uid());

CREATE POLICY "Account admins can manage relationships" 
ON public.contact_account_relationships 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.contact_account_relationships car 
    WHERE car.account_id = contact_account_relationships.account_id 
    AND car.contact_id = auth.uid()
    AND (car.relationship_type IN ('owner', 'admin') OR car.can_manage_account = true)
  )
);

CREATE POLICY "Sales admins can manage all relationships" 
ON public.contact_account_relationships 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('sales_admin', 'admin')
  )
);

-- Update orders RLS policies for account-based ordering
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

CREATE POLICY "Contacts can view their individual orders" 
ON public.orders 
FOR SELECT 
USING (
  (customer_id IS NOT NULL AND auth.uid() = customer_id) OR
  (account_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.contact_account_relationships car 
    WHERE car.account_id = orders.account_id 
    AND car.contact_id = auth.uid()
    AND car.can_view_orders = true
  ))
);

CREATE POLICY "Contacts can create individual orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  (customer_id IS NOT NULL AND auth.uid() = customer_id AND account_id IS NULL) OR
  (account_id IS NOT NULL AND customer_id IS NULL AND EXISTS (
    SELECT 1 FROM public.contact_account_relationships car 
    WHERE car.account_id = orders.account_id 
    AND car.contact_id = auth.uid()
    AND car.can_place_orders = true
  ) AND auth.uid() = ordered_by_contact_id)
);

-- Update order_items RLS policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;

CREATE POLICY "Contacts can view their order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id 
    AND (
      (o.customer_id IS NOT NULL AND auth.uid() = o.customer_id) OR
      (o.account_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.contact_account_relationships car 
        WHERE car.account_id = o.account_id 
        AND car.contact_id = auth.uid()
        AND car.can_view_orders = true
      ))
    )
  )
);

CREATE POLICY "Contacts can create order items for their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id 
    AND (
      (o.customer_id IS NOT NULL AND auth.uid() = o.customer_id) OR
      (o.account_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.contact_account_relationships car 
        WHERE car.account_id = o.account_id 
        AND car.contact_id = auth.uid()
        AND car.can_place_orders = true
      ))
    )
  )
);

-- Update order_status_history RLS policies
DROP POLICY IF EXISTS "Users can view history for their orders" ON public.order_status_history;

CREATE POLICY "Contacts can view history for their orders" 
ON public.order_status_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_status_history.order_id 
    AND (
      (o.customer_id IS NOT NULL AND auth.uid() = o.customer_id) OR
      (o.account_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.contact_account_relationships car 
        WHERE car.account_id = o.account_id 
        AND car.contact_id = auth.uid()
        AND car.can_view_orders = true
      ))
    )
  )
);

-- Add triggers for accounts
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate account numbers
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT AS $$
DECLARE
  account_count INTEGER;
  account_number TEXT;
BEGIN
  SELECT COUNT(*) INTO account_count FROM public.accounts;
  account_number := 'ACC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((account_count + 1)::TEXT, 4, '0');
  RETURN account_number;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Insert sample accounts
INSERT INTO public.accounts (name, account_number, account_type, billing_address, billing_city, billing_state, billing_postal_code, billing_country, phone, email) VALUES
('ABC Corporation', 'ACC-2025-0001', 'business', '123 Business Ave', 'Melbourne', 'VIC', '3000', 'Australia', '+61 3 1234 5678', 'orders@abccorp.com.au'),
('XYZ Retail Group', 'ACC-2025-0002', 'business', '456 Commerce St', 'Sydney', 'NSW', '2000', 'Australia', '+61 2 9876 5432', 'purchasing@xyzretail.com.au'),
('Government Services Dept', 'ACC-2025-0003', 'government', '789 Official Blvd', 'Canberra', 'ACT', '2600', 'Australia', '+61 2 6123 4567', 'procurement@gov.au');