-- First, drop existing tables (in correct order due to foreign key constraints)
drop table if exists public.inspection_items;
drop table if exists public.inspections;
drop table if exists public.clients;
drop table if exists public.user_roles;
drop table if exists public.company_info;
drop table if exists public.notifications;

-- Create company_info table
create table public.company_info (
  id uuid default uuid_generate_v4() primary key,
  name text,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_roles table
create table public.user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  role text check (role in ('admin', 'tech')) not null,
  phone_number text,
  notify_renewals boolean default false,
  notify_inspections boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint user_roles_user_id_key unique (user_id)
);

-- Create clients table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  contact_person text not null,
  email text,
  phone text,
  contract_start date not null,
  contract_end date not null,
  contract_amount decimal(10,2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create inspections table
create table public.inspections (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients not null,
  inspection_date date not null,
  location text not null,
  inspector text not null,
  status text check (status in ('scheduled', 'completed', 'failed')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users
);

-- Create inspection_items table
create table public.inspection_items (
  id uuid default uuid_generate_v4() primary key,
  inspection_id uuid references public.inspections not null,
  item_type text not null,
  floor text not null,
  room text not null,
  equipment_type text not null,
  status text check (status in ('pass', 'fail', 'no-access')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text check (type in ('renewal', 'inspection')) not null,
  reference_id uuid not null,
  scheduled_for timestamp with time zone not null,
  sent_at timestamp with time zone,
  status text check (status in ('pending', 'sent', 'failed')) not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table public.company_info enable row level security;
alter table public.clients enable row level security;
alter table public.inspections enable row level security;
alter table public.inspection_items enable row level security;
alter table public.notifications enable row level security;

-- Create indexes
create index idx_inspections_client_id on public.inspections(client_id);
create index idx_inspections_date on public.inspections(inspection_date);
create index idx_inspection_items_inspection_id on public.inspection_items(inspection_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_scheduled_for on public.notifications(scheduled_for);
create index idx_notifications_status on public.notifications(status);

-- Set up RLS policies for all tables
create policy "Allow authenticated users to view company info"
  on public.company_info for select
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to insert company info"
  on public.company_info for insert
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to update company info"
  on public.company_info for update
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to view clients"
  on public.clients for select
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to modify clients"
  on public.clients for all
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to view inspections"
  on public.inspections for select
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to modify inspections"
  on public.inspections for all
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to view inspection items"
  on public.inspection_items for select
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to modify inspection items"
  on public.inspection_items for all
  using (auth.role() = 'authenticated');

-- Insert sample data
insert into public.clients (name, contact_person, email, phone, contract_start, contract_end, contract_amount) values
  ('Acme Corporation', 'John Smith', 'john@acme.com', '555-0100', '2024-01-01', '2024-12-31', 5000.00),
  ('TechStart Inc', 'Sarah Johnson', 'sarah@techstart.com', '555-0101', '2024-02-15', '2025-02-14', 3500.00);

-- Insert sample inspection
insert into public.inspections (client_id, inspection_date, location, inspector, status, notes)
select 
  id as client_id,
  '2024-03-15'::date as inspection_date,
  'Main Building' as location,
  'John Doe' as inspector,
  'completed' as status,
  'Regular annual inspection' as notes
from public.clients
where name = 'Acme Corporation';

-- Insert sample inspection items
insert into public.inspection_items (inspection_id, item_type, floor, room, equipment_type, status, notes)
select 
  i.id as inspection_id,
  'Fire Extinguisher' as item_type,
  'Floor 1' as floor,
  'Room 101' as room,
  '5ABC' as equipment_type,
  'pass' as status,
  'Annual inspection completed' as notes
from public.inspections i
limit 1;

-- Create storage bucket for company assets
insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', true);

-- Set up storage policies
create policy "Allow authenticated users to view company assets"
  on storage.objects for select
  using ( bucket_id = 'company-assets' and auth.role() = 'authenticated' );

create policy "Allow authenticated users to upload company assets"
  on storage.objects for insert
  with check (
    bucket_id = 'company-assets'
    and auth.role() = 'authenticated'
  );