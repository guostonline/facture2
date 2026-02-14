-- Fix RLS policy for invoice_items to allow admins to edit items
-- This script updates the Row Level Security (RLS) policy for the 'invoice_items' table.

BEGIN;

-- Enable RLS just in case
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable access for users based on user_id" ON invoice_items;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON invoice_items;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON invoice_items;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON invoice_items;
DROP POLICY IF EXISTS "Policy for invoice_items" ON invoice_items;

-- Drop the new policy if it already exists (to allow re-running this script)
DROP POLICY IF EXISTS "Enable all access for invoice owners and admins" ON invoice_items;

-- Create comprehensive policy for ALL operations (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Enable all access for invoice owners and admins" ON invoice_items
FOR ALL
USING (
  -- User owns the parent invoice
  (auth.uid() = (SELECT user_id FROM invoices WHERE id = invoice_items.invoice_id))
  OR 
  -- User is an admin
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
)
WITH CHECK (
  -- User owns the parent invoice
  (auth.uid() = (SELECT user_id FROM invoices WHERE id = invoice_items.invoice_id))
  OR 
  -- User is an admin
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);

COMMIT;
