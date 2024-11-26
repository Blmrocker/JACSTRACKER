-- First, let's clear any existing inspection items and inspections
DELETE FROM inspection_items;
DELETE FROM inspections;

-- Insert inspections for each client
WITH dates AS (
  SELECT 
    generate_series(
      current_date - interval '60 days',
      current_date + interval '30 days',
      interval '30 days'
    ) as inspection_date
),
client_inspections AS (
  INSERT INTO inspections (
    client_id,
    inspection_date,
    location,
    inspector,
    status,
    notes,
    cover_page
  )
  SELECT 
    c.id as client_id,
    d.inspection_date,
    CASE 
      WHEN c.name LIKE '%Hotel%' THEN 'Floor ' || (random() * 10 + 1)::integer
      ELSE 'Main Building'
    END as location,
    CASE floor(random() * 3)
      WHEN 0 THEN 'John Smith'
      WHEN 1 THEN 'Maria Rodriguez'
      ELSE 'David Johnson'
    END as inspector,
    CASE 
      WHEN d.inspection_date < current_date THEN 'completed'
      WHEN d.inspection_date = current_date THEN 
        CASE WHEN random() < 0.7 THEN 'completed' ELSE 'failed' END
      ELSE 'scheduled'
    END as status,
    CASE 
      WHEN d.inspection_date < current_date THEN 'Regular maintenance completed'
      WHEN d.inspection_date = current_date THEN 'Current inspection'
      ELSE 'Scheduled maintenance'
    END as notes,
    true as cover_page
  FROM clients c
  CROSS JOIN dates d
  RETURNING id, client_id, status
)
-- Insert inspection items for each inspection
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
  ci.id as inspection_id,
  'Fire Extinguisher' as item_type,
  'Floor ' || floor(random() * 5 + 1)::text as floor,
  'Room ' || floor(random() * 100 + 1)::text as room,
  CASE floor(random() * 4)
    WHEN 0 THEN '2.5ABC'
    WHEN 1 THEN '5ABC'
    WHEN 2 THEN '10ABC'
    ELSE '20ABC'
  END as equipment_type,
  CASE 
    WHEN ci.status = 'completed' THEN 
      CASE WHEN random() < 0.9 THEN 'pass' ELSE 'fail' END
    WHEN ci.status = 'failed' THEN 'fail'
    ELSE 'pass'
  END as status,
  CASE 
    WHEN ci.status = 'failed' THEN 'Needs maintenance'
    WHEN ci.status = 'completed' THEN 'Regular inspection passed'
    ELSE 'Pending inspection'
  END as notes
FROM client_inspections ci
CROSS JOIN generate_series(1, floor(random() * 5 + 3)::integer);

-- Verify the data
SELECT 
  i.inspection_date,
  i.location,
  i.inspector,
  i.status as inspection_status,
  c.name as client_name,
  COUNT(ii.id) as total_items,
  SUM(CASE WHEN ii.status = 'pass' THEN 1 ELSE 0 END) as passed_items,
  SUM(CASE WHEN ii.status = 'fail' THEN 1 ELSE 0 END) as failed_items
FROM 
  inspections i
  JOIN clients c ON i.client_id = c.id
  LEFT JOIN inspection_items ii ON i.id = ii.inspection_id
GROUP BY 
  i.id,
  i.inspection_date,
  i.location,
  i.inspector,
  i.status,
  c.name
ORDER BY 
  i.inspection_date DESC;