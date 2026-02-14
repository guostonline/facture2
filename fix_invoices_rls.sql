-- Fix RLS policy for 'invoices' table to allow admins to update status
-- This script updates the Row Level Security (RLS) policy for the 'invoices' table.

BEGIN;

-- Enable RLS just in case
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable access for users based on user_id" ON invoices;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON invoices;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON invoices;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON invoices;
DROP POLICY IF EXISTS "Policy for invoices" ON invoices;
DROP POLICY IF EXISTS "Enable all access for invoice owners and admins" ON invoices;

-- Create comprehensive policy for ALL operations
CREATE POLICY "Enable all access for invoice owners and admins" ON invoices
FOR ALL
USING (
  -- User owns the invoice
  (auth.uid() = user_id)
  OR 
  -- User is an admin
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
)
WITH CHECK (
  -- User owns the invoice
  (auth.uid() = user_id)
  OR 
  -- User is an admin
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);

COMMIT;
