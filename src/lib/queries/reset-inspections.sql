-- First, drop existing tables in correct order
DROP TABLE IF EXISTS public.inspection_items;
DROP TABLE IF EXISTS public.inspections;

-- Recreate inspections table with proper structure
CREATE TABLE public.inspections (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
    inspection_date date NOT NULL,
    location text NOT NULL,
    inspector text NOT NULL,
    status text CHECK (status IN ('scheduled', 'completed', 'failed')) NOT NULL,
    notes text,
    cover_page boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by uuid REFERENCES auth.users
);

-- Recreate inspection_items table with proper structure
CREATE TABLE public.inspection_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    inspection_id uuid REFERENCES public.inspections(id) ON DELETE CASCADE,
    item_type text NOT NULL,
    floor text NOT NULL,
    room text NOT NULL,
    equipment_type text NOT NULL,
    status text CHECK (status IN ('pass', 'fail', 'no-access')) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_inspections_client_id ON public.inspections(client_id);
CREATE INDEX idx_inspections_date ON public.inspections(inspection_date);
CREATE INDEX idx_inspection_items_inspection_id ON public.inspection_items(inspection_id);

-- Enable RLS
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inspections
CREATE POLICY "inspection_select_policy" ON public.inspections
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "inspection_insert_policy" ON public.inspections
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "inspection_update_policy" ON public.inspections
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "inspection_delete_policy" ON public.inspections
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for inspection items
CREATE POLICY "inspection_items_select_policy" ON public.inspection_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "inspection_items_insert_policy" ON public.inspection_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "inspection_items_update_policy" ON public.inspection_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "inspection_items_delete_policy" ON public.inspection_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_inspections_updated_at
    BEFORE UPDATE ON public.inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_items_updated_at
    BEFORE UPDATE ON public.inspection_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample inspection for testing
INSERT INTO public.inspections (
    client_id,
    inspection_date,
    location,
    inspector,
    status,
    notes
)
SELECT 
    id as client_id,
    CURRENT_DATE as inspection_date,
    'Main Building' as location,
    'John Smith' as inspector,
    'completed' as status,
    'Initial test inspection' as notes
FROM public.clients
LIMIT 1;

-- Insert sample inspection items
INSERT INTO public.inspection_items (
    inspection_id,
    item_type,
    floor,
    room,
    equipment_type,
    status,
    notes
)
SELECT 
    i.id as inspection_id,
    'Fire Extinguisher' as item_type,
    'Floor 1' as floor,
    'Room 101' as room,
    '5ABC' as equipment_type,
    'pass' as status,
    'Regular inspection' as notes
FROM public.inspections i
LIMIT 1;