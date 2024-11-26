-- First clear existing inspection data
TRUNCATE inspection_items CASCADE;
TRUNCATE inspections CASCADE;

-- Get first 5 client IDs
WITH client_ids AS (
  SELECT id FROM clients LIMIT 5
), test_inspections AS (
  -- Insert inspections
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
    id as client_id,
    date_value as inspection_date,
    location,
    'Test Inspector' as inspector,
    status,
    notes,
    true as cover_page
  FROM client_ids
  CROSS JOIN (
    VALUES 
      (CURRENT_DATE - interval '5 days', 'Main Building', 'completed', 'Regular monthly inspection'),
      (CURRENT_DATE + interval '7 days', 'North Wing', 'scheduled', 'Upcoming quarterly check'),
      (CURRENT_DATE - interval '2 days', 'South Wing', 'failed', 'Failed inspection - needs follow-up'),
      (CURRENT_DATE + interval '14 days', 'East Wing', 'scheduled', 'Annual certification due'),
      (CURRENT_DATE - interval '1 day', 'West Wing', 'completed', 'Emergency inspection completed')
  ) as v(date_value, location, status, notes)
  RETURNING id, status
)
-- Insert items for each inspection with row numbers
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
  i.id,
  'Fire Extinguisher',
  'Floor ' || f.num,
  'Room ' || r.num || LPAD(ROW_NUMBER() OVER (PARTITION BY i.id ORDER BY f.num, r.num, e.type)::text, 3, '0'),
  e.type,
  CASE 
    WHEN i.status = 'completed' THEN 'pass'
    WHEN i.status = 'failed' THEN 'fail'
    ELSE 'pass'
  END,
  CASE 
    WHEN i.status = 'completed' THEN 'Regular inspection passed'
    WHEN i.status = 'failed' THEN 'Maintenance required'
    ELSE 'Pending inspection'
  END
FROM 
  test_inspections i
  CROSS JOIN (SELECT generate_series(1, 3) as num) f
  CROSS JOIN (SELECT generate_series(1, 2) as num) r
  CROSS JOIN (VALUES ('2.5ABC'), ('5ABC'), ('10ABC')) as e(type);

-- Verify the data with item counts and details
SELECT 
  i.inspection_date,
  c.name as client_name,
  i.inspector,
  i.location,
  i.status,
  COUNT(ii.id) as item_count,
  string_agg(ii.room, ', ' ORDER BY ii.room) as items
FROM 
  inspections i
  JOIN clients c ON i.client_id = c.id
  LEFT JOIN inspection_items ii ON i.id = ii.inspection_id
GROUP BY 
  i.inspection_date,
  c.name,
  i.inspector,
  i.location,
  i.status
ORDER BY 
  i.inspection_date;