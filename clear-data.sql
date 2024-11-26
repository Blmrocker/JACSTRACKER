-- First delete inspection items due to foreign key constraints
DELETE FROM public.inspection_items;

-- Then delete inspections
DELETE FROM public.inspections;

-- Finally delete clients
DELETE FROM public.clients;

-- Reset the sequence if needed (optional)
-- This is useful if you want to start IDs from 1 again
ALTER SEQUENCE IF EXISTS clients_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS inspections_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS inspection_items_id_seq RESTART WITH 1;