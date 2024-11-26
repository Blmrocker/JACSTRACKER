-- First clear existing inspection data
DELETE FROM inspection_items;
DELETE FROM inspections;

-- Insert test inspections
WITH new_inspections AS (
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
    d.date_value as inspection_date,
    d.location,
    'Test' as inspector,
    d.status,
    d.inspection_notes as notes,
    true as cover_page
  FROM 
    clients c
  CROSS JOIN (
    SELECT * FROM (VALUES 
      (CURRENT_DATE - interval '5 days', 'Main Building', 'completed', 'Monthly inspection completed'),
      (CURRENT_DATE + interval '10 days', 'North Wing', 'scheduled', 'Scheduled maintenance check'),
      (CURRENT_DATE - interval '2 days', 'South Wing', 'failed', 'Multiple units need replacement'),
      (CURRENT_DATE + interval '15 days', 'East Building', 'scheduled', 'Annual certification inspection'),
      (CURRENT_DATE - interval '1 day', 'West Building', 'completed', 'Quarterly inspection completed')
    ) AS d(date_value, location, status, inspection_notes)
  ) d
  WHERE c.id IN (SELECT id FROM clients LIMIT 5)
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
  i.id as inspection_id,
  'Fire Extinguisher' as item_type,
  'Floor ' || floor_num as floor,
  'Room ' || LPAD(ROW_NUMBER() OVER (PARTITION BY i.id ORDER BY floor_num)::text, 3, '0') as room,
  equipment_type,
  CASE 
    WHEN i.status = 'completed' THEN 'pass'
    WHEN i.status = 'failed' THEN 'fail'
    ELSE 'pass'
  END as status,
  CASE 
    WHEN i.status = 'failed' THEN 'Needs maintenance'
    WHEN i.status = 'completed' THEN 'Regular inspection passed'
    ELSE 'Pending inspection'
  END as notes
FROM 
  new_inspections i
  CROSS JOIN generate_series(1, 3) as floor_num
  CROSS JOIN (VALUES ('2.5ABC'), ('5ABC'), ('10ABC')) as e(equipment_type);

-- Verify the inserted data
SELECT 
  i.inspection_date,
  c.name as client_name,
  i.inspector,
  i.location,
  i.status,
  i.notes as inspection_notes,
  COUNT(ii.id) as num_items
FROM 
  inspections i
  JOIN clients c ON i.client_id = c.id
  LEFT JOIN inspection_items ii ON i.id = ii.inspection_id
GROUP BY 
  i.inspection_date,
  c.name,
  i.inspector,
  i.location,
  i.status,
  i.notes
ORDER BY 
  i.inspection_date;