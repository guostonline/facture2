-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Users table (Public profile linked to Auth)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  city text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Users
alter table public.users enable row level security;

-- Users policies
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using ( true );

create policy "Users can insert their own profile"
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

-- Create Invoices table
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  invoice_number text,
  store_name text,
  invoice_date date,
  total_amount decimal(10,2),
  tax_amount decimal(10,2),
  discount_amount decimal(10,2),
  image_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  promotion_mechanism text,
  original_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Invoices
alter table public.invoices enable row level security;

-- Invoices policies
create policy "Users can view their own invoices"
  on public.invoices for select
  using ( auth.uid() = user_id );

create policy "Admins can view all invoices"
  on public.invoices for select
  using ( exists (select 1 from public.users where id = auth.uid() and role = 'admin') );

create policy "Users can insert their own invoices"
  on public.invoices for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own invoices"
  on public.invoices for update
  using ( auth.uid() = user_id );

-- Create Invoice Items table
create table public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text,
  quantity decimal(10,2),
  unit_price decimal(10,2),
  amount decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Invoice Items
alter table public.invoice_items enable row level security;

-- Invoice Items policies
create policy "Users can view their own invoice items"
  on public.invoice_items for select
  using ( 
    exists ( 
      select 1 from public.invoices 
      where id = invoice_items.invoice_id and user_id = auth.uid() 
    ) 
  );

create policy "Admins can view all invoice items"
  on public.invoice_items for select
  using ( 
    exists (
      select 1 from public.users 
      where id = auth.uid() and role = 'admin'
    ) 
  );

create policy "Users can insert their own invoice items"
  on public.invoice_items for insert
  with check ( 
    exists ( 
      select 1 from public.invoices 
      where id = invoice_items.invoice_id and user_id = auth.uid() 
    ) 
  );

-- Storage Bucket Setup (You might need to do this in the UI manually if SQL fails)
insert into storage.buckets (id, name)
values ('invoices', 'invoices')
on conflict do nothing;

create policy "Invoice images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'invoices' );

create policy "Users can upload invoice images"
  on storage.objects for insert
  with check ( bucket_id = 'invoices' and auth.uid() = owner );

create policy "Users can update their own invoice images"
  on storage.objects for update
  using ( bucket_id = 'invoices' and auth.uid() = owner );
