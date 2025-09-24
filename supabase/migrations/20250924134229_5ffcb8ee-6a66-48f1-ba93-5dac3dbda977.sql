-- Make customer_id nullable to support both individual and account orders
ALTER TABLE public.orders ALTER COLUMN customer_id DROP NOT NULL;