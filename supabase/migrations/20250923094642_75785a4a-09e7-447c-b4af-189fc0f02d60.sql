-- Fix infinite recursion in contact_account_relationships RLS policy
-- Create a security definer function to check account permissions without triggering RLS

-- First, create a security definer function to check if user can manage an account
CREATE OR REPLACE FUNCTION public.can_manage_account_relationship(user_id uuid, target_account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contact_account_relationships car
    WHERE car.account_id = target_account_id 
      AND car.contact_id = user_id 
      AND (car.relationship_type IN ('owner', 'admin') OR car.can_manage_account = true)
  )
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Account admins can manage relationships" ON public.contact_account_relationships;

-- Create a new policy using the security definer function
CREATE POLICY "Account admins can manage relationships" 
ON public.contact_account_relationships 
FOR ALL 
USING (
  public.can_manage_account_relationship(auth.uid(), account_id)
);