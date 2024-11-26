-- Create company_info table
create table public.company_info (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text not null,
  phone text not null,
  email text not null,
  website text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for company_info
alter table public.company_info enable row level security;

-- Only admins can modify company info
create policy "Only admins can modify company info"
  on public.company_info for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Anyone can view company info
create policy "Anyone can view company info"
  on public.company_info for select
  using (true);

-- Create storage bucket for company assets
insert into storage.buckets (id, name)
values ('company-assets', 'company-assets');

-- Set up storage policies
create policy "Anyone can view company assets"
  on storage.objects for select
  using ( bucket_id = 'company-assets' );

create policy "Only admins can upload company assets"
  on storage.objects for insert
  with check (
    bucket_id = 'company-assets'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );