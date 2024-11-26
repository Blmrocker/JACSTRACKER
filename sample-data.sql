-- First clear existing data
DELETE FROM inspection_items;
DELETE FROM inspections;
DELETE FROM clients;

-- Insert sample clients
INSERT INTO clients (
  name,
  point_of_contact,
  inspection_type,
  frequency,
  phone,
  street_address,
  city,
  state,
  zip_code,
  email,
  notes,
  contract_start,
  contract_end,
  contract_amount
) VALUES
  ('Valley Medical Center', 'Dr. Sarah Johnson', 'FE', 'Annual', '(555) 123-4567', '789 Healthcare Ave', 'Riverside', 'CA', '92501', 'sjohnson@valleymed.com', 'Multiple buildings, requires coordination', '2024-01-01', '2024-12-31', 4800.00),
  ('Grand Hotel & Suites', 'Michael Chen', 'FE', 'Quarterly', '(555) 234-5678', '456 Hospitality Blvd', 'Riverside', 'CA', '92502', 'mchen@grandhotel.com', '15 story building', '2024-01-01', '2024-12-31', 6000.00),
  ('Riverside School District', 'Amanda Martinez', 'FE', 'Annual', '(555) 345-6789', '123 Education St', 'Riverside', 'CA', '92503', 'amartinez@rsd.edu', 'Multiple schools in district', '2024-01-01', '2024-12-31', 12000.00),
  ('City Mall', 'Robert Wilson', 'FE', 'Monthly', '(555) 456-7890', '321 Shopping Center Dr', 'Riverside', 'CA', '92504', 'rwilson@citymall.com', 'High traffic areas', '2024-01-01', '2024-12-31', 8400.00),
  ('Tech Solutions Inc', 'Lisa Park', 'FE', 'Semi-Annual', '(555) 567-8901', '555 Innovation Way', 'Riverside', 'CA', '92505', 'lpark@techsolutions.com', 'Server rooms require special attention', '2024-01-01', '2024-12-31', 3600.00);

-- Insert sample inspections
INSERT INTO inspections (
  client_id,
  inspection_date,
  location,
  inspector,
  status,
  notes
)
SELECT 
  id as client_id,
  '2024-03-15' as inspection_date,
  'Main Building' as location,
  'John Smith' as inspector,
  'completed' as status,
  'Annual inspection completed successfully'
FROM clients
WHERE name = 'Valley Medical Center'
UNION ALL
SELECT 
  id as client_id,
  '2024-03-10' as inspection_date,
  'Tower A' as location,
  'Maria Rodriguez' as inspector,
  'completed' as status,
  'Quarterly inspection - all units checked'
FROM clients
WHERE name = 'Grand Hotel & Suites'
UNION ALL
SELECT 
  id as client_id,
  '2024-03-20' as inspection_date,
  'Elementary School' as location,
  'David Johnson' as inspector,
  'scheduled' as status,
  'Regular maintenance inspection'
FROM clients
WHERE name = 'Riverside School District';

-- Insert sample inspection items
INSERT INTO inspection_items (
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
  'Floor ' || floor((random() * 5) + 1)::text as floor,
  'Room ' || floor((random() * 500) + 1)::text as room,
  CASE floor(random() * 4)
    WHEN 0 THEN '2.5ABC'
    WHEN 1 THEN '5ABC'
    WHEN 2 THEN '10ABC'
    ELSE '20ABC'
  END as equipment_type,
  CASE floor(random() * 3)
    WHEN 0 THEN 'pass'
    WHEN 1 THEN 'fail'
    ELSE 'no-access'
  END as status,
  CASE floor(random() * 3)
    WHEN 0 THEN 'Regular maintenance'
    WHEN 1 THEN 'Needs recharge'
    ELSE 'Requires replacement'
  END as notes
FROM inspections i
CROSS JOIN generate_series(1, 5);